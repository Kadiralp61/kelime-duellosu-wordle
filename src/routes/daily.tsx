import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { getTodayWord, getStats, saveGameResult, PlayerStats } from '../utils/daily';
import { DailyStatsModal } from '../components/daily-stats-modal';

const KELIME_LISTESI = [
  "AÇLIK", "ABİYE", "CACIK", "CAMCI", "CÜMLE", "ÇÖPÇÜ", "ÇÜRÜK", 
  "ÇÖZÜM", "DİLİM", "DAİMİ", "DİLEK", "DIŞKI", "EZBER", "EVLAT", "ENFES", 
  "FOSİL", "FELEK", "GAYET", "GİYİM", "GAZOZ", "HAMAK", "HOŞAF", "HAMSİ", 
  "İNKAR", "IRKÇI", "ILGAZ", "JOKEY", "KREDİ", "KALIN", 
  "KABLO", "LÜZUM", "LOTUS", "LEĞEN", "MEVLA", "MASAL", "MELEZ", "NİŞAN", 
 "NİNNİ", "OĞLAK", "ÖRDEK", "PİLOT", "POSTA", "RAMPA", "ROMAN", 
  "SAKIZ", "SAVCI", "ŞİFRE", "TEKNE", "UZMAN", "ÜZGÜN", "VAKIF", "YALIN", 
  "ZEHİR", "SAVAŞ", "SİNİR", "ŞAFAK", "ŞURUP", "TAVİZ", "TEPSİ", "UYSAL", 
  "ÜÇGEN", "VİŞNE", "YAKIN", "POLİS", "ÖNLÜK", "ÖDÜNÇ", "POŞET", "NABIZ", 
  "NEZLE", "NARİN", "NAMAZ", "FIKRA", "GÜREŞ", "GÜMÜŞ", "GÜNAH", "GÖREV", 
  "HAFTA", "HARAM", "HAVVA", "HOROZ", "İPTAL", "İPUCU", "İSHAL", "İLHAM", 
  "IRGAT", "ISSIZ", "JAPON", "JİLET", "KÖMÜR", "KORNA", "KORSE", "KAYIK", 
  "LEVHA", "LAVAŞ", "LİSAN", "LİDER", "METRE", "MAKAS", "MERAK", "MİRAS", 
  "CEZVE", "ÇOCUK", "ÇUVAL", "ÇAMUR", "ÇUBUK", "DİREK", "DAYAK", "DARBE", 
  "EŞARP", "ECDAT", "ERKEK"
];

const MAX_TRIES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "SİL"]
];

export const Route = createFileRoute('/daily')({
  component: DailyPage,
});

function DailyPage() {
  const [targetWord] = useState(() => getTodayWord(KELIME_LISTESI).toUpperCase());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [stats, setStats] = useState<PlayerStats>(() => getStats());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastPlayedDate === today) {
      setIsGameOver(true);
      setIsModalOpen(true);
    }
  }, [stats.lastPlayedDate]);

  const handleFinishGame = useCallback((win: boolean) => {
    const updatedStats = saveGameResult(win);
    setStats(updatedStats);
    setIsWin(win);
    setIsGameOver(true);
    setIsModalOpen(true);
  }, []);

  const handleCharInput = useCallback((char: string) => {
    if (isGameOver) return;
    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + char);
    }
  }, [currentGuess, isGameOver]);

  const handleDelete = useCallback(() => {
    if (isGameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameOver]);

  const handleSubmit = useCallback(() => {
    if (isGameOver) return;
    if (currentGuess.length !== WORD_LENGTH) {
      alert("Kelime 5 harfli olmalıdır!");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      handleFinishGame(true);
    } else if (newGuesses.length >= MAX_TRIES) {
      handleFinishGame(false);
    }
  }, [currentGuess, guesses, isGameOver, targetWord, handleFinishGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else {
        const char = e.key.toLocaleUpperCase('tr-TR');
        if (/^[A-ZÇĞİÖŞÜ]$/.test(char)) {
          handleCharInput(char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput, handleDelete, handleSubmit, isGameOver]);

  // ✅ DÜZELTİLEN MANTIK: Satırdaki tüm harflerin durumunu harf frekansına göre 2 pas ile hesaplar
  const getRowStatuses = (word: string) => {
    const statuses = new Array(WORD_LENGTH).fill('bg-slate-700 border-slate-600 text-slate-300');
    const targetCounts: Record<string, number> = {};

    // 1. Hedef kelimedeki harf sayılarını çıkar
    for (const char of targetWord) {
      targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    // 2. Pas: Yeşilleri bul ve harf sayılarını düş
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (word[i] === targetWord[i]) {
        statuses[i] = 'bg-emerald-600 border-emerald-500 text-white';
        targetCounts[word[i]]--;
      }
    }

    // 3. Pas: Sarıları ve Grileri belirle
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (word[i] === targetWord[i]) continue; // Yeşil olanları atla

      const char = word[i];
      if (targetCounts[char] && targetCounts[char] > 0) {
        statuses[i] = 'bg-amber-500 border-amber-400 text-white';
        targetCounts[char]--;
      }
    }

    return statuses;
  };

  // ✅ DÜZELTİLEN MANTIK: Sanal Klavyedeki harf durumları
  const getKeyStatus = (key: string) => {
    let isCorrect = false;
    let isPresent = false;
    let isUsed = false;

    for (const g of guesses) {
      const rowStatuses = getRowStatuses(g);
      for (let i = 0; i < g.length; i++) {
        if (g[i] === key) {
          isUsed = true;
          if (rowStatuses[i].includes('emerald')) isCorrect = true;
          else if (rowStatuses[i].includes('amber')) isPresent = true;
        }
      }
    }

    if (isCorrect) return 'bg-emerald-600 text-white';
    if (isPresent) return 'bg-amber-500 text-white';
    if (isUsed) return 'bg-slate-900 text-slate-500 border border-slate-800';
    return 'bg-slate-800 text-white hover:bg-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 selection:bg-none relative">
      <div className="w-full max-w-lg flex items-center justify-between mt-2 mb-4">
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
          ← Ana Sayfa
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold flex items-center gap-2 justify-center">
            📅 Günlük Mod
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Her gün tek hakkın var!</p>
        </div>
        <div className="w-12"></div> {/* Dengeleme için boş alan */}
      </div>

      <div className="grid grid-rows-6 gap-2 my-auto">
        {Array.from({ length: MAX_TRIES }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;
          const rowStatuses = guess ? getRowStatuses(guess) : [];

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = '';
                let statusClass = 'bg-slate-900 border-slate-800 text-white';

                if (guess) {
                  letter = guess[colIndex];
                  statusClass = rowStatuses[colIndex];
                } else if (isCurrentRow && currentGuess[colIndex]) {
                  letter = currentGuess[colIndex];
                  statusClass = 'bg-slate-800 border-slate-500 text-white animate-pulse';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black uppercase transition-all duration-300 ${statusClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-lg mb-2 flex flex-col gap-1.5 px-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'SİL';
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'ENTER') handleSubmit();
                    else if (key === 'SİL') handleDelete();
                    else handleCharInput(key);
                  }}
                  className={`h-12 rounded-lg font-bold text-xs sm:text-sm transition flex items-center justify-center active:scale-95 ${
                    isSpecial ? 'px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold' : `flex-1 ${getKeyStatus(key)}`
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <DailyStatsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        stats={stats} 
        isWin={isWin} 
        targetWord={targetWord} 
      />
    </div>
  );
}