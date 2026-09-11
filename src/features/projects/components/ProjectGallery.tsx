'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ProjectImage } from '../types';

export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) return;
    closeButtonRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openIndex, close, showPrev, showNext]);

  if (images.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setOpenIndex(index);
            }}
            className="group relative aspect-video overflow-hidden rounded-lg border border-white/10"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              className="object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[openIndex].alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl text-white/70 hover:text-white"
          >
            &times;
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous image"
                className="absolute left-4 text-3xl text-white/70 hover:text-white"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-16 text-3xl text-white/70 hover:text-white"
              >
                &rsaquo;
              </button>
            </>
          )}

          <div
            className="relative h-full max-h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              fill
              sizes="90vw"
              loading="eager"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
