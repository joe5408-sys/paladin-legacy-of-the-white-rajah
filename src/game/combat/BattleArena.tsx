/**
 * The battle stage: a close framing of the encounter's arena (the ancient chamber
 * or the Archives vault) with Adrian on the left and the enemy on the right. All motion here is presentation
 * only; it reacts to events from the store and never changes battle state.
 */
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CHARACTERS } from '../../data/characters';
import { FollowCamera } from '../camera/FollowCamera';
import { CAMERA_PITCH_DEG } from '../core/constants';
import { gameStore, useGame, type ActiveBattle } from '../core/gameStore';
import { frameColumn } from '../player/animation';
import { SPRITE_WORLD_HEIGHT } from '../player/spriteBody';
import {
  BATTLE_FRAME_H,
  BATTLE_FRAME_W,
  createHeroBattleTexture,
  setBattlePose,
  type BattlePose,
} from './heroBattleSprite';
import { Brazier } from '../scenes/AncientChamber';
import { getInsigniaTexture } from '../scenes/insignia';
import type { BattleEvent } from './battle';
import { getGuardianTexture, getSpiritTexture, GUARDIAN_H, GUARDIAN_W } from './guardianSprite';
import { getSentinelTexture, SENTINEL_H, SENTINEL_W } from './sentinelSprite';
import type { EncounterDef } from '../../data/encounters';

const PLAYER_POS = new THREE.Vector3(-2.3, 0, 0.7);
const ENEMY_POS = new THREE.Vector3(2.0, 0, -0.5);
const CAMERA_TARGET = new THREE.Vector3(0, 0, 0.2);
/** Keep floating numbers below the HUD layer (drei defaults to a huge z-index). */
const POPUP_Z: [number, number] = [5, 0];

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
/** World size and texture of each enemy sprite. */
const ENEMY_SPRITES: Record<EncounterDef['sprite'], { width: number; height: number; texture: () => THREE.Texture }> = {
  guardian: { width: 2.3, height: 2.3 * (GUARDIAN_H / GUARDIAN_W) * HEIGHT_COMP, texture: getGuardianTexture },
  sentinel: { width: 2.2, height: 2.2 * (SENTINEL_H / SENTINEL_W) * HEIGHT_COMP, texture: getSentinelTexture },
  spirit: { width: 2.3, height: 2.3 * (GUARDIAN_H / GUARDIAN_W) * HEIGHT_COMP, texture: getSpiritTexture },
};

/** Colours of each battle backdrop. */
const ARENAS: Record<
  EncounterDef['arena'],
  { sky: string; ambient: string; key: string; floor: [string, string]; under: string; wall: string; sign: string }
> = {
  chamber: {
    sky: '#05060a',
    ambient: '#8aa0c0',
    key: '#c8d4ec',
    floor: ['#4b545c', '#454d55'],
    under: '#1c2127',
    wall: '#3a434c',
    sign: '#8fa3b8',
  },
  vault: {
    sky: '#060505',
    ambient: '#a89880',
    key: '#d8e4f0',
    floor: ['#4a423a', '#433b34'],
    under: '#1d1915',
    wall: '#332c26',
    sign: '#7a6a58',
  },
  // The waystation terrace: mossy paving and a green-shadowed cliff.
  waystation: {
    sky: '#0c1a16',
    ambient: '#9ac8b8',
    key: '#f0f4dc',
    floor: ['#56604c', '#4e5846'],
    under: '#1d2a22',
    wall: '#3c4a3e',
    sign: '#8fd0e0',
  },
};

/** The encounter of the current battle, if any. */
function useEncounter(): EncounterDef | null {
  return useGame((s) => s.battle?.encounter ?? null);
}

/** Timing of an action animation, in seconds. */
const LUNGE_TIME = 0.45;
const HIT_TIME = 0.2; // when the blow lands (sound and damage numbers sync to this)
const HIT_STOP = 0.1; // attacker and target freeze for a beat on impact
const HURT_TIME = 0.45;

/** How far Adrian lunges so the blade tip reaches the Guardian (world units). */
const STRIKE_REACH = 2.45;

