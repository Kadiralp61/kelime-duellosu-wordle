// src/components/daily-stats-modal.tsx
import React, { useState } from 'react';
import { PlayerStats } from '../utils/daily';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  isWin: boolean;
  targetWord: string;
}

export const DailyStatsModal: React.FC<Props> = ({ isOpen, onClose, stats, isWin, targetWord }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  // Sadece Seri ve Link içeren kısa mesaj
  const getShareText = () => {
    const url = window.location.href;
    return `👑 Kelime Düellosu - Günlük Mod\n` +
      `🔥 Seri: ${stats.currentStreak} Gün\n\n` +
      `Sen de kelimeyi tahmin edebilir misin? 👇\n${url}`;
  };

  // 1. Sadece Panoya Kopyalama Fonksiyonu
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  // 2. Native Paylaşım Menüsü Açma Fonksiyonu
  const handleShare = async () => {
    const shareText = getShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kelime Düellosu',
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Paylaşım hatası:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center text-white shadow-2xl relative">
        <h2 className="text-2xl font-extrabold mb-1">
          {isWin ? '🎉 TEBRİKLER!' : '😔 SAĞLIK OLSUN!'}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {isWin ? 'Günün kelimesini bildin!' : `Günün kelimesi: ${targetWord}`}
        </p>

        <div className="grid grid-cols-4 gap-2 my-6">
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-[10px] text-slate-400 uppercase">Oyun</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-xl font-bold">%{winRate}</div>
            <div className="text-[10px] text-slate-400 uppercase">Kazanma</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg border border-amber-500/40">
            <div className="text-xl font-bold text-amber-400">🔥 {stats.currentStreak}</div>
            <div className="text-[10px] text-slate-400 uppercase">Seri</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-xl font-bold">{stats.maxStreak}</div>
            <div className="text-[10px] text-slate-400 uppercase">En İyi</div>
          </div>
        </div>

        <p className="text-xs text-slate-400 bg-slate-800/50 py-2 px-3 rounded-lg mb-6">
          ⏳ Yeni kelime yarın 00:00'da açılacak!
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button 
              onClick={handleShare} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold py-3 px-3 rounded-xl transition text-sm flex items-center justify-center gap-1"
            >
              Paylaş 🚀
            </button>

            <button 
              onClick={handleCopy} 
              className={`font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm border ${
                copied 
                  ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 scale-95' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Metni Panoya Kopyala"
            >
              {copied ? 'Kopyalandı! 📋' : 'Kopyala 📋'}
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="w-full bg-slate-800/60 hover:bg-slate-800 font-bold py-2.5 px-4 rounded-xl transition text-slate-400 text-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};