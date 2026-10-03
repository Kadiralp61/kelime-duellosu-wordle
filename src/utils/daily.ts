// src/utils/daily.ts

// 1. Seri (Streak) ve İstatistik Veri Tipi
export interface PlayerStats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayedDate: string;
}

// Varsayılan İstatistik Değerleri
const DEFAULT_STATS: PlayerStats = {
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  lastPlayedDate: '',
};

// Günün tarihini YYYY-MM-DD formatında döner
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 2. Günün kelimesini seçen fonksiyon (5 Harfli)
export function getTodayWord(wordList: string[]): string {
  if (!wordList || wordList.length === 0) return '';
  
  const today = getTodayDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % wordList.length;
  return wordList[index];
}

// 3. İstatistikleri okuma
export function getStats(): PlayerStats {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STATS };
  }
  
  try {
    const saved = localStorage.getItem('kd_daily_stats');
    return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : { ...DEFAULT_STATS };
  } catch (error) {
    console.error('İstatistikler okunurken hata oluştu:', error);
    return { ...DEFAULT_STATS };
  }
}

// 4. İstatistikleri kaydetme / güncelleme
export function saveGameResult(isWin: boolean): PlayerStats {
  const today = getTodayDateString();
  const stats = getStats();

  // Bugün zaten oynandıysa mevcut istatistiği dön
  if (stats.lastPlayedDate === today) {
    return stats;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (stats.lastPlayedDate === yesterday) {
    stats.currentStreak = isWin ? stats.currentStreak + 1 : 0;
  } else {
    stats.currentStreak = isWin ? 1 : 0;
  }

  if (stats.currentStreak > stats.maxStreak) {
    stats.maxStreak = stats.currentStreak;
  }

  stats.gamesPlayed += 1;
  if (isWin) stats.gamesWon += 1;
  stats.lastPlayedDate = today;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kd_daily_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('İstatistikler kaydedilirken hata oluştu:', error);
    }
  }

  return stats;
}