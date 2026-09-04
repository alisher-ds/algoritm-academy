"use client";

import React, { useState } from "react";
import { Play, Eye, Heart, Video, Sparkles } from "lucide-react";
import VideoModal from "@/components/VideoModal";

interface ReelItem {
  id: string;
  title: string;
  category: string;
  views: string;
  likes: string;
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl: string;
  instagramUrl: string;
}

export default function ReelsShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<ReelItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reels: ReelItem[] = [
    {
      id: "r1",
      title: "Mantiqiy Fikrlash & PMT Masalalari Tahlili",
      category: "PMT Darsi",
      views: "24.5K",
      likes: "2.1K",
      duration: "01:15",
      thumbnail: "/images/demo/reel_1.svg",
      videoUrl: "/videos/reel_olympiad.mp4",
      description: "Prezident maktabi imtihonlariga tayyorgarlik bo'yicha mantiqiy masalalar yechish namunasi.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
    {
      id: "r2",
      title: "SAT 1450+ Ball & Xalqaro Grant Natijasi",
      category: "SAT Digital",
      views: "42.3K",
      likes: "3.5K",
      duration: "01:45",
      thumbnail: "/images/demo/reel_2.svg",
      videoUrl: "/videos/reel_sat1430.mp4",
      description: "O'quvchimizning Digital SAT imtihoni va to'liq grant yutish strategiyasi haqidagi tajribasi.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
    {
      id: "r3",
      title: "Matematika DTM & Olimpiada Masalalari",
      category: "Matematika",
      views: "19.8K",
      likes: "1.7K",
      duration: "00:58",
      thumbnail: "/images/demo/reel_3.svg",
      videoUrl: "/videos/reel_math4d.mp4",
      description: "Murakkab matematik masalalarni tezkor usulda yechish mahorati darsi.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
    {
      id: "r4",
      title: "Speaking & IELTS 8.0 Erkin Muloqot Klublari",
      category: "IELTS 8.0",
      views: "36.2K",
      likes: "2.9K",
      duration: "02:10",
      thumbnail: "/images/demo/reel_4.svg",
      videoUrl: "/videos/reel_open_doors.mp4",
      description: "Ingliz tilida erkin so'zlashuv va jonli Speaking klubi mashg'ulotlari.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
    {
      id: "r5",
      title: "Haftalik Mock Test & Sinov Imtihoni Jarayoni",
      category: "Mock Test",
      views: "31.4K",
      likes: "2.6K",
      duration: "01:30",
      thumbnail: "/images/demo/reel_5.svg",
      videoUrl: "/videos/reel_pmt_test.mp4",
      description: "O'quvchilarning bilim darajasini real imtihon muhitida sinash jarayoni.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
    {
      id: "r6",
      title: "G'oliblarni Taqdirlash & Bitiruv Tantanasi",
      category: "Tadbir",
      views: "52.1K",
      likes: "4.8K",
      duration: "02:30",
      thumbnail: "/images/demo/reel_6.svg",
      videoUrl: "/videos/reel_graduation.mp4",
      description: "Yil yakunida yuqori natijalar qayd etgan o'quvchilarni taqdirlash tantanasi.",
      instagramUrl: "https://www.instagram.com/algoritm.academy",
    },
  ];

  const handleOpenVideo = (reel: ReelItem) => {
    setSelectedVideo(reel);
    setIsModalOpen(true);
  };

  return (
    <section className="bg-[#080e1e] py-20 sm:py-28 text-white border-b border-emerald-500/10" id="reels">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Video className="w-3.5 h-3.5 text-brand" /> Video Lavhalar
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
              Jonli Jarayon & Reels Videolar
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Dars jarayonlari, imtihon sinovlari va o'quvchilarimizning natijalari videolavhalari.
            </p>
          </div>

          <button
            onClick={() => handleOpenVideo(reels[0])}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold border border-white/10 transition self-start md:self-auto shrink-0"
          >
            <Play className="w-4 h-4 text-brand fill-brand" />
            Barcha Videolarni Ko'rish
          </button>
        </div>

        {/* Reels Grid (9:16 vertical card aspect) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => handleOpenVideo(reel)}
              className="group relative rounded-3xl overflow-hidden aspect-[9/16] bg-slate-900 border border-white/10 shadow-lg cursor-pointer hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(0,200,83,0.25)] transition-all duration-300 hover:-translate-y-1.5"
            >
              <img
                src={reel.thumbnail}
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Play Button Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform duration-200">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 mb-2 group-hover:text-brand transition-colors">
                  {reel.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    {reel.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Video Playback Modal */}
      {isModalOpen && selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoTitle={selectedVideo.title}
          videoUrl={selectedVideo.videoUrl}
          instagramUrl={selectedVideo.instagramUrl}
        />
      )}
    </section>
  );
}
