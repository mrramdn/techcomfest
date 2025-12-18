"use client";

import { useEffect } from "react";

type NoticeModalProps = {
  open: boolean;
  title: string;
  description?: string;
  buttonText?: string;
  autoCloseMs?: number;
  onClose: () => void;
};

export default function NoticeModal({
  open,
  title,
  description,
  buttonText = "OK",
  autoCloseMs,
  onClose,
}: NoticeModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs) return;
    const timer = window.setTimeout(() => onClose(), autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [autoCloseMs, onClose, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        aria-label="Close modal overlay"
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-xl backdrop-saturate-150"
        onClick={onClose}
      />

      <div className="relative w-full max-w-130 bg-white rounded-4xl outline -outline-offset-1 outline-gray-300 px-6 sm:px-12 py-10 flex justify-center items-center overflow-hidden">
        <div className="w-96 max-w-full flex flex-col justify-start items-start gap-7">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="inline-flex justify-center items-center gap-5">
                <div className="size-11 bg-blue-500 rounded-xl flex items-center justify-center">
                  <div className="text-slate-50 text-2xl font-bold leading-10">L</div>
                </div>
                <div className="text-black text-xl font-bold leading-8">Lahap</div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">{title}</div>
                {description ? (
                  <div className="self-stretch text-gray-500 text-base font-normal leading-6">{description}</div>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-stretch h-11 px-8 py-2 bg-blue-500 rounded-xl flex justify-center items-center gap-2.5"
          >
            <div className="text-center text-white text-lg font-medium leading-7">{buttonText}</div>
          </button>
        </div>

        <button
          aria-label="Close"
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 size-9"
        >
          <span className="material-symbols-outlined text-xl text-gray-500 hover:text-black">close</span>
        </button>
      </div>
    </div>
  );
}
