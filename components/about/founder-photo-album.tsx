"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FounderPhoto } from "@/data/founder-media";

const faDigits = (n: number) => n.toLocaleString("fa-IR");

/** Shows one cover photo with a count badge; clicking opens a viewer for the whole album. */
export function FounderPhotoAlbum({ photos }: { photos: readonly FounderPhoto[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = photos.length;

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);
  // Persian reading direction: "next" is to the left.
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") next();
      else if (event.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close, next, prev]);

  if (count === 0) return null;
  const cover = photos[0];
  const current = photos[index];

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={count > 1 ? `مشاهده همه ${faDigits(count)} عکس آلبوم` : "مشاهده عکس"}
        className="group relative mt-4 block w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-background text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 640px) 100vw, 384px"
          className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
        {count > 1 ? (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm sm:text-sm">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="7" width="14" height="13" rx="2" />
              <path d="M7 3h12a2 2 0 0 1 2 2v12" />
            </svg>
            {faDigits(count)} عکس
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="آلبوم عکس"
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-3 sm:p-6"
          onClick={close}
        >
          <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-bold">
              {faDigits(index + 1)} از {faDigits(count)}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="بستن"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
            >
              ×
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-auto max-w-full rounded-xl object-contain"
            />
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="عکس قبلی"
                  className="absolute right-0 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="عکس بعدی"
                  className="absolute left-0 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30"
                >
                  ‹
                </button>
              </>
            ) : null}
          </div>

          {count > 1 ? (
            <ul className="flex justify-center gap-2 overflow-x-auto pb-1" onClick={(e) => e.stopPropagation()}>
              {photos.map((photo, i) => (
                <li key={photo.src}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`عکس ${faDigits(i + 1)}`}
                    aria-current={i === index}
                    className={`block overflow-hidden rounded-lg border-2 ${i === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={photo.src} alt="" width={64} height={64} className="size-14 object-cover sm:size-16" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
