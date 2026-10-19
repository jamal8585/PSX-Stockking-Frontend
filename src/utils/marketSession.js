export const SECTOR_CATEGORIES = [
  { id: 'OIL_GAS', label: 'Oil, Gas & Refineries' },
  { id: 'COMMERCIAL_BANKS', label: 'Commercial Banks' },
  { id: 'TECHNOLOGY', label: 'Technology & Telecom' },
  { id: 'CEMENT', label: 'Cement & Construction' },
  { id: 'FERTILIZER', label: 'Fertilizer & Agri' },
  { id: 'AUTOMOBILE', label: 'Automobile & Tractors' },
  { id: 'POWER_ENERGY', label: 'Power Generation & Energy' },
  { id: 'PHARMACEUTICALS', label: 'Pharmaceuticals & Health' },
  { id: 'STEEL_ENGINEERING', label: 'Steel & Engineering' },
  { id: 'TEXTILE', label: 'Textile & Apparel' },
  { id: 'SUGAR_FOOD', label: 'Food, Dairy & Sugar' },
  { id: 'MACRO_ECONOMY', label: 'Macro Economy & IMF' }
];

export const MASTER_STOCKS_LIST = [
  { symbol: 'PRL', name: 'Pakistan Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'CNERGY', name: 'Cnergyico PK Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'ATRL', name: 'Attock Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'NRL', name: 'National Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'OGDC', name: 'Oil & Gas Development Company Ltd', sector: 'Oil & Gas Exploration Companies', category: 'OIL_GAS' },
  { symbol: 'PPL', name: 'Pakistan Petroleum Limited', sector: 'Oil & Gas Exploration Companies', category: 'OIL_GAS' },
  { symbol: 'MARI', name: 'Mari Petroleum Company Limited', sector: 'Oil & Gas Exploration Companies', category: 'OIL_GAS' },
  { symbol: 'PSO', name: 'Pakistan State Oil Company Limited', sector: 'Oil & Gas Marketing Companies', category: 'OIL_GAS' },
  { symbol: 'SNGP', name: 'Sui Northern Gas Pipelines Limited', sector: 'Oil & Gas Marketing Companies', category: 'OIL_GAS' },
  { symbol: 'SSGC', name: 'Sui Southern Gas Company Limited', sector: 'Oil & Gas Marketing Companies', category: 'OIL_GAS' },
  { symbol: 'MEBL', name: 'Meezan Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'MCB', name: 'MCB Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'UBL', name: 'United Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BAFL', name: 'Bank Alfalah Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BAHL', name: 'Bank AL Habib Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BOP', name: 'The Bank of Punjab', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'HBL', name: 'Habib Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'NBP', name: 'National Bank of Pakistan', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BIPL', name: 'BankIslami Pakistan Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'NETSOL', name: 'NetSol Technologies Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'TRG', name: 'TRG Pakistan Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'AVN', name: 'Avanceon Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'OCTOPUS', name: 'Octopus Digital Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'WTL', name: 'WorldCall Telecom Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'TELE', name: 'Telecard Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'PTC', name: 'Pakistan Telecommunication Company Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'LUCK', name: 'Lucky Cement Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'MLCF', name: 'Maple Leaf Cement Factory', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'DGKC', name: 'D.G. Khan Cement Company Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'CHCC', name: 'Cherat Cement Company Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'PIOC', name: 'Pioneer Cement Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'FCCL', name: 'Fauji Cement Company Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'ACPL', name: 'Attock Cement Pakistan Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'FFC', name: 'Fauji Fertilizer Company Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'EFERT', name: 'Engro Fertilizers Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'ENGRO', name: 'Engro Corporation Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'FATIMA', name: 'Fatima Fertilizer Company Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'FFBL', name: 'Fauji Fertilizer Bin Qasim Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'AGL', name: 'Agritech Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'SAZEW', name: 'Sazgar Engineering Works Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'INDU', name: 'Indus Motor Company Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'MTL', name: 'Millat Tractors Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'HCAR', name: 'Honda Atlas Cars (Pakistan) Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'AGTL', name: 'Al-Ghazi Tractors Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'PSMC', name: 'Pak Suzuki Motor Company Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'HUBC', name: 'The Hub Power Company Limited', sector: 'Power Generation & Distribution', category: 'POWER_ENERGY' },
  { symbol: 'KAPCO', name: 'Kot Addu Power Company Limited', sector: 'Power Generation & Distribution', category: 'POWER_ENERGY' },
  { symbol: 'KEL', name: 'K-Electric Limited', sector: 'Power Generation & Distribution', category: 'POWER_ENERGY' },
  { symbol: 'NCPL', name: 'Nishat Chunian Power Limited', sector: 'Power Generation & Distribution', category: 'POWER_ENERGY' },
  { symbol: 'NPL', name: 'Nishat Power Limited', sector: 'Power Generation & Distribution', category: 'POWER_ENERGY' },
  { symbol: 'SEARL', name: 'The Searle Company Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'AGP', name: 'AGP Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'ABOT', name: 'Abbott Laboratories (Pakistan) Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'HINOON', name: 'Highnoon Laboratories Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'GLAXO', name: 'GlaxoSmithKline Pakistan Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'FEROZ', name: 'Ferozsons Laboratories Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'MUGHAL', name: 'Mughal Iron & Steel Industries Limited', sector: 'Engineering', category: 'STEEL_ENGINEERING' },
  { symbol: 'INIL', name: 'International Industries Limited', sector: 'Engineering', category: 'STEEL_ENGINEERING' },
  { symbol: 'ISL', name: 'International Steels Limited', sector: 'Engineering', category: 'STEEL_ENGINEERING' },
  { symbol: 'PAEL', name: 'Pak Elektron Limited', sector: 'Cable & Electrical Goods', category: 'STEEL_ENGINEERING' },
  { symbol: 'ASTL', name: 'Amreli Steels Limited', sector: 'Engineering', category: 'STEEL_ENGINEERING' },
  { symbol: 'ILP', name: 'Interloop Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'NML', name: 'Nishat Mills Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'KTML', name: 'Kohinoor Textile Mills Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'GATM', name: 'Gul Ahmed Textile Mills Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'NATF', name: 'National Foods Limited', sector: 'Food & Personal Care Products', category: 'SUGAR_FOOD' },
  { symbol: 'NESTLE', name: 'Nestle Pakistan Limited', sector: 'Food & Personal Care Products', category: 'SUGAR_FOOD' },
  { symbol: 'TOMCL', name: 'The Organic Meat Company Limited', sector: 'Food & Personal Care Products', category: 'SUGAR_FOOD' },
  { symbol: 'UNITY', name: 'Unity Foods Limited', sector: 'Food & Personal Care Products', category: 'SUGAR_FOOD' }
];

