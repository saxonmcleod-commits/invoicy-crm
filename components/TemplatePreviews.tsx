import React from 'react';

const PreviewCard: React.FC<{
  children: React.ReactNode;
  fontClass: string;
  textPrimary: string;
  textSecondary: string;
  bgClass: string;
}> = ({ children, fontClass, textPrimary, textSecondary, bgClass }) => (
  <div className={`w-full h-full p-2 flex flex-col justify-between ${bgClass}`}>
    <div className={`text-center ${fontClass}`}>
      <span className={`text-2xl font-bold ${textPrimary}`}>A</span>
      <span className={`text-2xl ${textSecondary}`}>a</span>
    </div>
    <div className="flex justify-end items-center gap-1">{children}</div>
  </div>
);

export const ModernPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-primary-600"
    textSecondary="text-slate-700 dark:text-zinc-300"
    bgClass="bg-slate-200 dark:bg-zinc-700"
  >
    <div className="w-full h-1 bg-primary-500 rounded-full"></div>
  </PreviewCard>
);

export const ClassicPreview = () => (
  <PreviewCard
    fontClass="font-serif"
    textPrimary="text-gray-900 dark:text-zinc-200"
    textSecondary="text-gray-600 dark:text-zinc-400"
    bgClass="bg-gray-50 dark:bg-zinc-800"
  >
    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
    <div className="w-4 h-4 rounded-full bg-gray-500 dark:bg-zinc-400"></div>
    <div className="w-4 h-4 rounded-full bg-gray-800 dark:bg-zinc-200"></div>
  </PreviewCard>
);

export const CreativePreview = () => (
  <PreviewCard
    fontClass="font-mono"
    textPrimary="text-cyan-400"
    textSecondary="text-fuchsia-400"
    bgClass="bg-slate-900"
  >
    <div className="w-4 h-4 rounded-full bg-fuchsia-500"></div>
    <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
  </PreviewCard>
);

export const MinimalistPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-gray-800 dark:text-zinc-200"
    textSecondary="text-gray-500 dark:text-zinc-400"
    bgClass="bg-white dark:bg-zinc-800/50"
  >
    <div className="w-full h-px bg-gray-300 dark:bg-zinc-600"></div>
  </PreviewCard>
);

export const BoldPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-gray-50 dark:text-zinc-200"
    textSecondary="text-gray-300 dark:text-zinc-400"
    bgClass="bg-gray-900"
  >
    <div className="w-full h-2 bg-gray-50 rounded-full"></div>
  </PreviewCard>
);

export const RetroPreview = () => (
  <PreviewCard
    fontClass="font-mono"
    textPrimary="text-orange-700"
    textSecondary="text-amber-900"
    bgClass="bg-[#fdf6e3]"
  >
    <div className="w-full h-0.5 bg-amber-800"></div>
  </PreviewCard>
);

export const CorporatePreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-blue-700 dark:text-blue-400"
    textSecondary="text-gray-600 dark:text-zinc-400"
    bgClass="bg-gray-100 dark:bg-zinc-700"
  >
    <div className="w-4 h-4 rounded-full bg-blue-700"></div>
    <div className="w-4 h-4 rounded-full bg-gray-500"></div>
    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
  </PreviewCard>
);

export const ElegantPreview = () => (
  <PreviewCard
    fontClass="font-serif"
    textPrimary="text-amber-500"
    textSecondary="text-gray-700 dark:text-zinc-300"
    bgClass="bg-gray-50 dark:bg-zinc-800"
  >
    <div className="w-full h-px bg-amber-500"></div>
  </PreviewCard>
);

export const FriendlyPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-green-600 dark:text-green-400"
    textSecondary="text-gray-700 dark:text-zinc-300"
    bgClass="bg-green-50 dark:bg-green-900/50"
  >
    <div className="w-5 h-5 rounded-full bg-green-500"></div>
    <div className="w-3 h-3 rounded-full bg-green-300"></div>
  </PreviewCard>
);

export const TechnicalPreview = () => (
  <PreviewCard
    fontClass="font-mono"
    textPrimary="text-sky-500"
    textSecondary="text-gray-500 dark:text-zinc-400"
    bgClass="bg-white dark:bg-zinc-800"
  >
    <div className="w-1 h-4 bg-sky-500"></div>
    <div className="w-1 h-4 bg-gray-400"></div>
    <div className="w-1 h-4 bg-gray-300"></div>
  </PreviewCard>
);

export const EarthyPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-emerald-800"
    textSecondary="text-stone-600"
    bgClass="bg-emerald-50"
  >
    <div className="w-4 h-4 rounded-full bg-emerald-800"></div>
    <div className="w-4 h-4 rounded-full bg-stone-500"></div>
    <div className="w-4 h-4 rounded-full bg-amber-600"></div>
  </PreviewCard>
);

export const SwissPreview = () => (
  <PreviewCard
    fontClass="font-sans"
    textPrimary="text-red-600"
    textSecondary="text-black dark:text-zinc-50"
    bgClass="bg-gray-100 dark:bg-zinc-700"
  >
    <div className="w-full h-2 bg-red-600"></div>
  </PreviewCard>
);