const PLAYER_SPRITE_W = BATTLE_FRAME_W / 16; // 16 px per world unit, like every sprite
const PLAYER_SPRITE_H = (BATTLE_FRAME_H / 16) * (1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG)));

/** Forward offset (0..1) of a quick lunge-and-return (the Guardian's attack). */
function lunge(t: number): number {
  if (t >= LUNGE_TIME) return 0;
  return Math.sin((t / LUNGE_TIME) * Math.PI);
}

const easeOut = (k: number) => 1 - (1 - k) * (1 - k);

/**
 * Adrian's sword attack: wind up, dash in, hold on impact (hit-stop), step back.
 * Returns his forward offset and pose, or null once the move is finished.
 */
function playerStrike(t: number): { offset: number; pose: BattlePose } | null {
  const windup = 0.12;
  const recover = 0.62;
  if (t < windup) return { offset: -0.15 * (t / windup), pose: 'windup' };
  if (t < HIT_TIME) {
    const k = (t - windup) / (HIT_TIME - windup);
    return { offset: -0.15 + (STRIKE_REACH + 0.15) * easeOut(k), pose: k < 0.45 ? 'windup' : 'strike' };
  }
  if (t < HIT_TIME + HIT_STOP) return { offset: STRIKE_REACH, pose: 'strike' };
  if (t < recover) {
    const k = (t - HIT_TIME - HIT_STOP) / (recover - HIT_TIME - HIT_STOP);
    return { offset: STRIKE_REACH * (1 - easeOut(k)), pose: k < 0.35 ? 'strike' : 'ready' };
  }
  return null;
}

/** Sideways shake and whether to show the hit flash, for the side taking damage. */
function hurt(t: number): { shake: number; flash: boolean } {
  const k = t - HIT_TIME;
  if (k < 0) return { shake: 0, flash: false };
  if (k < HIT_STOP) return { shake: 0, flash: true }; // frozen on impact
  const s = k - HIT_STOP;
  if (s > HURT_TIME) return { shake: 0, flash: false };
  return {
    shake: Math.sin(s * 70) * 0.09 * (1 - s / HURT_TIME),
    flash: Math.floor(s * 16) % 2 === 0,
  };
}

/** Tracks the latest battle event and how long ago it started. */
function useEventClock() {
  const clock = useRef<{ seq: number; t: number; event: BattleEvent | null }>({
    seq: -1,
    t: 0,
    event: null,
  });
  return (battle: ActiveBattle, dt: number) => {
    const c = clock.current;
    if (battle.seq !== c.seq) {
      c.seq = battle.seq;
      c.t = 0;
      c.event = battle.lastEvent;
    } else {
      c.t += dt;
    }
    return c;
  };
}