export function canonicalizeSector(rawSector, symbol = '') {
  const sym = String(symbol || '').toUpperCase().trim();
  if (sym === 'ENGRO') return 'Fertilizer';
  if (!rawSector || rawSector === 'General Market' || rawSector === 'Miscellaneous') {
    return 'Miscellaneous';
  }
  const s = rawSector.trim();
  if (s === 'Chemicals') return 'Chemical';
  if (s === 'Oil & Gas (E&P)' || s === 'Oil & Gas Exploration') return 'Oil & Gas Exploration Companies';
  if (s === 'Oil & Gas (Marketing)' || s === 'Oil & Gas Marketing') return 'Oil & Gas Marketing Companies';
  if (s === 'Power Generation' || s === 'Power Generation & Energy') return 'Power Generation & Distribution';
  if (s === 'Automobile' || s === 'Automobile & Tractors') return 'Automobile Assembler';
  if (s === 'Cement & Construction') return 'Cement';
  if (s === 'Textile & Apparel' || s === 'Textile') return 'Textile Composite';
  if (s === 'Technology' || s === 'Technology & Telecom') return 'Technology & Communication';
  if (s === 'Food & Personal Care' || s === 'Consumer & Staples' || s === 'Food, Dairy & Sugar') return 'Food & Personal Care Products';
  if (s === 'Engineering & Steel' || s === 'Steel & Engineering') return 'Engineering';
  return s;
}

export function getCompanyFullName(symbol) {
  if (!symbol) return '';
  const sym = String(symbol).toUpperCase().trim();
  const stock = MASTER_STOCKS_LIST.find(s => s.symbol.toUpperCase() === sym);
  return stock?.name || sym;
}

