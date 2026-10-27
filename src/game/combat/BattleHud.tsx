import { useEffect, useRef, useState } from 'react';
import type { PlayerBattleStats } from '../../data/encounters';
import { gameStore, useGame, type BattleStage } from '../core/gameStore';
import { canUse, COMMAND_INFO, type Command } from './battle';
import { useTouchDevice } from '../input/touch';

/** Commands on the menu: River Ward appears once Adrian knows it. */
function commandsFor(player: PlayerBattleStats): Command[] {
  return player.ward ? ['attack', 'skill', 'ward', 'defend'] : ['attack', 'skill', 'defend'];
}

/** How long each automatic stage stays on screen before moving on (ms). */
const STAGE_DELAY: Partial<Record<BattleStage, number>> = {
  intro: 1900,
  player_action: 1150,
  enemy_action: 1150,
};

const CONFIRM_KEYS = new Set(['KeyE', 'Enter', 'Space', 'NumpadEnter']);
const UP_KEYS = new Set(['ArrowUp', 'KeyW']);
const DOWN_KEYS = new Set(['ArrowDown', 'KeyS']);

/** Battle interface: status panels, command menu, battle log, result screens. */
export function BattleHud() {
  const battle = useGame((s) => s.battle);
  const paused = useGame((s) => s.paused);
  const touch = useTouchDevice();
  const [selected, setSelected] = useState<Command>('attack');
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const stage = battle?.stage;
  const state = battle?.state;

  // Automatic pacing of non-interactive stages (held while paused).
  useEffect(() => {
    const delay = stage ? STAGE_DELAY[stage] : undefined;
    if (delay === undefined || paused) return;
    const t = setTimeout(() => gameStore.getState().advanceBattle(), delay);
    return () => clearTimeout(t);
  }, [stage, battle?.seq, paused]);

  // Never leave the cursor on a command that has become unavailable.
  useEffect(() => {
    if (state && stage === 'command' && !canUse(state, selected)) setSelected('attack');
  }, [state, stage, selected]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const s = gameStore.getState();
      const b = s.battle;
      if (!b || s.paused) return;
      const usable = commandsFor(b.player).filter((c) => canUse(b.state, c));

      if (b.stage === 'command') {
        if (UP_KEYS.has(e.code) || DOWN_KEYS.has(e.code)) {
          e.preventDefault();
          const step = UP_KEYS.has(e.code) ? -1 : 1;
          setSelected((cur) => {
            const i = usable.indexOf(cur);
            return usable[(i + step + usable.length) % usable.length] ?? 'attack';
          });
        } else if (CONFIRM_KEYS.has(e.code)) {
          e.preventDefault();
          s.chooseCommand(selectedRef.current);
        }
        return;
      }
      if (!CONFIRM_KEYS.has(e.code)) return;
      e.preventDefault();
      if (b.stage === 'defeat') s.retryBattle();
      else s.advanceBattle(); // continue after victory, or skip the wait on messages
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!battle || !state) return null;
  const { encounter, player } = battle;
  const showTutorial = encounter.tutorial && state.turn === 1 && stage === 'command';
  const showTip = !encounter.tutorial && !!encounter.tip && state.turn === 1 && stage === 'command';

  return (
    <div className="battle-ui" data-testid="battle-ui">
      {stage === 'intro' && <div className="battle-flash" />}

      <div className="battle-status enemy pixel-panel" data-testid="enemy-status">
        <div className="battle-name">{encounter.enemyName}</div>
        <HpBar hp={state.enemyHp} max={state.enemyMaxHp} enemy />
        {state.armored && (
          <div className="battle-armored" data-testid="enemy-armored">
            Armoured
          </div>
        )}
        {state.charging && (
          <div className="battle-charging" data-testid="enemy-charging">
            Charging a heavy blow!
          </div>
        )}
      </div>

      <div className="battle-bottom">
        <div className="battle-status player pixel-panel" data-testid="player-status">
          <div className="battle-name">Adrian</div>
          <HpBar hp={state.playerHp} max={state.playerMaxHp} />
          <div className="battle-charges" title="Radiant Strike uses left">
            {player.skillName}{' '}
            {Array.from({ length: player.skillCharges }, (_, i) => (
              <span key={i} className={i < state.skillCharges ? 'pip on' : 'pip'}>◆</span>
            ))}
          </div>
          {player.ward && (
            <div className="battle-charges" title="River Ward uses left">
              {player.ward.name}{' '}
              {Array.from({ length: player.ward.charges }, (_, i) => (
                <span key={i} className={i < state.wardCharges ? 'pip on' : 'pip'}>◆</span>
              ))}
            </div>
          )}
          {state.warded && <div className="battle-guard battle-ward" data-testid="warded">Warded</div>}
          {state.defending && <div className="battle-guard">Guarding</div>}
        </div>

        <div className="battle-message pixel-panel" data-testid="battle-message" aria-live="polite">
          {battle.message}
          {stage === 'command' && (
            <div className="battle-help">{COMMAND_INFO[selected].help(player)}</div>
          )}
        </div>

        <div className="battle-menu pixel-panel" role="menu" aria-label="Battle commands">
          {commandsFor(player).map((cmd) => {
            const usable = stage === 'command' && canUse(state, cmd);
            const label =
              cmd === 'skill'
                ? `${COMMAND_INFO.skill.label} ×${state.skillCharges}`
                : cmd === 'ward'
                  ? `${COMMAND_INFO.ward.label} ×${state.wardCharges}`
                  : COMMAND_INFO[cmd].label;
            return (
              <button
                key={cmd}
                role="menuitem"
                className={`battle-cmd${selected === cmd && stage === 'command' ? ' selected' : ''}`}
                disabled={!usable}
                aria-disabled={!usable}
                data-testid={`cmd-${cmd}`}
                onMouseEnter={() => usable && setSelected(cmd)}
                onClick={() => {
                  setSelected(cmd);
                  gameStore.getState().chooseCommand(cmd);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {showTip && (
        <div className="battle-tutorial pixel-panel" data-testid="battle-tip">
          <strong>Tip</strong> · {encounter.tip}
        </div>
      )}

      {showTutorial && (
        <div className="battle-tutorial pixel-panel" data-testid="battle-tutorial">
          <strong>Battle basics</strong> ·{' '}
          {touch ? (
            <>Tap one action per turn. </>
          ) : (
            <>
              Choose one action per turn with <kbd>↑</kbd>
              <kbd>↓</kbd> and <kbd>E</kbd>.{' '}
            </>
          )}
          <b>Attack</b> deals {player.attack}.{' '}
          <b>{player.skillName}</b> deals {player.skillDamage} but has only{' '}
          {player.skillCharges} uses. <b>Defend</b> halves the next hit.
        </div>
      )}

      {stage === 'victory' && (
        <div className="battle-result victory" data-testid="battle-victory">
          <div className="battle-result-title">Victory</div>
          <button className="battle-cmd selected" onClick={() => gameStore.getState().advanceBattle()}>
            Continue <kbd>E</kbd>
          </button>
        </div>
      )}
      {stage === 'defeat' && (
        <div className="battle-result defeat" data-testid="battle-defeat">
          <div className="battle-result-title">Defeat</div>
          <p>The oath is not broken. Rise and face the test again.</p>
          <button
            className="battle-cmd selected"
            data-testid="retry-battle"
            onClick={() => gameStore.getState().retryBattle()}
          >
            Retry Battle <kbd>E</kbd>
          </button>
        </div>
      )}
    </div>
  );
}

function HpBar({ hp, max, enemy }: { hp: number; max: number; enemy?: boolean }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const low = pct <= 30;
  return (
    <div className="hp-row">
      <span className="hp-label">HP</span>
      <div className="hp-bar" role="meter" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={`hp-fill${enemy ? ' enemy' : ''}${low ? ' low' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="hp-num" data-testid={enemy ? 'enemy-hp' : 'player-hp'}>
        {hp}/{max}
      </span>
    </div>
  );
}
