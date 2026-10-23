/**
 * The battle stage: a close framing of the ancient chamber with Adrian on the
 * left and the Covenant Guardian on the right. All motion here is presentation
 * only; it reacts to events from the store and never changes battle state.
 */
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { CHARACTERS } from '../../data/characters';
import { FollowCamera } from '../camera/FollowCamera';
import { CAMERA_PITCH_DEG } from '../core/constants';
import { gameStore, useGame, type ActiveBattle } from '../core/gameStore';
import { frameColumn } from '../player/animation';
import { setSpriteFrame, SPRITE_WORLD_HEIGHT, useCharacterTexture } from '../player/spriteBody';
import { Brazier } from '../scenes/AncientChamber';
import { getInsigniaTexture } from '../scenes/insignia';
import type { BattleEvent } from './battle';
import { getGuardianTexture, GUARDIAN_H, GUARDIAN_W } from './guardianSprite';

const PLAYER_POS = new THREE.Vector3(-2.3, 0, 0.7);
const ENEMY_POS = new THREE.Vector3(2.0, 0, -0.5);
const CAMERA_TARGET = new THREE.Vector3(0, 0, 0.2);
/** Keep floating numbers below the HUD layer (drei defaults to a huge z-index). */
const POPUP_Z: [number, number] = [5, 0];

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const GUARDIAN_WIDTH = 2.3;
const GUARDIAN_HEIGHT = GUARDIAN_WIDTH * (GUARDIAN_H / GUARDIAN_W) * HEIGHT_COMP;

/** Timing of an action animation, in seconds. */
const LUNGE_TIME = 0.45;
const HIT_TIME = 0.2; // when the blow lands
const HURT_TIME = 0.45;

/** Forward offset (0..1) of a quick lunge-and-return. */
function lunge(t: number): number {
  if (t >= LUNGE_TIME) return 0;
  return Math.sin((t / LUNGE_TIME) * Math.PI);
}

/** Sideways shake and whether to show the hit flash, for the side taking damage. */
function hurt(t: number): { shake: number; flash: boolean } {
  const k = t - HIT_TIME;
  if (k < 0 || k > HURT_TIME) return { shake: 0, flash: false };
  return {
    shake: Math.sin(k * 70) * 0.09 * (1 - k / HURT_TIME),
    flash: Math.floor(k * 16) % 2 === 0,
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
  return (
    <>
      <color attach="background" args={['#05060a']} />
      <ambientLight intensity={0.35} color="#8aa0c0" />
      <directionalLight position={[-3, 9, 6]} intensity={0.8} color="#c8d4ec" />

      {/* Stone floor */}
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 7 }, (_, j) => (
          <mesh key={`${i}-${j}`} rotation-x={-Math.PI / 2} position={[-5.5 + i, 0, -2.6 + j]}>
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial color={(i + j) % 2 ? '#4b545c' : '#454d55'} />
          </mesh>
        )),
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#1c2127" />
      </mesh>
      {/* Back wall with the carved sign */}
      <mesh position={[0, 1.6, -3.3]}>
        <boxGeometry args={[13, 3.2, 0.4]} />
        <meshStandardMaterial color="#3a434c" />
      </mesh>
      <mesh position={[0, 1.9, -3.09]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial map={getInsigniaTexture('#8fa3b8')} transparent alphaTest={0.3} />
      </mesh>
      <Brazier x={-4.2} z={-2.6} />
      <Brazier x={4.2} z={-2.6} />

      {/* Glowing sign the Guardian rose from */}
      <mesh rotation-x={-Math.PI / 2} position={[ENEMY_POS.x, 0.02, ENEMY_POS.z]}>
        <planeGeometry args={[2.8, 2.8]} />
        <meshBasicMaterial
          map={getInsigniaTexture('#ffe08a')}
          transparent
          opacity={0.7}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <BattlePlayer />
      <BattleGuardian />
      <DamagePopups />
      <FollowCamera target={target} viewHeight={7} />
    </>
  );
}

function BattlePlayer() {
  const texture = useCharacterTexture(CHARACTERS.adrian);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const shield = useRef<THREE.Mesh>(null);
  const shieldMat = useRef<THREE.MeshBasicMaterial>(null);
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
    let walking = false;
    let flash = false;
    if (c.event?.actor === 'player' && c.event.kind !== 'defend') {
      x += lunge(c.t) * 1.1;
      walking = c.t < LUNGE_TIME;
    } else if (c.event?.kind === 'enemy_attack') {
      const h = hurt(c.t);
      x += h.shake;
      flash = h.flash;
    }
    group.current.position.set(x, 0, PLAYER_POS.z);
    setSpriteFrame(texture, 'east', walking ? frameColumn(true, c.t) : frameColumn(false, idle.current));
    mat.current.color.set(flash ? '#ff7070' : '#ffffff');

    // Collapse sideways on defeat; stand back up on retry.
    fall.current = b.stage === 'defeat' ? Math.min(1, fall.current + dt * 2.5) : 0;
    body.current.rotation.z = fall.current * (Math.PI / 2);
    if (b.stage === 'defeat') mat.current.color.set('#8a8a9a');

    // Defend shield shimmers while the guard is up.
    if (shield.current && shieldMat.current) {
      shield.current.visible = b.state.defending;
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
        <mesh position-y={SPRITE_WORLD_HEIGHT / 2}>
          <planeGeometry args={[1, SPRITE_WORLD_HEIGHT]} />
          <meshBasicMaterial ref={mat} map={texture} alphaTest={0.5} toneMapped={false} />
        </mesh>
      </group>
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

function BattleGuardian() {
  const texture = getGuardianTexture();
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
      x -= lunge(c.t) * 1.3;
    } else if (c.event?.kind === 'attack' || c.event?.kind === 'skill') {
      const h = hurt(c.t);
      x += h.shake;
      flash = h.flash;
    }
    // Slow, heavy hover
    const y = Math.sin(time.current * 1.4) * 0.06;
    group.current.position.set(x, y, ENEMY_POS.z);
    mat.current.color.set(flash ? '#ff8a8a' : '#ffffff');

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
        <mesh position-y={GUARDIAN_HEIGHT / 2}>
          <planeGeometry args={[GUARDIAN_WIDTH, GUARDIAN_HEIGHT]} />
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
    </group>
  );
}

/** Floating damage numbers anchored above whoever was hit. */
function DamagePopups() {
  const seq = useGame((s) => s.battle?.seq ?? 0);
  const event = useGame((s) => s.battle?.lastEvent ?? null);
  if (!event) return null;

  if (event.kind === 'defend') {
    return (
      <Html key={seq} position={[PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z]} center zIndexRange={POPUP_Z}>
        <div className="battle-popup guard">Guard!</div>
      </Html>
    );
  }
  const onEnemy = event.actor === 'player';
  const pos = onEnemy
    ? [ENEMY_POS.x, GUARDIAN_HEIGHT * 0.85, ENEMY_POS.z]
    : [PLAYER_POS.x, SPRITE_WORLD_HEIGHT + 0.3, PLAYER_POS.z];
  return (
    <Html key={seq} position={pos as [number, number, number]} center zIndexRange={POPUP_Z}>
      <div className={`battle-popup${event.kind === 'skill' ? ' skill' : ''}${onEnemy ? '' : ' hurt'}`}>
        -{event.damage}
      </div>
    </Html>
  );
}