export function getNextPSXTradingDate(pktDate = null) {
  const d = pktDate ? new Date(pktDate) : (() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5));
  })();
  const day = d.getDay();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeNum = hours * 100 + minutes;

  const next = new Date(d);
  if (day === 5 && timeNum >= 1600) {
    next.setDate(d.getDate() + 3);
  } else if (day === 6) {
    next.setDate(d.getDate() + 2);
  } else if (day === 0) {
    next.setDate(d.getDate() + 1);
  } else if (timeNum >= 1600) {
    next.setDate(d.getDate() + 1);
  } else {
    // During pre-market or live hours on a trading day, target is today
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
  }
  return next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
}

export function getPSXMarketSessionInfo() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  const day = pktDate.getDay();
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const timeNum = hours * 100 + minutes;

  let targetDate = new Date(pktDate);
  let isWeekend = false;
  let isFridayEod = false;
  let isPreMarket = false;
  let isPostMarket = false;
  let isLive = false;
  let statusBadge = '';
  let subText = '';

  if (day === 6) { // Saturday
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 2);
    const nextFmt = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = 'Post-Market Analysis • Weekend Closed';
    subText = `Actionable for Upcoming Monday PSX Market Open (${nextFmt})`;
  } else if (day === 0) { // Sunday
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 1);
    const nextFmt = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = 'Pre-Market Intelligence • Weekend Closed';
    subText = `Actionable for Tomorrow's Monday PSX Market Open (${nextFmt})`;
  } else if (day === 5 && timeNum >= 1600) { // Friday Post-Market (4:00 PM to 11:59 PM PKT)
    isFridayEod = true;
    isPostMarket = true;
    targetDate.setDate(pktDate.getDate() + 3);
    const nextFmt = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = `Post-Market Analysis • Actionable for Upcoming Monday PSX Market Open (${nextFmt})`;
    subText = `Actionable for Upcoming Monday PSX Market Open (${nextFmt})`;
  } else if (timeNum >= 1600) { // Monday-Thursday Post-Market (4:00 PM to 11:59 PM PKT)
    isPostMarket = true;
    targetDate.setDate(pktDate.getDate() + 1);
    const nextFmt = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = `Post-Market Analysis • Actionable for Tomorrow (${nextFmt})`;
    subText = `Actionable for Tomorrow (${nextFmt})`;
  } else if (timeNum < 915) { // Midnight to 09:14 AM PKT (Pre-Market Phase)
    isPreMarket = true;
    targetDate = pktDate;
    const todayFmt = pktDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = `Pre-Market Intelligence • Actionable for Today's PSX Open (${todayFmt})`;
    subText = `Actionable for Today's PSX Open (${todayFmt})`;
  } else { // 09:15 AM to 04:00 PM PKT (Live Market Session)
    isLive = true;
    targetDate = pktDate;
    const todayFmt = pktDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    statusBadge = 'Live Trading Session • Today, ' + todayFmt;
    subText = "Effective & Actionable for Today's PSX Market (09:15 AM PKT)";
  }

  const sessionDateFormatted = targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi'
  });

  const cardDateFormatted = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Karachi'
  });

  return {
    isWeekend,
    isFridayEod,
    isPreMarket,
    isPostMarket,
    isLive,
    targetDate,
    sessionDateFormatted,
    cardDateFormatted,
    statusBadge,
    subText,
    pktHours: hours,
    pktMinutes: minutes
  };
}

export function getActiveSessionNewsCutoffDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  const day = pktDate.getDay();
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const timeNum = hours * 100 + minutes;

  let maxAgeHours = 36;
  if (day === 6) {
    maxAgeHours = 48;
  } else if (day === 0) {
    maxAgeHours = 72;
  } else if (day === 1 && timeNum < 1600) {
    maxAgeHours = 80;
  } else if (day === 5 && timeNum >= 1600) {
    maxAgeHours = 36;
  } else {
    maxAgeHours = 36;
  }

  const cutoffMs = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  return new Date(cutoffMs);
}

