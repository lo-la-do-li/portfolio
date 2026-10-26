'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ProjectImage } from '../types';

const controlClass =
  'flex h-10 w-10 items-center justify-center border border-rule bg-bg text-xl text-fg transition-colors hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:opacity-30';

export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  // Which image the lightbox opened on (null = closed), and which one is in view now
  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const track = trackRef.current;
    if (startIndex === null || !dialog || !track) return;

    // showModal() puts the dialog in the browser's top layer, above every
    // stacking context (sticky header included), makes the page behind it
    // inert, closes on Escape and moves focus to the first control (Close)
    if (!dialog.open) dialog.showModal();
    // Jump straight to the tapped image; only later moves animate
    track.scrollTo({ left: startIndex * track.clientWidth, behavior: 'instant' });
  }, [startIndex]);

  if (images.length === 0) return null;

  const last = images.length - 1;

  function go(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.min(Math.max(index, 0), last);
    // No behavior given, so the track's CSS decides: smooth, or instant under reduced motion
    track.scrollTo({ left: target * track.clientWidth });
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setCurrent(index);
              setStartIndex(index);
            }}
            aria-label={`Enlarge: ${image.alt}`}
            // Poster mat: a fine rule with a margin of background around the screenshot
            className="group block border border-rule-soft p-1.5 transition-colors hover:border-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="relative block aspect-video overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        // Always dark, whatever the page theme: light screenshots need a dark
        // backdrop to show their edges (scoped theming via the semantic tokens)
        data-theme="dark"
        aria-label="Project screenshots"
        // Escape, Close and backdrop taps all end here, so state and focus stay in sync
        onClose={() => {
          setStartIndex(null);
          triggerRef.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            go(current + (e.key === 'ArrowLeft' ? -1 : 1));
          }
        }}
        // A tap on the backdrop (anything but the image or a control) closes
        onClick={(e) => {
          if (e.target instanceof Element && !e.target.closest('img, button')) {
            dialogRef.current?.close();
          }
        }}
        // Phones: image full width, controls in a bar below it.
        // sm+: arrows flank the image, outside it. One set of buttons, placed by grid.
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-y-4 bg-bg/95 py-4 text-fg backdrop:bg-transparent open:grid sm:gap-x-4 sm:px-4"
      >
        {startIndex !== null && (
          <>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className={`${controlClass} col-start-3 row-start-1 mr-4 justify-self-end sm:mr-0`}
            >
              &times;
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => go(current - 1)}
                aria-label="Previous image"
                aria-disabled={current === 0}
                className={`${controlClass} col-start-1 row-start-3 ml-4 self-center sm:row-start-2 sm:ml-0`}
              >
                &lsaquo;
              </button>
            )}

            {/* Native horizontal scroll with snap points: swiping is the
                browser's own momentum scroll, and the arrows scroll the same track */}
            <div
              ref={trackRef}
              onScroll={(e) =>
                setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
              }
              className="col-span-3 col-start-1 row-start-2 flex snap-x snap-mandatory overflow-x-auto overscroll-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto sm:col-span-1 sm:col-start-2"
            >
              {images.map((image, index) => (
                <div
                  key={image.src}
                  className="w-full shrink-0 snap-center snap-always px-4 sm:px-0"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 640px) 80vw, 100vw"
                      loading={index === startIndex ? 'eager' : 'lazy'}
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  aria-label="Next image"
                  aria-disabled={current === last}
                  className={`${controlClass} col-start-3 row-start-3 mr-4 self-center justify-self-end sm:row-start-2 sm:mr-0`}
                >
                  &rsaquo;
                </button>

                <p
                  aria-live="polite"
                  className="col-start-2 row-start-3 self-center text-center font-mono text-xs uppercase tracking-[0.14em] text-muted"
                >
                  {current + 1} / {images.length}
                </p>
              </>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
