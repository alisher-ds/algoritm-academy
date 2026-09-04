"use client";

import React, { useState } from "react";
import { Play, Video, Send, ArrowUpRight } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface VideoItem {
  id: string;
  title: string;
  category: string;
  description: string;
  poster: string;
  videoUrl: string;
}

const videos: VideoItem[] = [
  {
    id: "v1",
    title: "Algoritm Academy — dars va natijalar lavhasi",
    category: "Video lavha",
    description:
      "Dars jarayonlari, imtihon sinovlari va o'quvchilar natijalaridan haqiqiy lavhalar.",
    poster: "/images/slides/slide_5_live_class.jpg",
    videoUrl: "/videos/reel_sat1430.mp4",
  },
  {
    id: "v2",
    title: "Aziz Xolmurodov — matematika (Milliy A+)",
    category: "Ustoz bilan tanishuv",
    description:
      "Maktab matematika ustozi Aziz Xolmurodov bilan qisqacha tanishuv.",
    poster: "/images/aziz_xolmurodov.jpg",
    videoUrl: "/videos/aziz_teacher_intro.mp4",
  },
];

export default function ReelsShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  return (
    <section className="relative overflow-hidden bg-night-deep py-20 text-white sm:py-24" id="reels">
      {/* Orqa fon aksenti */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-400">
              <Video className="h-3.5 w-3.5" />
              Video lavhalar
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Maktab hayoti va natijalar videoda
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              O&apos;quv jarayoni va natijalardan lavhalar. To&apos;liq arxiv Telegram
              kanalimizda muntazam yangilanadi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {videos.map((video, i) => (
            <article
              key={video.id}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 ${
                i === 0 ? "md:col-span-1" : "md:col-span-1"
              }`}
            >
              <button
                onClick={() => setSelectedVideo(video)}
                className="relative block aspect-video w-full overflow-hidden text-left"
                aria-label={`${video.title} — videoni ko'rish`}
              >
                <img
                  src={video.poster}
                  alt={video.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Play tugmasi */}
                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-0.5 h-6 w-6 fill-white" />
                </span>

                {/* Kategoriya */}
                <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  {video.category}
                </span>
              </button>

              <div className="p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold text-white">{video.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{video.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 sm:flex-row">
          <p className="text-sm text-slate-400">
            Ko&apos;proq lavhalar va e&apos;lonlar — rasmiy Telegram kanalimizda.
          </p>
          <a
            href={ECOSYSTEM_DATA.contact.telegram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-500"
          >
            <Send className="h-4 w-4" />
            Telegram kanal
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          isOpen={Boolean(selectedVideo)}
          onClose={() => setSelectedVideo(null)}
          videoTitle={selectedVideo.title}
          videoUrl={selectedVideo.videoUrl}
          poster={selectedVideo.poster}
        />
      )}
    </section>
  );
}
