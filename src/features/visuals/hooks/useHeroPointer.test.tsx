import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useHeroPointer, type HeroPointer } from './useHeroPointer';

const pointer: HeroPointer = { x: 0, y: 0, active: false };

function Harness({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerRef = useRef(pointer);
  useHeroPointer(ref, pointerRef, enabled);
  return (
    <div
      ref={(el) => {
        ref.current = el;
        // 200×100 box at (100, 50)
        if (el) el.getBoundingClientRect = () => new DOMRect(100, 50, 200, 100);
      }}
    />
  );
}

function move(x: number, y: number, pointerType = 'mouse') {
  const event = new MouseEvent('pointermove', { clientX: x, clientY: y });
  fireEvent(window, Object.assign(event, { pointerType }));
}

describe('useHeroPointer', () => {
  it('maps the mouse to -1..1 within the element, y up', () => {
    render(<Harness />);
    move(200, 100); // center
    expect(pointer).toMatchObject({ x: 0, y: 0, active: true });
    move(300, 50); // top-right corner
    expect(pointer).toMatchObject({ x: 1, y: 1, active: true });
  });

  it('is inactive when the mouse is outside the element', () => {
    render(<Harness />);
    move(200, 100);
    move(50, 100);
    expect(pointer.active).toBe(false);
  });

  it('ignores touch', () => {
    render(<Harness />);
    pointer.active = false;
    move(200, 100, 'touch');
    expect(pointer.active).toBe(false);
  });

  it('does nothing when disabled', () => {
    render(<Harness enabled={false} />);
    move(200, 100);
    expect(pointer.active).toBe(false);
  });
});
