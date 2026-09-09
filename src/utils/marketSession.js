export const SECTOR_CATEGORIES = [
  { id: 'OIL_GAS', label: 'Oil, Gas & Refineries', icon: '🛢️' },
  { id: 'COMMERCIAL_BANKS', label: 'Commercial Banks', icon: '🏦' },
  { id: 'TECHNOLOGY', label: 'Technology & Telecom', icon: '💻' },
  { id: 'CEMENT', label: 'Cement & Construction', icon: '🏗️' },
  { id: 'FERTILIZER', label: 'Fertilizer & Agri', icon: '🌱' },
  { id: 'AUTOMOBILE', label: 'Automobile & Tractors', icon: '🚗' },
  { id: 'POWER_ENERGY', label: 'Power Generation & Energy', icon: '⚡' },
  { id: 'PHARMACEUTICALS', label: 'Pharmaceuticals & Health', icon: '💊' },
  { id: 'STEEL_ENGINEERING', label: 'Steel & Engineering', icon: '⚙️' },
  { id: 'TEXTILE', label: 'Textile & Apparel', icon: '🧵' },
  { id: 'SUGAR_FOOD', label: 'Food, Dairy & Sugar', icon: '🌾' },
  { id: 'MACRO_ECONOMY', label: 'Macro Economy & IMF', icon: '📊' }
];

