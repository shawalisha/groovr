import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import {
  Header,
  Footer,
  SideBar,
  ScrollToTop,
  Loader,
  ErrorBoundary,
  DemoModeBadge,
} from "@/common";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { MiniPlayer } from "@/components/ui/MiniPlayer";
import { QueuePanel } from "@/components/ui/QueuePanel";
import { useAudioPlayerContext } from "@/context/audioPlayerContext";
import { cn } from "@/utils";

import "react-loading-skeleton/dist/skeleton.css";
import "swiper/css";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
};

const App = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const player = useAudioPlayerContext();
  const { toggleQueue } = player;

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Q toggles the queue panel (ignored while typing)
      if (
        e.key.toLowerCase() === 'q' &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        !isTypingTarget(e.target)
      ) {
        toggleQueue();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleQueue]);

  const hasPlayer = !!player.currentTrack;

  return (
    <>
      <SideBar />
      <Header onOpenSearch={() => setIsCommandPaletteOpen(true)} />
      <DemoModeBadge />
      <main
        className={cn(
          "transition-all duration-300 lg:pb-14 md:pb-4 sm:pb-2 xs:pb-1 pb-0 bg-white dark:bg-deep-dark min-h-screen",
          // Keep content clear of the fixed full-width player bar
          hasPlayer && !player.isMinimized && "pb-24 xs:pb-24 sm:pb-24 md:pb-24 lg:pb-24"
        )}
      >
        <ScrollToTop>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </ScrollToTop>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onItemSelect={() => {
          // Item selection handled by CommandPalette component
        }}
      />

      <Footer />

      <MiniPlayer
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        progress={player.progress}
        volume={player.volume}
        isShuffled={player.isShuffled}
        repeatMode={player.repeatMode}
        isMinimized={player.isMinimized}
        onTogglePlay={player.togglePlay}
        onSkipPrevious={player.skipPrevious}
        onSkipNext={player.skipNext}
        onSeek={player.seek}
        onVolumeChange={player.setVolume}
        onToggleShuffle={player.toggleShuffle}
        onToggleRepeat={player.toggleRepeat}
        onToggleFavorite={player.toggleFavorite}
        onToggleMinimize={player.toggleMinimize}
        onClose={player.closePlayer}
        onToggleQueue={toggleQueue}
        queueCount={player.queue.length}
        isQueueOpen={player.isQueueOpen}
        // Sit beside the queue panel on wide screens instead of underneath it
        className={cn(player.isQueueOpen && "sm:right-[380px]")}
      />

      <QueuePanel />
    </>
  );
};

export default App;
