import { PixelButton } from '@/components/pixel/PixelButton';
import { PixelPanel } from '@/components/pixel/PixelPanel';
import { PixelIcon } from '@/components/pixel/PixelIcon';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--night)] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {/* Game Over Title Screen */}
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--redstone)] mb-4 tracking-wider drop-shadow-[0_4px_8px_rgba(211,58,44,0.4)]">
          YOU DIED!
        </h1>

        <p className="font-display text-xs text-amber-400 mb-6">
          SCORE: 0 • REASON: 404 CHUNK NOT GENERATED
        </p>

        <PixelPanel variant="night" rivets className="p-6 sm:p-8 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <PixelIcon name="redstone" size={32} />
            <div>
              <div className="font-display text-[10px] text-red-400">WORLD EXCEPTION</div>
              <div className="font-heading text-sm text-white">LOST IN THE VOID</div>
            </div>
          </div>
          <p className="font-body text-sm text-slate-200 leading-relaxed">
            The page or mechanism coordinate you navigated to does not exist in the HSGS RoboLads
            world repository. The block might have been moved, renamed, or fallen into the void.
          </p>
        </PixelPanel>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PixelButton href="/" variant="primary">
            <span>RESPAWN AT HOME</span>
          </PixelButton>
          <PixelButton href="/resources" variant="stone">
            <span>OPEN RESOURCES</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