export const MASTER_STOCKS_LIST = [
  { symbol: 'PRL', name: 'Pakistan Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'CNERGY', name: 'Cynergico PK Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'ATRL', name: 'Attock Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'NRL', name: 'National Refinery Limited', sector: 'Refinery', category: 'OIL_GAS' },
  { symbol: 'OGDC', name: 'Oil & Gas Development Co', sector: 'Oil & Gas Exploration', category: 'OIL_GAS' },
  { symbol: 'PPL', name: 'Pakistan Petroleum Limited', sector: 'Oil & Gas Exploration', category: 'OIL_GAS' },
  { symbol: 'MARI', name: 'Mari Petroleum Company', sector: 'Oil & Gas Exploration', category: 'OIL_GAS' },
  { symbol: 'PSO', name: 'Pakistan State Oil', sector: 'Oil & Gas Marketing', category: 'OIL_GAS' },
  { symbol: 'SNGP', name: 'Sui Northern Gas Pipelines', sector: 'Oil & Gas Marketing', category: 'OIL_GAS' },
  { symbol: 'SSGC', name: 'Sui Southern Gas Company', sector: 'Oil & Gas Marketing', category: 'OIL_GAS' },
  { symbol: 'MEBL', name: 'Meezan Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'MCB', name: 'MCB Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'UBL', name: 'United Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BAFL', name: 'Bank Alfalah Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BAHL', name: 'Bank AL Habib Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BOP', name: 'The Bank of Punjab', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'HBL', name: 'Habib Bank Limited', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'NBP', name: 'National Bank of Pakistan', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'BIPL', name: 'BankIslami Pakistan', sector: 'Commercial Banks', category: 'COMMERCIAL_BANKS' },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'NETSOL', name: 'NetSol Technologies Ltd', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'TRG', name: 'TRG Pakistan Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'AVN', name: 'Avanceon Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'OCTOPUS', name: 'Octopus Digital Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'WTL', name: 'WorldCall Telecom', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'TELE', name: 'Telecard Limited', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'PTC', name: 'Pakistan Telecommunication', sector: 'Technology & Communication', category: 'TECHNOLOGY' },
  { symbol: 'LUCK', name: 'Lucky Cement Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'MLCF', name: 'Maple Leaf Cement Factory', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'DGKC', name: 'D.G. Khan Cement Co Ltd', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'CHCC', name: 'Cherat Cement Co Ltd', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'PIOC', name: 'Pioneer Cement Limited', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'FCCL', name: 'Fauji Cement Company', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'ACPL', name: 'Attock Cement Pakistan', sector: 'Cement', category: 'CEMENT' },
  { symbol: 'FFC', name: 'Fauji Fertilizer Company', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'EFERT', name: 'Engro Fertilizers Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'ENGRO', name: 'Engro Corporation', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'FATIMA', name: 'Fatima Fertilizer Co', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'FFBL', name: 'Fauji Fertilizer Bin Qasim', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'AGL', name: 'Agritech Limited', sector: 'Fertilizer', category: 'FERTILIZER' },
  { symbol: 'SAZEW', name: 'Sazgar Engineering Works', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'INDU', name: 'Indus Motor Company Ltd', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'MTL', name: 'Millat Tractors Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'HCAR', name: 'Honda Atlas Cars (Pak)', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'AGTL', name: 'Al-Ghazi Tractors Limited', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'PSMC', name: 'Pak Suzuki Motor Co', sector: 'Automobile Assembler', category: 'AUTOMOBILE' },
  { symbol: 'HUBC', name: 'The Hub Power Company', sector: 'Power Generation', category: 'POWER_ENERGY' },
  { symbol: 'KAPCO', name: 'Kot Addu Power Company', sector: 'Power Generation', category: 'POWER_ENERGY' },
  { symbol: 'KEL', name: 'K-Electric Limited', sector: 'Power Generation', category: 'POWER_ENERGY' },
  { symbol: 'NCPL', name: 'Nishat Chunian Power', sector: 'Power Generation', category: 'POWER_ENERGY' },
  { symbol: 'NPL', name: 'Nishat Power Limited', sector: 'Power Generation', category: 'POWER_ENERGY' },
  { symbol: 'SEARL', name: 'The Searle Company Ltd', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'AGP', name: 'AGP Limited', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'ABOT', name: 'Abbott Laboratories (Pak)', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'HINOON', name: 'Highnoon Laboratories', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'GLAXO', name: 'GlaxoSmithKline (Pak)', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'FEROZ', name: 'Ferozsons Laboratories', sector: 'Pharmaceuticals', category: 'PHARMACEUTICALS' },
  { symbol: 'MUGHAL', name: 'Mughal Iron & Steel', sector: 'Engineering & Steel', category: 'STEEL_ENGINEERING' },
  { symbol: 'INIL', name: 'International Industries', sector: 'Engineering & Steel', category: 'STEEL_ENGINEERING' },
  { symbol: 'ISL', name: 'International Steels Ltd', sector: 'Engineering & Steel', category: 'STEEL_ENGINEERING' },
  { symbol: 'PAEL', name: 'Pak Elektron Limited', sector: 'Cable & Electrical Goods', category: 'STEEL_ENGINEERING' },
  { symbol: 'ASTL', name: 'Amreli Steels Limited', sector: 'Engineering & Steel', category: 'STEEL_ENGINEERING' },
  { symbol: 'ILP', name: 'Interloop Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'NML', name: 'Nishat Mills Limited', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'KTML', name: 'Kohinoor Textile Mills', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'GATM', name: 'Gul Ahmed Textile Mills', sector: 'Textile Composite', category: 'TEXTILE' },
  { symbol: 'NATF', name: 'National Foods Limited', sector: 'Food & Personal Care', category: 'SUGAR_FOOD' },
  { symbol: 'NESTLE', name: 'Nestle Pakistan Limited', sector: 'Food & Personal Care', category: 'SUGAR_FOOD' },
  { symbol: 'TOMCL', name: 'The Organic Meat Company', sector: 'Food & Personal Care', category: 'SUGAR_FOOD' },
  { symbol: 'UNITY', name: 'Unity Foods Limited', sector: 'Food & Personal Care', category: 'SUGAR_FOOD' }
];

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
  let statusBadge = '';
  let subText = '';
  let isFridayEod = false;

  if (day === 6) {
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 2);
    statusBadge = '🛑 Weekend Closed (Sat & Sun Off)';
    subText = 'Signals Active for Upcoming Monday Open (' + targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
  } else if (day === 0) {
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 1);
    statusBadge = '🛑 Weekend Closed (Sunday Off)';
    subText = 'Signals Active for Tomorrow\'s Monday Open (' + targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
  } else if (day === 5 && timeNum >= 1600) {
    isFridayEod = true;
    targetDate.setDate(pktDate.getDate() + 3);
    statusBadge = '📅 Friday Session Closed • Weekend Off';
    subText = 'Friday EOD Signals Active for Upcoming Monday Session (' + targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
  } else if (timeNum >= 1600) {
    targetDate.setDate(pktDate.getDate() + 1);
    statusBadge = '📅 Post-Market Analysis';
    subText = 'Actionable for Tomorrow\'s PSX Market Open (' + targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
  } else {
    targetDate = pktDate;
    statusBadge = '🟢 Active Trading Session: Today, ' + pktDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    subText = 'Effective & Actionable for Today\'s PSX Market (09:30 AM PKT)';
  }

  const sessionDateFormatted = targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    isWeekend,
    isFridayEod,
    targetDate,
    sessionDateFormatted,
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
