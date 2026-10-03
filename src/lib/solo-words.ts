// Türkçe kelime havuzu — Tekli ve Oda modları için harf uzunluğu ve zorluk kademeleri.

export type Difficulty = "kolay" | "orta" | "zor";
export type WordLength = 5 | 6 | 7;

function getLetters(word: string): string[] {
  return [...word.trim()];
}

const RAW_5: Record<Difficulty, string[]> = {
  kolay: [
    "KİTAP", "KALEM", "MASAL", "BALIK", "ÇİÇEK", "ÇOCUK", "KÖPEK", "BAHÇE",
    "TAVUK", "DENİZ", "GÜNEŞ", "ARABA", "SAYFA", "MUTLU", "SEVGİ", "TATLI",
    "PASTA", "ŞEKER", "KAHVE", "ORMAN", "NEHİR", "BULUT", "CEKET", "TABAK",
    "KAŞIK", "ÇATAL", "KOMŞU", "BEBEK", "SİLGİ", "GELİN", "DAMAT", "ELMAS",
    "YEMEK", "KAPAK", "KUMAŞ", "YOLCU", "YAKIN", "BURUN", "ÖRDEK", "BADEM",
    "KADER", "KEDER", "YARIŞ", "ZİRVE", "DUVAR", "ÇANTA", "RADYO", "SEHPA",
    "ASLAN", "TİLKİ", "ŞAHİN", "SİNEK", "ÇAYIR", "IRMAK", "DOLAP",
    "PERDE", "KAĞIT", "LAMBA", "FENER", "KİLİM", "SEPET", "MAKAS",
    "ÇİLEK", "LİMON", "KİRAZ", "VİŞNE", "SOĞAN", "İNSAN", "DÜNYA", "ZAMAN",
    "AKŞAM", "SABAH", "YÜREK", "BEYAZ", "SİYAH", "YEŞİL", "ÇAMUR", "DÜDÜK",
    "TAVAN", "TABAN", "MERAK", "KURAL", "SICAK", "KAÇAK", "KÜREK",
    "SİMİT", "TUZLU", "KAYIK", "BİZİM", "KUZEN", "HIZLI", "YAVAŞ",
  ],
  orta: [
    "DALGA", "FİDAN", "KUZEY", "GÜNEY", "MEZAR", "NAMAZ", "REÇEL", "TASMA",
    "VİTES", "DÖŞEK", "YAKUT", "ZEMİN", "GÜMÜŞ", "TÜNEL", "HAVUZ", "FIRIN",
    "KADEH", "MANTO", "NAKIŞ", "ŞİFRE", "TANIK", "COŞKU", "LEHÇE", "PERON",
    "SIĞIR", "HAMLE", "İNANÇ", "SÖĞÜT", "ZİYAN", "AMBAR", "JETON", "YELEK",
    "ZEHİR", "ÇEVİK", "HALKA", "BÖLÜM", "KUMAR", "LİMAN", "METRO", "MESAİ",
    "BÜTÇE", "LÜGAT", "BÜŞRA", "FİKİR", "ÇELİŞ", "NADAS",
    "KADİR", "EVRAK", "GİZEM", "SİHİR", "SEVAP", "NİMET", "KASIT", "KASİS",
    "FESAT", "DERYA", "MİRAS", "MİMAR", "YALAN", "İDRAK", "ŞÜPHE", "BASKI",
    "TEPKİ", "KAYGI", "DENEY", "HEDEF", "ŞAHİT", "BİLGE",
  ],
  zor: [
    "ZAHİR", "YEĞİN", "FASIL", "KUTUP", "ŞAYAN", "SEBAT", "LAHZA", "OTLUK",
    "HASIL", "NUTUK", "SÜKUT", "MUHİT", "MEBUS", "RAKIM", "REFAH", "ŞAFAK",
    "AHLAK", "AFYON", "CÜMLE", "İSTİF", "MENFİ", "MİLAT", "ELZEM", "MERAM",
    "BEDEL", "KEFİL", "TAHIL", "NAZİK", "LÜTUF", "MEDET", "MİRAS", "AZMET",
    "BEYAN", "CELSE", "DEVİR", "EMSAL", "FERAH", "GAFİL", "HÜLYA", "MECAZ",
    "NEBAT", "GİZEM", "İDRAK", "İNKAR", "İTHAL", "İHRAÇ",
  ],
};

