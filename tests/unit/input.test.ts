import { describe, expect, it } from 'vitest';
import { DirectionalInput, directionForKey } from '../../src/game/core/input';
import { frameColumn } from '../../src/game/player/animation';

describe('directionForKey', () => {
  it('maps WASD and arrow keys to four directions', () => {
    expect(directionForKey('KeyW')).toBe('north');
    expect(directionForKey('ArrowUp')).toBe('north');
    expect(directionForKey('KeyS')).toBe('south');
    expect(directionForKey('ArrowDown')).toBe('south');
    expect(directionForKey('KeyA')).toBe('west');
    expect(directionForKey('ArrowLeft')).toBe('west');
    expect(directionForKey('KeyD')).toBe('east');
    expect(directionForKey('ArrowRight')).toBe('east');
    expect(directionForKey('KeyE')).toBeUndefined();
  });
});

describe('DirectionalInput', () => {
  it('is idle with no keys held', () => {
    expect(new DirectionalInput().current()).toBeNull();
  });

  it('uses the most recently pressed key', () => {
    const input = new DirectionalInput();
    input.press('KeyW');
    input.press('KeyD');
    expect(input.current()).toBe('east');
    input.release('KeyD');
    expect(input.current()).toBe('north');
    input.release('KeyW');
    expect(input.current()).toBeNull();
  });

  it('ignores non-movement keys and repeated keydown events', () => {
    const input = new DirectionalInput();
    expect(input.press('KeyE')).toBe(false);
    input.press('KeyA');
    input.press('KeyA');
    input.release('KeyA');
    expect(input.current()).toBeNull();
  });

  it('clears all keys (e.g. on window blur)', () => {
    const input = new DirectionalInput();
    input.press('ArrowUp');
    input.clear();
    expect(input.current()).toBeNull();
  });
});

describe('frameColumn', () => {
  it('cycles walk frames while moving', () => {
    const frames = [0, 0.13, 0.26, 0.38].map((t) => frameColumn(true, t));
    expect(frames).toEqual([2, 0, 3, 0]);
  });

  it('uses idle frames when standing still', () => {
    expect(frameColumn(false, 0)).toBe(0);
    expect(frameColumn(false, 1.6)).toBe(1);
  });
});
