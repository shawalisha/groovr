import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer, QueueItem } from '@/hooks/useAudioPlayer';
import { ITrack } from '@/types';

export type { QueueItem };

interface AudioPlayerContextType {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isMinimized: boolean;
  queue: QueueItem[];
  isQueueOpen: boolean;
  playTrack: (track: ITrack, forceRestart?: boolean) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  addToQueue: (track: ITrack) => void;
  removeFromQueue: (uid: string) => void;
  moveQueueItem: (uid: string, direction: 'up' | 'down') => void;
  reorderQueue: (queue: QueueItem[]) => void;
  clearQueue: () => void;
  playFromQueue: (uid: string) => void;
  openQueue: () => void;
  closeQueue: () => void;
  toggleQueue: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within AudioPlayerProvider');
  }
  return context;
};
