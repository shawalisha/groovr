import React, { useEffect, useRef } from 'react';
import { AnimatePresence, LazyMotion, Reorder, domMax, m, useDragControls } from 'framer-motion';
import { FiPlay, FiPause, FiX, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { MdDragIndicator, MdQueueMusic } from 'react-icons/md';

import { useAudioPlayerContext, QueueItem } from '@/context/audioPlayerContext';
import { useOnKeyPress } from '@/hooks/useOnKeyPress';
import { cn, getImageUrl, formatDuration } from '@/utils';
import { ITrack } from '@/types';

const trackTitle = (track: ITrack) => track.original_title || track.name || track.title || 'Unknown Track';

const iconButton =
  'flex items-center justify-center w-7 h-7 rounded-full text-gray-500 dark:text-text-secondary ' +
  'hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-hover-gray ' +
  'disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

interface QueueRowProps {
  item: QueueItem;
  index: number;
  total: number;
}

const QueueRow: React.FC<QueueRowProps> = ({ item, index, total }) => {
  const { removeFromQueue, moveQueueItem, playFromQueue } = useAudioPlayerContext();
  const dragControls = useDragControls();
  const { track } = item;
  const title = trackTitle(track);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="group flex items-center gap-2 rounded-lg px-2 py-2 bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-hover-gray/60 select-none"
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 1 }}
    >
      <span
        onPointerDown={(e) => dragControls.start(e)}
        className="cursor-grab active:cursor-grabbing touch-none text-gray-400 dark:text-text-muted hover:text-gray-700 dark:hover:text-white"
        aria-hidden="true"
        title="Drag to reorder"
      >
        <MdDragIndicator className="w-5 h-5" />
      </span>

      <button
        type="button"
        onClick={() => playFromQueue(item.uid)}
        className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`Play ${title} now`}
      >
        <img
          src={getImageUrl(track.poster_path)}
          alt=""
          className="w-10 h-10 rounded-md object-cover shrink-0 dark:brightness-90"
          draggable={false}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900 dark:text-text-primary">{title}</span>
          <span className="block truncate text-xs text-gray-500 dark:text-text-secondary">
            {track.artist || 'Unknown Artist'}
          </span>
        </span>
        {track.duration ? (
          <span className="text-xs tabular-nums text-gray-400 dark:text-text-muted shrink-0">
            {formatDuration(track.duration)}
          </span>
        ) : null}
      </button>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          className={iconButton}
          onClick={() => moveQueueItem(item.uid, 'up')}
          disabled={index === 0}
          aria-label={`Move ${title} up`}
        >
          <FiChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => moveQueueItem(item.uid, 'down')}
          disabled={index === total - 1}
          aria-label={`Move ${title} down`}
        >
          <FiChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={cn(iconButton, 'hover:text-red-500 dark:hover:text-red-400')}
          onClick={() => removeFromQueue(item.uid)}
          aria-label={`Remove ${title} from queue`}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

const NowPlaying: React.FC = () => {
  const { currentTrack, isPlaying, progress, togglePlay } = useAudioPlayerContext();

  if (!currentTrack) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-hover-gray p-6 text-center text-sm text-gray-500 dark:text-text-secondary">
        Nothing playing. Click a song to start listening.
      </div>
    );
  }

  const title = trackTitle(currentTrack);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-brand-500/15 to-transparent dark:from-brand-500/20 p-3">
      <div className="relative shrink-0">
        <img
          src={getImageUrl(currentTrack.poster_path)}
          alt={title}
          className="w-20 h-20 rounded-lg object-cover shadow-md"
        />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex items-end gap-0.5 rounded-full bg-brand-500 px-1.5 py-1" aria-hidden="true">
            <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 dark:text-text-primary">{title}</p>
        <p className="truncate text-sm text-gray-600 dark:text-text-secondary">{currentTrack.artist || 'Unknown Artist'}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-gray-200 dark:bg-hover-gray overflow-hidden" aria-hidden="true">
          <div className="h-full bg-brand-500 transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-brand-500 text-white shadow-md hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
      >
        {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 ml-0.5" />}
      </button>
    </div>
  );
};

export const QueuePanel: React.FC = () => {
  const { isQueueOpen, closeQueue, queue, reorderQueue, clearQueue } = useAudioPlayerContext();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useOnKeyPress({ key: 'Escape', action: closeQueue, enable: isQueueOpen });

  useEffect(() => {
    if (isQueueOpen) headingRef.current?.focus();
  }, [isQueueOpen]);

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isQueueOpen && (
          <m.aside
            key="queue-panel"
            role="complementary"
            aria-labelledby="queue-panel-heading"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full sm:w-[380px] flex-col bg-white dark:bg-card-dark border-l border-gray-200 dark:border-hover-gray shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-hover-gray">
              <h2
                id="queue-panel-heading"
                ref={headingRef}
                tabIndex={-1}
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-text-primary focus:outline-none"
              >
                <MdQueueMusic className="w-5 h-5 text-brand-500" />
                Queue
              </h2>
              <button type="button" onClick={closeQueue} className={cn(iconButton, 'w-8 h-8')} aria-label="Close queue">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Now playing */}
              <section aria-label="Now playing">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-text-secondary">
                  Now Playing
                </h3>
                <NowPlaying />
              </section>

              {/* Next up */}
              <section aria-label="Next up">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-text-secondary">
                    Next Up {queue.length > 0 && <span className="normal-case">({queue.length})</span>}
                  </h3>
                  {queue.length > 0 && (
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="text-xs font-medium text-gray-500 hover:text-brand-500 dark:text-text-secondary dark:hover:text-brand-500 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {queue.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-300 dark:border-hover-gray p-6 text-center text-sm text-gray-500 dark:text-text-secondary">
                    Your queue is empty. Hover a song and click{' '}
                    <span className="font-semibold text-gray-700 dark:text-text-primary">+</span> to add it.
                  </p>
                ) : (
                  <Reorder.Group axis="y" values={queue} onReorder={reorderQueue} className="space-y-1">
                    {queue.map((item, index) => (
                      <QueueRow key={item.uid} item={item} index={index} total={queue.length} />
                    ))}
                  </Reorder.Group>
                )}
              </section>
            </div>
          </m.aside>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};