export function BattleArena() {
  const target = useRef(CAMERA_TARGET.clone());
  const encounter = useEncounter();
  const arenaId = encounter?.arena ?? 'chamber';
  const arena = ARENAS[arenaId];
  return (
    <>
      <color attach="background" args={[arena.sky]} />
      <ambientLight intensity={0.35} color={arena.ambient} />
      <directionalLight position={[-3, 9, 6]} intensity={0.8} color={arena.key} />

      {/* Stone floor */}
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 7 }, (_, j) => (
          <mesh key={`${i}-${j}`} rotation-x={-Math.PI / 2} position={[-5.5 + i, 0, -2.6 + j]}>
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial color={arena.floor[(i + j) % 2]} />
          </mesh>
        )),
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color={arena.under} />
      </mesh>
      {/* Back wall with the carved sign */}
      <mesh position={[0, 1.6, -3.3]}>
        <boxGeometry args={[13, 3.2, 0.4]} />
        <meshStandardMaterial color={arena.wall} />
      </mesh>
      <mesh position={[0, 1.9, -3.09]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial map={getInsigniaTexture(arena.sign)} transparent alphaTest={0.3} />
      </mesh>
      <Brazier x={-4.2} z={-2.6} />
      <Brazier x={4.2} z={-2.6} />

      {arenaId !== 'vault' ? (
        // Glowing sign the Guardian (or the river spirit) rose from
        <mesh rotation-x={-Math.PI / 2} position={[ENEMY_POS.x, 0.02, ENEMY_POS.z]}>
          <planeGeometry args={[2.8, 2.8]} />
          <meshBasicMaterial
            map={getInsigniaTexture(arenaId === 'waystation' ? '#a8e8ff' : '#ffe08a')}
            transparent
            opacity={0.7}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : (
        // The vault's inner gate behind the Sentinel
        <group position={[ENEMY_POS.x, 0, -3.05]}>
          {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
            <mesh key={x} position={[x, 1.25, 0]}>
              <boxGeometry args={[0.08, 2.5, 0.08]} />
              <meshStandardMaterial color="#25272b" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
          {[0.4, 2.4].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[2.0, 0.1, 0.1]} />
              <meshStandardMaterial color="#25272b" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}

      <BattlePlayer />
      <BattleEnemy />
      <SlashTrail />
      <DamagePopups />
      <FollowCamera target={target} viewHeight={7} />
    </>
  );
}

function BattlePlayer() {
  // Adrian in battle: dedicated poses holding the blade of light.
  const texture = useMemo(() => createHeroBattleTexture(CHARACTERS.adrian), []);
  useEffect(() => () => texture.dispose(), [texture]);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const shield = useRef<THREE.Mesh>(null);
  const shieldMat = useRef<THREE.MeshBasicMaterial>(null);
  const bladeLight = useRef<THREE.PointLight>(null);
  const idle = useRef(0);
  const fall = useRef(0);
  const tick = useEventClock();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const b = gameStore.getState().battle;
    if (!b || !group.current || !body.current || !mat.current) return;
    const c = tick(b, dt);
    idle.current += dt;

    let x = PLAYER_POS.x;
    let pose: BattlePose = frameColumn(false, idle.current) === 0 ? 'ready' : 'ready2';
    let flash = false;
    let striking = false;
    if (c.event?.kind === 'attack' || c.event?.kind === 'skill') {
      const s = playerStrike(c.t);
      if (s) {
        x += s.offset;
        pose = s.pose;
        striking = s.pose === 'strike';
      }
    } else if (c.event?.kind === 'enemy_attack') {
      const h = hurt(c.t);
      x += h.shake;
      flash = h.flash;
    }
    if (b.stage === 'victory') pose = 'windup'; // blade raised in triumph
    group.current.position.set(x, 0, PLAYER_POS.z);
    setBattlePose(texture, pose);
    mat.current.color.set(flash ? '#ff7070' : '#ffffff');

    // The blade glows softly, flaring on each strike (brighter for Radiant Strike).
    if (bladeLight.current) {
      const flare = striking ? (c.event?.kind === 'skill' ? 9 : 5) : 0;
      bladeLight.current.intensity = b.stage === 'defeat' ? 0 : 1.6 + Math.sin(idle.current * 4) * 0.3 + flare;
    }

    // Collapse sideways on defeat; stand back up on retry.
    fall.current = b.stage === 'defeat' ? Math.min(1, fall.current + dt * 2.5) : 0;
    body.current.rotation.z = fall.current * (Math.PI / 2);
    if (b.stage === 'defeat') mat.current.color.set('#8a8a9a');

    // Defend shield shimmers while the guard is up.
    if (shield.current && shieldMat.current) {
      shield.current.visible = b.state.defending || b.state.warded;
      shieldMat.current.color.set(b.state.warded ? '#9ff0e0' : '#7fc8ff');
      shieldMat.current.opacity = 0.35 + Math.sin(idle.current * 6) * 0.12;
    }
  });

  return (
    <group ref={group} position={PLAYER_POS.toArray()}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.34, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* Pivot at the feet so the defeat fall rotates naturally */}
      <group ref={body}>
        {/* 40x32 pose frame: the character is centred, with room for the blade */}
        <mesh position-y={PLAYER_SPRITE_H / 2}>
          <planeGeometry args={[PLAYER_SPRITE_W, PLAYER_SPRITE_H]} />
          <meshBasicMaterial ref={mat} map={texture} alphaTest={0.5} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={bladeLight} position={[0.6, 1.1, 0.4]} color="#ffd98a" intensity={1.6} distance={3} />
      <mesh ref={shield} position={[0.15, SPRITE_WORLD_HEIGHT / 2, 0.2]} visible={false}>
        <circleGeometry args={[1.0, 24]} />
        <meshBasicMaterial
          ref={shieldMat}
          color="#7fc8ff"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function BattleEnemy() {
  const encounter = useEncounter();
  const sprite = ENEMY_SPRITES[encounter?.sprite ?? 'guardian'];
  const texture = sprite.texture();
  const chargeLight = useRef<THREE.PointLight>(null);
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const burst = useRef<THREE.Mesh>(null);
  const burstMat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const time = useRef(0);
  const fade = useRef(0);
  const tick = useEventClock();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const b = gameStore.getState().battle;
    if (!b || !group.current || !mat.current) return;
    const c = tick(b, dt);
    time.current += dt;

    let x = ENEMY_POS.x;
    let flash = false;
    if (c.event?.kind === 'enemy_attack') {
      x -= lunge(c.t) * (c.event.heavy ? 1.7 : 1.3);
    } else if (c.event?.kind === 'attack' || c.event?.kind === 'skill') {
      const h = hurt(c.t);
      x += h.shake;
      flash = h.flash;
    }
    // Slow, heavy hover
    const y = Math.sin(time.current * 1.4) * 0.06;
    group.current.position.set(x, y, ENEMY_POS.z);
    // Winding up a heavy blow: it rears back and pulses white-blue until it strikes.
    const charging = b.state.charging && b.stage !== 'victory';
    const pulse = 0.5 + Math.sin(time.current * 9) * 0.5;
    if (charging) {
      const rear = c.event?.kind === 'enemy_charge' ? Math.min(1, c.t / 0.3) : 1;
      x += rear * 0.35;
    }
    if (chargeLight.current) chargeLight.current.intensity = charging ? 3 + pulse * 5 : 0;
    const tint = charging && pulse > 0.5 ? '#cfe9ff' : '#ffffff';
    mat.current.color.set(flash ? '#ff8a8a' : tint);

    // Victory: the Guardian sinks and fades into light.
    fade.current = b.stage === 'victory' ? Math.min(1, fade.current + dt * 0.8) : 0;
    mat.current.opacity = 1 - fade.current;
    mat.current.transparent = fade.current > 0;
    // Hard pixel edges normally; a low cutoff while fading so it doesn't pop out at 50%.
    mat.current.alphaTest = fade.current > 0 ? 0.02 : 0.5;
    group.current.position.y -= fade.current * 0.6;

    // Radiant Strike burst: an expanding golden ring and a flash of light.
    const skillT = c.event?.kind === 'skill' ? c.t - HIT_TIME : -1;
    const bursting = skillT >= 0 && skillT < 0.6;
    if (burst.current && burstMat.current && light.current) {
      burst.current.visible = bursting;
      const s = 0.3 + Math.max(0, skillT) * 4;
      burst.current.scale.set(s, s, s);
      burstMat.current.opacity = bursting ? 1 - skillT / 0.6 : 0;
      light.current.intensity = bursting ? 25 * (1 - skillT / 0.6) : 0;
    }
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[ENEMY_POS.x, 0.02, ENEMY_POS.z + 0.1]}>
        <circleGeometry args={[0.9, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <group ref={group} position={ENEMY_POS.toArray()}>
        <mesh position-y={sprite.height / 2}>
          <planeGeometry args={[sprite.width, sprite.height]} />
          <meshBasicMaterial ref={mat} map={texture} alphaTest={0.5} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={burst} position={[ENEMY_POS.x, 1.6, ENEMY_POS.z + 0.4]} visible={false}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          ref={burstMat}
          color="#ffe08a"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} position={[ENEMY_POS.x, 1.6, ENEMY_POS.z + 1]} color="#ffd27a" intensity={0} distance={8} />
      <pointLight ref={chargeLight} position={[ENEMY_POS.x + 0.3, 1.8, ENEMY_POS.z + 0.8]} color="#bfe2ff" intensity={0} distance={5} />
    </group>
  );
}