const RAW_6: Record<Difficulty, string[]> = {
  kolay: [
    "BALKON", "TAVŞAN", "KAPLAN", "SANDAL", "HAYVAN", "MEKTUP", "SANDIK", "KAMYON", 
  "KARDEŞ", "GÖZLÜK", "HORTUM", "LAHANA", "MANTAR", "YASTIK", "YORGAN", "KAPTAN", 
  "GÖMLEK", "BERBER", "GÜNDÜZ", "MENDİL", "DOKTOR", "KAYISI", "GÜNLÜK", "SULTAN", 
  "VOLKAN", "YARASA", "ZEYTİN", "MERCAN", "HEYKEL", "BALİNA", "FISTIK", "FINDIK", 
  "SALATA", "SEMBOL", "TABELA", "BAKKAL", "LEVREK", "SİNEMA", "ZÜRAFA", "ÇATLAK", 
  "ÇARDAK", "RESSAM", "PIRASA", "ORKİDE", "MUTFAK", "KUMSAL", "YELKEN", "ABDEST", 
  "AHİRET", "AKILLI", "BALAYI", "BAKİYE", "BİTTER", "CÜZDAN", "CÖMERT", "ÇEYREK", 
  "ÇEMBER", "ÇIPLAK", "DAKİKA", "DALGIÇ", "DEFOLU", "DİKKAT", "ECZACI", "EMANET", 
  "ERİŞTE", "FİLTRE", "FİNCAN", "FİNANS", "GOFRET", "GÜNCEL", "HAKSIZ", "HAMİLE", 
  "HANGAR", "İÇECEK", "İNŞAAT", "İYİLİK", "ILIMAN", "JEOLOG", "KAFEİN", "KAKTÜS", 
  "KİRPİK", "KRAKER", "LAKTOZ", "MECLİS", "MERKEZ", "NEFRET", 
  "NUMUNE", "OKLAVA", "OTOGAR", "ÖZVERİ", "ÖNEMLİ", "PİYASA", "PEYNİR", "PROTEZ", 
  "PARFÜM", "RÜZGAR", "SANİYE", "SAĞDIÇ", "SAĞLAM", "ŞAMDAN", "TABLET", 
  "TOPTAN", "TROPİK", "TABİAT", "TERMAL", "ULAŞIM", "ÜLKÜCÜ", "ÜRETİM", "VADELİ", 
  "VİZYON", "YAPRAK", "YAZLIK", "YÜKLÜK", "ZAHMET", "ZİNCİR", "ZEYBEK",
   
  ],
  orta: [
    "ATMACA", "ZAMBAK", "KUTSAL", "TUTSAK", "KAYNAK", "GÜNCEL", "YÖNTEM", "GEÇMİŞ", 
  "SÖZLÜK", "GEVREK", "DEVRAN", "TİCARİ", "KAPALI", "TERAZİ", "TABİAT", "TAKDİR", 
  "KUZGUN", "MEVSİM", "TEDBİR", "TENKİT", "MANTIK", "AMATÖR", "ANTİKA", "ADLİYE", 
  "BAKKAL", "BALKON", "BECERİ", "CAZİBE", "COŞKUN", "ÇAKMAK", "ÇEVİRİ", "DEMLİK", 
  "DEFTER", "DEVLET", "EMEKLİ", "ELVEDA", "FİZİKİ", "FORMÜL", "FOSFOR", "GALERİ", 
  "GALETA", "GÖMLEK", "HAYVAN", "HAYLAZ", "HIRSIZ", "İBADET", "İKİLEM", "İLİŞKİ", 
  "IZGARA", "JAKUZİ", "KANEPE", "KANGAL", "KARPUZ", "KISMET", "LASTİK", "MEDENİ", 
  "MAKBUZ", "MANGAL", "NAYLON", "NAFAKA", "OKUMAK", "OTOYOL", "ÖPÜCÜK", "ÖZENTİ", 
  "PASTEL", "PANCAR", "PAROLA", "RAFİNE", "SAYGIN", "SEÇMEN", "SİNYAL", "ŞEFKAT", 
  "TABAKA", "TEŞHİR", "TIRNAK", "TURİZM", "TERLİK", "ULUSAL", "ÜZÜNTÜ", "VESİLE", 
  "VERNİK", "YILDIZ", "YÜKSÜK", "YORGAN", "ZABITA", "ZANAAT",
  ],
 zor: [
  "MELEKE", "HİLKAT", "FITRAT", "NÜMUNE", "MÜBHEM", "RİSALE", "HİKMET", 
  "MAHREM", "TAKRİR", "TAHKİK", "NİRENGİ", "MUZLİM", "METRUK", "ZARAFET", 
  "PESTİL", "ABAJUR", "ABAKÜS",
],
};

