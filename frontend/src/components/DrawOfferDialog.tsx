import { useEffect, useRef, useState } from "react";

type DrawOfferDialogProps = {
  delayMs: number;
  pending: boolean;
  error: string | null;
  onRespond: (accept: boolean) => void;
};

export default function DrawOfferDialog({ delayMs, pending, error, onRespond }: DrawOfferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(delayMs / 1000));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    titleRef.current?.focus();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    const deadline = Date.now() + delayMs;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsRemaining(seconds);
      if (seconds === 0) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [delayMs]);

  const disabled = secondsRemaining > 0 || pending;

  return (
    <dialog ref={dialogRef} aria-labelledby="draw-offer-title" aria-describedby="draw-offer-description"
      onCancel={(event) => event.preventDefault()}
      className="fixed inset-0 m-auto w-[90vw] max-w-md rounded-2xl border border-white/20 bg-slate-950 p-6 text-white shadow-2xl backdrop:bg-black/70">
      <h2 ref={titleRef} id="draw-offer-title" tabIndex={-1} className="text-xl font-bold outline-none">
        Draw offer
      </h2>
      <p id="draw-offer-description" className="mt-3 text-slate-300">
        Your opponent is offering a draw. Accepting will end the game with no winner.
      </p>
      <p className="mt-3 text-sm text-slate-400" aria-live="polite">
        {secondsRemaining > 0 ? `You can answer in ${secondsRemaining}s.` : "Choose whether to accept or decline."}
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button type="button" disabled={disabled} onClick={() => onRespond(false)}
          className="flex-1 rounded-xl border border-white/20 px-4 py-3 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
          Decline
        </button>
        <button type="button" disabled={disabled} onClick={() => onRespond(true)}
          className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
          Accept draw
        </button>
      </div>
    </dialog>
  );
}