export function isWithinActiveMarketSession(date) {
  if (!date) return true;
  const d = new Date(date);
  if (isNaN(d.getTime())) return true;
  const cutoff = getActiveSessionNewsCutoffDate();
  return d.getTime() >= cutoff.getTime();
}

export function getPSXMarketStatus() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5)); // Pakistan Standard Time (UTC+5)
  const day = pktDate.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const totalMins = hours * 60 + minutes;

  const pktTimeString = pktDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' PKT';

  // 1. Weekend Check (Saturday & Sunday Closed)
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      status: 'CLOSED',
      badgeText: 'PSX CLOSED',
      subText: 'Weekend Closed (Reopens Mon 09:15 AM PKT)',
      color: 'rose',
      pktTimeString
    };
  }

  // 2. Friday PSX Split Schedule
  // S1: 09:15 - 12:00 (555 - 720 mins)
  // Break: 12:00 - 14:30 (720 - 870 mins)
  // S2: 14:30 - 16:30 (870 - 990 mins)
  if (day === 5) {
    if (totalMins >= 555 && totalMins <= 720) {
      return {
        isOpen: true,
        status: 'OPEN',
        badgeText: 'PSX LIVE',
        subText: 'Friday Session 1 (till 12:00 PM PKT)',
        color: 'emerald',
        pktTimeString
      };
    } else if (totalMins > 720 && totalMins < 870) {
      return {
        isOpen: false,
        status: 'BREAK',
        badgeText: 'PRAYER BREAK',
        subText: 'Friday Prayer Break (Resumes 02:30 PM PKT)',
        color: 'amber',
        pktTimeString
      };
    } else if (totalMins >= 870 && totalMins <= 990) {
      return {
        isOpen: true,
        status: 'OPEN',
        badgeText: 'PSX LIVE',
        subText: 'Friday Session 2 (till 04:30 PM PKT)',
        color: 'emerald',
        pktTimeString
      };
    } else if (totalMins < 555) {
      return {
        isOpen: false,
        status: 'PRE_MARKET',
        badgeText: 'PRE-MARKET',
        subText: 'Pre-Market (Opens 09:15 AM PKT)',
        color: 'amber',
        pktTimeString
      };
    } else {
      return {
        isOpen: false,
        status: 'CLOSED',
        badgeText: 'PSX CLOSED',
        subText: 'Friday Closed (Reopens Mon 09:15 AM PKT)',
        color: 'rose',
        pktTimeString
      };
    }
  }

  // 3. Monday to Thursday Regular PSX Schedule
  // Continuous Trading: 09:15 - 15:30 (555 - 930 mins)
  if (totalMins >= 555 && totalMins <= 930) {
    return {
      isOpen: true,
      status: 'OPEN',
      badgeText: 'PSX LIVE',
      subText: 'Continuous Session (till 03:30 PM PKT)',
      color: 'emerald',
      pktTimeString
    };
  } else if (totalMins < 555) {
    return {
      isOpen: false,
      status: 'PRE_MARKET',
      badgeText: 'PRE-MARKET',
      subText: 'Pre-Market (Opens 09:15 AM PKT)',
      color: 'amber',
      pktTimeString
    };
  } else {
    return {
      isOpen: false,
      status: 'CLOSED',
      badgeText: 'PSX CLOSED',
      subText: 'Regular Session Closed (Reopens 09:15 AM PKT)',
      color: 'rose',
      pktTimeString
    };
  }
}

// Authoritative synchronized KSE-100 Default Summary across Ticker Tape & Market Hero
export const DEFAULT_KSE100_SUMMARY = {
  current: 166419.71,
  currentValue: 166419.71,
  prevClose: 166186.16,
  change: 233.55,
  changePercent: 0.14,
  high: 166708.36,
  low: 165956.51,
  advances: 468,
  declines: 267,
  unchanged: 28,
  indexName: 'KSE-100',
  marketSentiment: 'BULLISH'
};

export const DEFAULT_CURATED_BREADTH = {
  advances: 18,
  declines: 42,
  unchanged: 4,
  total: 64
};

export const DEFAULT_PRO_BREADTH = {
  advances: 468,
  declines: 267,
  unchanged: 28,
  total: 763
};


