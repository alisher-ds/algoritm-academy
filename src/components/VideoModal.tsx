"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, ExternalLink } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  videoUrl?: string;
  instagramUrl?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoTitle = "Algoritm School & Academy — Dars Jarayoni va Maktab Hayoti",
  videoUrl = "/videos/reel_sat1430.mp4",
  instagramUrl = "https://www.instagram.com/algoritm_school_",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0b1329] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/90 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-slate-950">
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                Algoritm Video Vitrinasi
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                {videoTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame with Direct Native Player */}
        <div className="relative aspect-[9/16] sm:aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Big Center Play/Pause Indicator on click */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 transition"
              aria-label="Play"
            >
              <div className="w-16 h-16 rounded-full bg-brand text-slate-950 flex items-center justify-center shadow-2xl animate-in zoom-in-90 duration-150">
                <Play className="w-7 h-7 fill-slate-950 ml-1" />
              </div>
            </button>
          )}

          {/* Bottom Floating Video Controls */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 space-y-2">
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden relative hover:h-2.5 transition-all"
            >
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] text-slate-300 font-mono">
                  HD 1080p · Algoritm Media
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  title="To'liq ekran"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
