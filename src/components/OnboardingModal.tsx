'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Track Energy & Nutrition",
      subtitle: "Calorie surplus & protein precision",
      description: "Hit your 2,500 kcal gain goal and 85–100g daily protein to fuel your calisthenics workouts and healthy mass progression.",
      image: "/assets/onboarding-1-energy.png",
      badge: "Nutrition & Fuel",
      accentColor: "#84CC16",
    },
    {
      title: "Yearly GitHub Heatmaps",
      subtitle: "Never break the chain",
      description: "Visualize every step, walk, and calisthenics training session on full 365-day heatmaps inspired by developer commit graphs.",
      image: "/assets/onboarding-2-habits.png",
      badge: "Consistency Grids",
      accentColor: "#10B981",
    },
    {
      title: "Level Up Daily Points",
      subtitle: "Gamify your daily discipline",
      description: "Earn flame points for hitting your calories, protein, 10k steps, workouts, and 23:30 sleep schedule. Watch your streak climb!",
      image: "/assets/onboarding-3-points.png",
      badge: "Points & Flame",
      accentColor: "#FF5E1E",
    },
  ];

  const current = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0F1523] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header with Skip Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10"
            style={{ color: current.accentColor, borderColor: `${current.accentColor}33`, backgroundColor: `${current.accentColor}11` }}
          >
            {current.badge}
          </span>
          <button
            onClick={onComplete}
            className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded-md transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Illustration Container */}
        <div className="relative w-full h-64 sm:h-72 px-6 flex items-center justify-center overflow-hidden my-2">
          <div className="relative w-full h-full max-w-[280px] rounded-2xl overflow-hidden shadow-inner ring-1 ring-white/10">
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-contain p-2"
              sizes="280px"
              priority
            />
          </div>
        </div>

        {/* Content Box */}
        <div className="px-6 py-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {current.subtitle}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Dots & CTA */}
          <div className="pt-6 pb-2">
            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-7 bg-[#FF5E1E]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Get Started Button */}
            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF5E1E] to-[#FFA114] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#FF5E1E]/25 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <span>{isLast ? "Get Started" : "Continue"}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
