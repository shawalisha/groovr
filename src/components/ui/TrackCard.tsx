import React, { useState } from 'react';
import { Card, CardContent } from './card';
import { FaClock } from 'react-icons/fa';
import { FiPlay, FiPause } from 'react-icons/fi';
import { MdPlaylistAdd } from 'react-icons/md';
import { ITrack } from '@/types';
import { getImageUrl, cn, formatDuration } from '@/utils';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';

interface TrackCardProps {
  track: ITrack;
  category: string;
  variant?: 'compact' | 'detailed' | 'featured';
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  category: _category,
  variant = 'detailed',
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { currentTrack, isPlaying, playTrack, addToQueue } = useAudioPlayerContext();

  const { poster_path, original_title: title, name, artist, album, duration } = track;
  const displayTitle = title || name || 'Unknown Track';

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlay = () => playTrack(track);

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
  };

  const cardHeight = variant === 'compact' ? 'h-52' : variant === 'featured' ? 'h-84' : 'h-80';
  const imageHeight = variant === 'compact' ? 160 : variant === 'featured' ? 240 : 200;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-300 ease-out overflow-hidden",
        "hover:scale-[1.03] hover:-translate-y-2 cursor-pointer",
        "bg-white dark:bg-card-dark border-0",
        "shadow-sm hover:shadow-card-hover",
        "rounded-xl p-4",
        isCurrent && "ring-2 ring-accent-orange",
        cardHeight,
        "w-[180px]", // Slightly wider for better proportions
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      {/* Main Content */}
      <div className="block relative h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg mb-3">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-hover-gray animate-pulse rounded-lg"
                 style={{ height: imageHeight }} />
          )}

          {/* Album artwork */}
          <img
            src={getImageUrl(poster_path)}
            alt={displayTitle}
            className={cn(
              "w-full object-cover transition-all duration-300 rounded-lg",
              "group-hover:scale-105",
              "dark:brightness-75 dark:contrast-110 dark:saturate-90",
              "dark:group-hover:brightness-90 dark:group-hover:contrast-105 dark:group-hover:saturate-95",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ height: imageHeight }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 rounded-lg",
            isHovered || isCurrent ? "opacity-100" : "opacity-0"
          )} />

          {/* Play / pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            aria-label={isCurrentPlaying ? `Pause ${displayTitle}` : `Play ${displayTitle}`}
            className={cn(
              "absolute bottom-2 left-2 flex items-center justify-center w-10 h-10 rounded-full",
              "bg-accent-orange text-white shadow-lg transition-all duration-200 hover:scale-110",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:opacity-100",
              isHovered || isCurrent ? "opacity-100" : "opacity-0"
            )}
          >
            {isCurrentPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Add to queue */}
          <button
            type="button"
            onClick={handleAddToQueue}
            aria-label={`Add ${displayTitle} to queue`}
            title="Add to queue"
            className={cn(
              "absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full",
              "bg-black/60 text-white backdrop-blur-sm transition-all duration-200",
              "hover:bg-accent-orange hover:scale-110",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:opacity-100",
              // Always visible on touch-sized screens, hover/focus-revealed on larger ones
              "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            )}
          >
            <MdPlaylistAdd className="w-5 h-5" />
          </button>
        </div>

        {/* Track information */}
        <CardContent className="p-0 space-y-2">
          {/* Track title */}
          <h3 className={cn(
            "font-semibold truncate transition-colors duration-200",
            isCurrent ? "text-accent-orange" : "text-gray-900 dark:text-text-primary",
            variant === 'compact' ? "text-sm" : "text-base",
            "group-hover:text-accent-orange dark:group-hover:text-accent-orange"
          )}>
            {displayTitle}
          </h3>

          {/* Artist name */}
          <p className={cn(
            "text-gray-600 dark:text-text-secondary truncate font-medium",
            variant === 'compact' ? "text-xs" : "text-sm"
          )}>
            {artist || 'Unknown Artist'}
          </p>

          {/* Additional info for detailed variant */}
          {variant === 'detailed' && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 flex-1 mr-2">
                {album && (
                  <span className="text-xs text-text-muted dark:text-text-secondary/70 truncate">
                    {album}
                  </span>
                )}
              </div>
              {duration && (
                <div className="flex items-center text-xs text-text-muted dark:text-text-secondary/70 shrink-0">
                  <FaClock className="w-3 h-3 mr-1 opacity-60" />
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-spotify-green via-accent-orange to-warning-amber rounded-2xl opacity-0 transition-opacity duration-500 -z-10 blur-md",
        "dark:bg-gradient-to-r dark:from-blue-800 dark:via-slate-600 dark:to-blue-800",
        isHovered && "opacity-10"
      )} />
    </Card>
  );
};
