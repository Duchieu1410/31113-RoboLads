export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center" role="status" aria-label="Loading page">
      <div className="font-display text-xs text-amber-400 mb-3 animate-pulse">
        GENERATING CHUNKS...
      </div>
      <div className="w-48 h-3 bg-stone-900 border-2 border-stone-700 p-0.5 shadow-[2px_2px_0_#000]">
        <div className="h-full bg-amber-400 animate-[pulse_1s_infinite] w-2/3" />
      </div>
    </div>
  );
}
