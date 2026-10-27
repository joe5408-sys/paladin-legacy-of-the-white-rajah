/**
 * Touch controls: the joystick's direction logic. (The controls themselves send
 * ordinary key events, so the rest of the game is covered by its existing tests.)
 */
import { describe, expect, it } from 'vitest';
import { joystickKey } from '../../src/game/input/touch';
import { directionForKey } from '../../src/game/core/input';

describe('joystickKey', () => {
  it('ignores small movements inside the dead zone', () => {
    expect(joystickKey(0, 0, 10)).toBeNull();
    expect(joystickKey(6, -6, 10)).toBeNull();
  });

  it('picks the dominant axis, with screen-down meaning south', () => {
    expect(joystickKey(30, 5, 10)).toBe('ArrowRight');
    expect(joystickKey(-30, 12, 10)).toBe('ArrowLeft');
    expect(joystickKey(4, 30, 10)).toBe('ArrowDown');
    expect(joystickKey(-8, -30, 10)).toBe('ArrowUp');
  });

  it('sends keys the movement code already understands', () => {
    expect(directionForKey(joystickKey(0, -20, 5)!)).toBe('north');
    expect(directionForKey(joystickKey(0, 20, 5)!)).toBe('south');
    expect(directionForKey(joystickKey(20, 0, 5)!)).toBe('east');
    expect(directionForKey(joystickKey(-20, 0, 5)!)).toBe('west');
  });
});