const RAW_7: Record<Difficulty, string[]> = {
  kolay: [
    "PENCERE", "KARINCA", "FASULYE", "KUMBARA", "TABANCA", "TİYATRO", "UÇURTMA",
    "PATATES", "POSTACI", "PAMUKLU", "MENEKŞE", "YELPAZE", "ÖĞRENCİ", "ÇEKMECE",
    "GARANTİ", "KARAKOL", "BALIKÇI", "PROGRAM", "KILAVUZ", "KESTANE", "LAVANTA",
    "ORMANCI", "HASTANE", "TELEFON", "KUYUMCU","TABANCA", "TELEFON", "UYANMAK", "UZUNLUK", "USLANMA",
  "ÜCRETLİ", "ÜROLOJİ", "VASİYET", "VANİLYA", "VERASET", "YAĞIŞLI", "YATIRIM", 
  "YAPIMCI", "YEMEKLİ", "ZEHİRLİ", "ZİYAFET", "ZOOLOJİ"
  ],
  orta: [
    "TİCARET", "SANATÇI", "MERAKLI", "FABRİKA", "GİTARCI", "MASALCI", "TAKSİCİ",
    "YARARLI", "ZARARLI", "KOLONYA", "MERDANE", "ISPANAK", "ENGİNAR", "BİLMECE",
    "EĞLENCE", "MUHABİR", "TESADÜF", "TAKVİYE", "ŞÜPHELİ", "ISRARLI", "KAPORTA",
    "YATIRIM", "YAZILIM", "VALİLİK","DENİZCİ", "DİRİLİŞ", "EĞİTMEN", "EGZOTİK", "EMLAKÇI", "FELAKET", "FABRİKA", 
  "GENELGE", "GIRTLAK", "HAZİRAN", "HİPOTEZ", "İTFAİYE", "İNTİKAM", "ISPANAK", 
  "IZDIRAP", "ISRARCI", "JAPONCA", "JELATİN", "KADROLU", "KAFADAR", "KANARYA", 
  "KARİYER", "KAMUOYU", "KAMELYA", "LANETLİ", "LAVANTA", "MEDİKAL", "MEDRESE", 
  "NAKLİYE", "NİKAHLI", "NÖBETÇİ", "OBEZİTE", "OKYANUS", "OYUNCAK", "ÖZVATAN", 
  "ÖNCÜLÜK", "PALYAÇO", "PALMİYE", "PAYETLİ", "REFLEKS", "RİVAYET", "RÜTBELİ", 
  "SANATÇI", "SANTRAL", "SELAMET", "SENARYO", "ŞEHİRLİ", "ŞÖVALYE", "ŞÜPHELİ", 
  "TAAHHÜT","GEZEGEN", "GIYABEN", "HASETÇİ", "HALKEVİ", "İSTİSNA", "İZDİVAÇ", "İZMARİT", 
  "ISLAHAT", "ISPARTA", "JÜPİTER", "JEOLOJİ", "KABURGA", "KAÇAKÇI", "KANGURU", 
  "KADINSI", "KARİZMA", "LANGIRT", "LÖKOSİT", "MADALYA", "MARUZAT", "MUALLİM",
  ],
  zor: [
    "ŞAHESER", "MERASİM", "TEDARİK", "MEZİYET", "HÜVİYET", "ISTIRAP", "TAARRUZ",
    "TENAKUZ","ÜRPERTİ", "VEZNECİ", "VİLAYET", "VİYADÜK", "YABANCI", "YADİGAR", "YARGICI", 
  "ZARARLI", "ZİYARET", "ALERJİK", "ALKOLİK", "ARINMAK", "BOŞANMA", "BİLMECE", 
  "BÖRÜLCE", "CİĞERCİ", "CAMEKAN", "CEZAEVİ", "ÇELİŞKİ", "ÇEŞNİCİ", "DEMLEME","ŞAİBELİ", "TAHARET", "TAKINTI", "TEMİNAT",
  "PARAVAN", "PARAZİT", "RADİKAL", "RAFADAN", "SECCADE","LANGIRT", "LÖKOSİT","TENAKUZ", "ADAPTÖR","DEFATEN",
  ],
};

function only(len: number, arr: string[]) {
  return arr.filter((w) => getLetters(w).length === len);
}

function onlyByDifficulty(len: number, raw: Record<Difficulty, string[]>): Record<Difficulty, string[]> {
  return {
    kolay: only(len, raw.kolay),
    orta: only(len, raw.orta),
    zor: only(len, raw.zor),
  };
}

export const WORDS_5: Record<Difficulty, string[]> = onlyByDifficulty(5, RAW_5);
export const WORDS_6: Record<Difficulty, string[]> = onlyByDifficulty(6, RAW_6);
export const WORDS_7: Record<Difficulty, string[]> = onlyByDifficulty(7, RAW_7);

export function pickWord(length: WordLength, difficulty: Difficulty, exclude?: string): string {
  const pool: string[] =
    length === 5 ? WORDS_5[difficulty] : length === 6 ? WORDS_6[difficulty] : WORDS_7[difficulty];

  if (!pool || pool.length === 0) {
    throw new Error(`[solo-words] ${length} harf / ${difficulty} zorluk havuzu boş.`);
  }

  const filtered = pool.filter((w) => w !== exclude);
  const src = filtered.length > 0 ? filtered : pool;
  return src[Math.floor(Math.random() * src.length)];
}