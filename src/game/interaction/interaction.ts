/**
 * Reusable interaction logic: what the player can interact with, and which
 * target is currently in range. Pure functions, no React or Three.js.
 */
import type { CharacterId } from '../../data/characters';
import type { SceneId } from '../../data/scenes';
import type { Vec2 } from '../core/collision';
import { meetsCondition, type Condition, type StoryFlags } from '../core/flags';
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
  /** Only exists while this story condition holds. */
  when?: Condition;
  /** Conversation chosen by story flags (talk / inspect / activate). */
  dialogue?: DialogueRule[];
  /** Scene change (enter). */
  enter?: { scene: SceneId; spawn: string };
  /** NPC that turns to face the player while talking. */
  npc?: CharacterId;
  /** Overrides the kind's verb in the prompt, e.g. "Stand in" → "[E] Stand in the Petitioner's Place". */
  verb?: string;
}

const VERBS: Record<InteractionKind, string> = {
  talk: 'Talk to',
  inspect: 'Inspect',
  collect: 'Pick up',
  activate: 'Touch',
  enter: 'Enter',
};

export function promptText(target: Interactable): string {
  return `${target.verb ?? VERBS[target.kind]} ${target.label}`;
}

export function isAvailable(target: Interactable, flags: StoryFlags): boolean {
  return meetsCondition(target.when, flags);
}

/** Nearest available interactable whose radius contains the position, or null. */
export function findNearestInteractable(
  pos: Vec2,
  targets: readonly Interactable[],
  flags: StoryFlags = {},
): Interactable | null {
  let best: Interactable | null = null;
  let bestDist = Infinity;
  for (const t of targets) {
    if (!isAvailable(t, flags)) continue;
    const d = Math.hypot(pos.x - t.x, pos.z - t.z);
    if (d <= t.radius && d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}
