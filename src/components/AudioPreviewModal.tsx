import React, { useRef, useState } from 'react';
import '../styles/AudioPreviewModal.css';

interface AudioPreviewModalProps {
  isOpen: boolean;
  audioUrl: string | null;
  title: string;
  onClose: () => void;
}

const AudioPreviewModal: React.FC<AudioPreviewModalProps> = ({ 
  isOpen, 
  audioUrl, 
  title, 
  onClose 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  if (!isOpen) return null;

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-preview-overlay" onClick={onClose}>
      <div className="audio-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎧 Sample Audio Preview</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <p className="preview-title">{title}</p>
          
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          >
            <source src={audioUrl || ''} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          <div className="preview-player">
            <div className="player-controls">
              <button
                className={`play-pause-btn ${isPlaying ? 'playing' : ''}`}
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>

              <div className="progress-container">
                <span className="time-display">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="progress-bar"
                  title="Seek"
                />
                <span className="time-display">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="volume-control">
              <label htmlFor="preview-volume">🔊</label>
              <input
                id="preview-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                title="Volume"
              />
            </div>
          </div>

          <p className="preview-note">📌 This is a sample preview. Purchase to access the full audio!</p>
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AudioPreviewModal;
