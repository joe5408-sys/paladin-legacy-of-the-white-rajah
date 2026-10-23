/**
 * Reusable interaction logic: what the player can interact with, and which
 * target is currently in range. Pure functions, no React or Three.js.
 */
import type { CharacterId } from '../../data/characters';
import type { Vec2 } from '../core/collision';
import type { DialogueRule } from '../dialogue/types';

export type InteractionKind = 'talk' | 'inspect' | 'collect' | 'activate' | 'enter';

export interface Interactable {
  id: string;
  kind: InteractionKind;
  /** Name used in the prompt, e.g. "Uncle Lim" → "[E] Talk to Uncle Lim". */
  label: string;
  x: number;
  z: number;
  /** Player must be within this distance (ground plane) to interact. */
  radius: number;
  /** Conversation chosen by story flags (talk / inspect). */
  dialogue?: DialogueRule[];
  /** NPC that turns to face the player while talking. */
  npc?: CharacterId;
}

const VERBS: Record<InteractionKind, string> = {
  talk: 'Talk to',
  inspect: 'Inspect',
  collect: 'Pick up',
  activate: 'Use',
  enter: 'Enter',
};

export function promptText(target: Interactable): string {
  return `${VERBS[target.kind]} ${target.label}`;
}

/** Nearest interactable whose radius contains the position, or null. */
export function findNearestInteractable(
  pos: Vec2,
  targets: readonly Interactable[],
): Interactable | null {
  let best: Interactable | null = null;
  let bestDist = Infinity;
  for (const t of targets) {
    const d = Math.hypot(pos.x - t.x, pos.z - t.z);
    if (d <= t.radius && d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}
