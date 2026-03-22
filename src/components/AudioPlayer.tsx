import React, { useRef, useState, useEffect } from 'react';
import '../styles/AudioPlayer.css';

interface AudioPlayerProps {
  audioUrl: string | null | undefined;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [audioError, setAudioError] = useState<string>('');

  if (!audioUrl) {
    return <div className="audio-player-unavailable">Audio not available</div>;
  }

  const convertedUrl = audioUrl;

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

  const handleAudioError = (e: any) => {
    const errorCode = audioRef.current?.error?.code;
    const errorMessage = audioRef.current?.error?.message;
    
    let userMessage = 'Failed to load audio. ';
    
    if (errorCode === 4) {
      userMessage += 'File format incompatible or URL invalid.';
    } else if (errorCode === 2) {
      userMessage += 'Network error - check your internet connection.';
    } else if (errorCode === 1) {
      userMessage += 'Loading was aborted.';
    } else {
      userMessage += 'Please check the file and try again.';
    }
    
    setAudioError(userMessage);
    setIsPlaying(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
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
    <div className="audio-player">
      {audioError && <div className="audio-error-message">{audioError}</div>}
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        preload="metadata"
        style={{ width: '100%' }}
      >
        <source src={convertedUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

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

      <div className="player-settings">
        <div className="speed-control">
          <label htmlFor="speed-select">⚡ Speed:</label>
          <select
            id="speed-select"
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="speed-select"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        <div className="volume-control">
          <label htmlFor="volume-slider">🔊 Vol:</label>
          <input
            id="volume-slider"
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
    </div>
  );
};

export default AudioPlayer;