/**
 * The arc of light left by Adrian's blade as it cuts across the Guardian.
 * Radiant Strike leaves a bigger, golden double arc.
 */
function SlashTrail() {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const tick = useEventClock();
  const DURATION = 0.32;

  useFrame((_, rawDt) => {
    const b = gameStore.getState().battle;
    if (!b || !group.current) return;
    const c = tick(b, Math.min(rawDt, 0.1));
    const kind = c.event?.kind;
    const p = (c.t - (HIT_TIME - 0.04)) / DURATION;
    const show = (kind === 'attack' || kind === 'skill') && p >= 0 && p <= 1;
    group.current.visible = show;
    if (!show) return;
    const radiant = kind === 'skill';
    // Sweep from upper-left to lower-right, swelling slightly as it fades.
    group.current.rotation.z = 0.8 - easeOut(p) * 1.5;
    group.current.scale.setScalar((radiant ? 1.45 : 1) * (0.9 + p * 0.25));
    mats.current.forEach((m, i) => {
      if (!m) return;
      m.color.set(radiant ? (i === 0 ? '#fff2c4' : '#ffc85a') : i === 0 ? '#ffffff' : '#bfe2ff');
      m.opacity = (1 - p) * (i === 0 ? 1 : radiant ? 0.85 : 0.5);
    });
  });

  const arcs: Array<[number, number]> = [
    [0.98, 1.16], // bright leading edge
    [0.78, 0.94], // fainter trailing edge
  ];
  return (
    <group ref={group} position={[ENEMY_POS.x - 0.2, 1.55, ENEMY_POS.z + 0.7]} visible={false}>
      {arcs.map(([inner, outer], i) => (
        <mesh key={i}>
          <ringGeometry args={[inner, outer, 40, 1, Math.PI * 0.12, Math.PI * 0.76]} />
          <meshBasicMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floating damage numbers anchored above whoever was hit. */
function DamagePopups() {
  const seq = useGame((s) => s.battle?.seq ?? 0);
  const event = useGame((s) => s.battle?.lastEvent ?? null);
  const encounter = useEncounter();
  if (!event) return null;
  const enemyHeight = ENEMY_SPRITES[encounter?.sprite ?? 'guardian'].height;

  if (event.kind === 'enemy_charge') {
    return (
      <Html key={seq} position={[ENEMY_POS.x, enemyHeight * 0.95, ENEMY_POS.z]} center zIndexRange={POPUP_Z}>
        <div className="battle-popup charge">Charging!</div>
      </Html>
    );
  }

  if (event.kind === 'defend') {
    return (
      <Html key={seq} position={[PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z]} center zIndexRange={POPUP_Z}>
        <div className="battle-popup guard">Guard!</div>
      </Html>
    );
  }
  if (event.kind === 'ward') {
    return (
      <Html key={seq} position={[PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z]} center zIndexRange={POPUP_Z}>
        <div className="battle-popup ward">{event.heal > 0 ? `+${event.heal}` : 'Ward!'}</div>
      </Html>
    );
  }
  if (event.kind === 'enemy_attack' && event.damage === 0) {
    return (
      <Html key={seq} position={[PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z]} center zIndexRange={POPUP_Z}>
        <div className="battle-popup guard blocked">Blocked!</div>
      </Html>
    );
  }
  const onEnemy = event.actor === 'player';
  const pos = onEnemy
    ? [ENEMY_POS.x, enemyHeight * 0.85, ENEMY_POS.z]
    : [PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z];
  return (
    <Html key={seq} position={pos as [number, number, number]} center zIndexRange={POPUP_Z}>
      <div className={`battle-popup${event.kind === 'skill' ? ' skill' : ''}${onEnemy ? '' : ' hurt'}`}>
        -{event.damage}
      </div>
    </Html>
  );
}
