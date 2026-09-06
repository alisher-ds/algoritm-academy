"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  videoUrl?: string;
  poster?: string;
  instagramUrl?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoTitle = "Algoritm School & Academy — Dars Jarayoni va Maktab Hayoti",
  videoUrl = "/videos/reel_sat1430.mp4",
  poster,
  instagramUrl = "",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Brauzerlar ovozli avtoijroni bloklaydi — shuning uchun ovozsiz boshlaymiz.
  // Ilgari `autoPlay` bor edi-yu video muted emasdi, ya'ni avtoijro hech qachon ishlamasdi.
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    const el = videoRef.current;
    el.currentTime = 0;
    setProgress(0);
    el.muted = true;
    setIsMuted(true);
    el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [isOpen, videoUrl]);

  // Escape bilan yopish + orqa fonda scroll bloklash
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    const next = !isMuted;
    el.muted = next;
    setIsMuted(next);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    // Metadata hali yuklanmagan bo'lsa `duration` NaN bo'ladi va `currentTime = NaN`
    // istisno tashlaydi — progress bar ustiga darhol bosilsa shu sodir bo'lardi.
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    el.currentTime = pos * el.duration;
  };

  const toggleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (typeof el.requestFullscreen === "function") {
      el.requestFullscreen().catch(() => undefined);
      return;
    }
    // iOS Safari standart Fullscreen API'ni video uchun qo'llab-quvvatlamaydi.
    const ios = el as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    ios.webkitEnterFullscreen?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        className="relative w-full max-w-3xl bg-night border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/90 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-slate-950">
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 block">
                Algoritm Video Vitrinasi
              </span>
              <h3 id="video-modal-title" className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
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
            poster={poster}
            preload="metadata"
            playsInline
            muted={isMuted}
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
              <div className="w-16 h-16 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center shadow-2xl">
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
                className="h-full bg-brand-500 rounded-full transition-all"
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
                <span className="text-[11px] text-slate-400">Rasmiy video</span>
              </div>

              <div className="flex items-center gap-2">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-500 hover:text-slate-950 transition text-[11px] font-bold"
                    title="Instagram'da ochish"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Instagram</span>
                  </a>
                )}
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
