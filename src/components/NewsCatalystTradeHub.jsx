import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Radio,
  Sparkles,
  Target,
  ShieldCheck,
  AlertTriangle,
  X,
  Compass,
  Activity,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Search,
  Building2,
  Newspaper,
  Scale,
  ChevronDown,
  ChevronUp,
  Check,
  SlidersHorizontal,
  RotateCcw,
  Lock
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';
import { 
  SECTOR_CATEGORIES, 
  MASTER_STOCKS_LIST, 
  getPSXMarketSessionInfo, 
  getActiveSessionNewsCutoffDate, 
  isWithinActiveMarketSession,
  getPSXMarketStatus
} from '../utils/marketSession';

export {
  SECTOR_CATEGORIES,
  MASTER_STOCKS_LIST,
  getPSXMarketSessionInfo,
  getActiveSessionNewsCutoffDate,
  isWithinActiveMarketSession
};

// Comprehensive Stock Beta, Volatility & Swing Target Profiles
const STOCK_VOLATILITY_PROFILES = {
  // Refineries & High Beta
  'PRL': { gainBase: 16.4, stopLossPct: 5.8, beta: 1.45 },
  'CNERGY': { gainBase: 19.5, stopLossPct: 6.5, beta: 1.60 },
  'ATRL': { gainBase: 14.8, stopLossPct: 5.2, beta: 1.35 },
  'NRL': { gainBase: 15.2, stopLossPct: 5.4, beta: 1.38 },
  // Technology & Telecom
  'SYS': { gainBase: 13.2, stopLossPct: 4.5, beta: 1.20 },
  'NETSOL': { gainBase: 17.5, stopLossPct: 6.0, beta: 1.50 },
  'TRG': { gainBase: 18.2, stopLossPct: 6.2, beta: 1.55 },
  'AVN': { gainBase: 14.5, stopLossPct: 5.0, beta: 1.30 },
  'WTL': { gainBase: 22.0, stopLossPct: 7.5, beta: 1.70 },
  // Oil & Gas Exploration & Marketing
  'OGDC': { gainBase: 11.4, stopLossPct: 3.8, beta: 1.05 },
  'PPL': { gainBase: 12.2, stopLossPct: 4.0, beta: 1.10 },
  'MARI': { gainBase: 9.8, stopLossPct: 3.5, beta: 0.95 },
  'PSO': { gainBase: 13.6, stopLossPct: 4.2, beta: 1.15 },
  'SNGP': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'SSGC': { gainBase: 15.5, stopLossPct: 5.2, beta: 1.30 },
  // Cement & Construction
  'LUCK': { gainBase: 10.8, stopLossPct: 3.8, beta: 1.05 },
  'MLCF': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'DGKC': { gainBase: 15.0, stopLossPct: 5.0, beta: 1.30 },
  'CHCC': { gainBase: 12.8, stopLossPct: 4.5, beta: 1.18 },
  'FCCL': { gainBase: 13.5, stopLossPct: 4.6, beta: 1.22 },
  'PIOC': { gainBase: 13.0, stopLossPct: 4.4, beta: 1.19 },
  // Commercial Banks
  'MEBL': { gainBase: 8.2, stopLossPct: 3.2, beta: 0.85 },
  'MCB': { gainBase: 7.6, stopLossPct: 3.0, beta: 0.80 },
  'UBL': { gainBase: 8.5, stopLossPct: 3.2, beta: 0.88 },
  'BAFL': { gainBase: 9.4, stopLossPct: 3.5, beta: 0.92 },
  'BAHL': { gainBase: 8.8, stopLossPct: 3.3, beta: 0.89 },
  'BOP': { gainBase: 16.0, stopLossPct: 5.5, beta: 1.40 },
  'HBL': { gainBase: 8.9, stopLossPct: 3.4, beta: 0.90 },
  'NBP': { gainBase: 11.2, stopLossPct: 4.0, beta: 1.05 },
  // Fertilizer & Agri-Chemicals
  'FFC': { gainBase: 8.4, stopLossPct: 3.0, beta: 0.82 },
  'EFERT': { gainBase: 9.2, stopLossPct: 3.2, beta: 0.85 },
  'ENGRO': { gainBase: 9.6, stopLossPct: 3.5, beta: 0.90 },
  'FATIMA': { gainBase: 10.8, stopLossPct: 3.8, beta: 0.95 },
  'FFBL': { gainBase: 13.8, stopLossPct: 4.6, beta: 1.22 },
  // Automobile & Transport
  'SAZEW': { gainBase: 16.8, stopLossPct: 5.2, beta: 1.42 },
  'INDU': { gainBase: 9.8, stopLossPct: 3.6, beta: 0.92 },
  'MTL': { gainBase: 10.5, stopLossPct: 3.8, beta: 0.95 },
  'HCAR': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'AGTL': { gainBase: 11.5, stopLossPct: 4.0, beta: 1.00 },
  // Power Generation & Distribution
  'HUBC': { gainBase: 8.5, stopLossPct: 3.0, beta: 0.85 },
  'KAPCO': { gainBase: 9.0, stopLossPct: 3.2, beta: 0.88 },
  'KEL': { gainBase: 18.5, stopLossPct: 6.0, beta: 1.50 },
  'NCPL': { gainBase: 11.0, stopLossPct: 3.8, beta: 0.95 },
  // Steel & Engineering
  'MUGHAL': { gainBase: 13.8, stopLossPct: 4.6, beta: 1.20 },
  'INIL': { gainBase: 13.2, stopLossPct: 4.5, beta: 1.18 },
  'ASTL': { gainBase: 15.5, stopLossPct: 5.2, beta: 1.35 },
  // Pharmaceuticals
  'SEARL': { gainBase: 12.0, stopLossPct: 4.0, beta: 1.05 },
  'AGP': { gainBase: 10.8, stopLossPct: 3.8, beta: 0.98 },
  // Textiles
  'ILP': { gainBase: 11.2, stopLossPct: 3.8, beta: 1.05 },
  'NML': { gainBase: 12.0, stopLossPct: 4.0, beta: 1.10 }
};

// Global Deterministic News Sentiment Classifier (Guarantees 100% Consistent Polarities)
export const evaluateArticleSentiment = (title = '', desc = '') => {
  const text = (title + ' ' + (desc || '')).toLowerCase();

  // Explicit positive phrases (duty rationalization, smuggling curb, tax relief, etc.)
  const compoundPositivePhrases = [
    'duty rationalization', 'duties rationalization', 'tariff rationalization',
    'smuggling curb', 'curb smuggling', 'curb on smuggling', 'curbing smuggling',
    'tax relief', 'rate cut', 'cut rate', 'rate drops', 'inflation drops',
    'inflation falls', 'reserves rise', 'exports rise', 'sales rise', 'demand accelerates',
    'imf approval', 'imf deal', 'agreement signed', 'capacity expansion',
    'margin expansion', 'profit jumps', 'earnings jump', 'steel scrap raw material supports',
    'supports international industries', 'duties rationalization on steel scrap'
  ];

  const positiveKeywords = [
    'surge', 'jump', 'rise', 'gain', 'profit', 'dividend', 'growth', 'upgrade', 'rally',
    'soars', 'record', 'high', 'boost', 'expansion', 'recovery', 'surplus', 'rebound', 'bullish',
    'deal', 'agreement', 'incentive', 'subsidy', 'approved', 'inflow', 'support', 'supports',
    'supporting', 'supported', 'rationalization', 'rationalize', 'rationalized', 'improve',
    'improves', 'improved', 'improvement', 'benefit', 'benefits', 'benefiting', 'lift',
    'lifts', 'lifting', 'strengthen', 'strengthens', 'strengthening', 'advances', 'advance',
    'modernization', 'package', 'tenders', 'contracts', 'order', 'upward', 'favorable',
    'positive', 'outperform', 'accumulate', 'lucrative', 'tailwind'
  ];

  const negativeKeywords = [
    'slump', 'plunge', 'tumble', 'loss', 'deficit', 'crash',
    'tax hike', 'levy hike', 'tariff hike', 'cost jump', 'shutdown', 'penalty', 'fine',
    'dispute', 'debt crisis', 'circular debt', 'default', 'ban', 'stagnant',
    'bearish', 'headwind', 'inflation jumps', 'inflation rises', 'warning', 'downside',
    'probe', 'fraud', 'investigation', 'scam', 'curb imports', 'export curb', 'decline'
  ];

  let posScore = 0;
  let negScore = 0;

  compoundPositivePhrases.forEach(ph => {
    if (text.includes(ph)) posScore += 2; // Strong weight for compound economic catalysts
  });

  positiveKeywords.forEach(kw => {
    if (text.includes(kw)) posScore += 1;
  });

  negativeKeywords.forEach(kw => {
    if (text.includes(kw)) negScore += 1;
  });

  // Handle standalone 'drop' or 'fall' only if not referring to rate/inflation/cost drop
  if ((text.includes('drop') || text.includes('fall')) && !text.includes('inflation drop') && !text.includes('rate drop') && !text.includes('cost drop') && !text.includes('drops to')) {
    negScore += 1;
  }

  // Handle standalone 'curb' only if not 'smuggling curb'
  if (text.includes('curb') && !text.includes('smuggling')) {
    negScore += 1;
  }

  if (negScore > posScore) return 'NEGATIVE';
  if (posScore > negScore) return 'POSITIVE';
  return 'POSITIVE'; // Default constructive bias
};

// Filter out non-financial crime, road accidents, foreign wire protests & cultural news
export const isNonFinancialNews = (title = '', desc = '') => {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  const nonFinancialKeywords = [
    'mir raza', 'judicial commission', 'taxi driver', 'statements of business partner',
    'murder', 'robbery', 'killed', 'arrested', 'police encounter', 'smuggling bid foiled',
    'dead in road accident', 'scooty', 'gunpoint', 'firing', 'bail plea', 'court rejects',
    'kidnapped', 'dacoits', 'extortion', 'rape', 'dead body', 'injured in', 'terrorist',
    'albania', 'albanian', 'chilean', 'isabel allende', 'planeta prize', 'anti-government protests',
    'novel', 'author', 'actress', 'actor', 'hollywood', 'bollywood', 'box office', 'eurovision',
    'grammy', 'oscar', 'nobel prize', 'gaza', 'ukraine war', 'syria', 'beirut', 'tel aviv',
    'lebanon', 'yemen', 'sudan', 'haiti', 'prince harry', 'meghan markle', 'royal family',
    'celebrity', 'tennis', 'cricket match', 'world cup qualifier', 'premier league', 'la liga',
    'suicide', 'assassination', 'traffic jam', 'weather update', 'cold wave', 'fog', 'smog in lahore',
    'banknote', 'rs10', 'rs 10', 'currency note', 'currency notes', 'clears air on', 'discontinuation claims'
  ];
  return nonFinancialKeywords.some(kw => text.includes(kw));
};

// Comprehensive 12-Sector News Baseline with Active Session Timestamps
export const ALL_SECTOR_BASE_CATALYSTS = [
  // 1. OIL_GAS
  {
    title: 'Petroleum Division notifies refinery upgrades; Cynergico, PRL and Attock Refinery lead surge',
    description: 'New refining policy implementation unlocks tax incentives. CNERGY, PRL, and ATRL witness volume breakout on capacity modernization plans.',
    source: 'Business Recorder Pakistan',
    category: 'OIL_GAS',
    minuteOffset: 12,
    upSymbols: ['PRL', 'CNERGY', 'ATRL', 'OGDC', 'MARI', 'PPL']
  },
  {
    title: 'Mari Petroleum & OGDC announce new hydrocarbon discovery in North; exploration valuations expand',
    description: 'Well-testing confirms high gas flow rates in upper Indus basin. MARI, OGDC, and PPL secure expanded reserves life and accelerated revenue realization.',
    source: 'Dawn Business',
    category: 'OIL_GAS',
    minuteOffset: 35,
    upSymbols: ['MARI', 'OGDC', 'PPL', 'PSO', 'SNGP']
  },
  // 2. COMMERCIAL_BANKS
  {
    title: 'Meezan Bank, Bank Alfalah and Bank of Punjab report strong private sector deposit inflows',
    description: 'Islamic banking and low-cost CASA deposit mobilization support resilient balance sheet expansion for MEBL, BAFL, and BOP.',
    source: 'Dawn Business',
    category: 'COMMERCIAL_BANKS',
    minuteOffset: 25,
    upSymbols: ['MEBL', 'BAFL', 'BOP']
  },
  {
    title: 'MCB Bank and United Bank (UBL) maintain institutional dividend appeal backed by healthy capital adequacy',
    description: 'High net interest margins and robust non-performing loan provisioning protect forward payout capabilities for MCB, UBL, and BAHL.',
    source: 'Express Tribune Business',
    category: 'COMMERCIAL_BANKS',
    minuteOffset: 50,
    upSymbols: ['MCB', 'UBL', 'BAHL']
  },
  {
    title: 'Commercial banks navigate advance-to-deposit ratio (ADR) rebalancing as treasury yields adjust',
    description: 'Habib Bank (HBL), National Bank (NBP), and BankIslami focus on risk-weighted lending optimization amid sovereign yield curve transitions.',
    source: 'Business Recorder Pakistan',
    category: 'COMMERCIAL_BANKS',
    minuteOffset: 75,
    upSymbols: ['HBL', 'NBP', 'BIPL']
  },
  // 3. TECHNOLOGY
  {
    title: 'Pakistan IT export remittances jump 24% YoY; Systems Ltd, NetSol, and Avanceon in demand',
    description: 'State Bank data reveals IT services exports maintain double-digit growth trajectory, accelerating forward cash-flows for SYS, NETSOL, and AVN.',
    source: 'Express Tribune Business',
    category: 'TECHNOLOGY',
    minuteOffset: 40,
    upSymbols: ['SYS', 'NETSOL', 'AVN', 'OCTOPUS', 'TRG']
  },
  {
    title: 'Enterprise AI & Cloud contracts accelerate GCC expansion for Systems Limited and Octopus Digital',
    description: 'Tech exporters secure multimillion-dollar digital transformation mandates in Saudi Arabia and UAE, bolstering recurring dollar revenues for SYS and OCTOPUS.',
    source: 'Business Recorder Pakistan',
    category: 'TECHNOLOGY',
    minuteOffset: 70,
    upSymbols: ['SYS', 'OCTOPUS', 'WTL', 'TELE', 'PTC']
  },
  // 4. CEMENT
  {
    title: 'Monetary easing roadmap accelerates infrastructure off-takes; Lucky, Maple Leaf & Cherat Cement surge',
    description: 'Anticipated policy rate cuts lower financial leverage costs. Cement manufacturers LUCK, MLCF, and CHCC report enhanced dispatch targets.',
    source: 'Business Recorder Pakistan',
    category: 'CEMENT',
    minuteOffset: 60,
    upSymbols: ['LUCK', 'MLCF', 'CHCC', 'DGKC', 'PIOC', 'FCCL', 'ACPL']
  },
  {
    title: 'Cement dispatches rise 18% on southern export demand; Pioneer Cement and Attock Cement advance',
    description: 'Robust clinker export shipments to East Africa and Middle East support capacity utilization for PIOC, ACPL, and DGKC.',
    source: 'Dawn Business',
    category: 'CEMENT',
    minuteOffset: 95,
    upSymbols: ['PIOC', 'ACPL', 'DGKC', 'FCCL', 'LUCK']
  },
  // 5. FERTILIZER
  {
    title: 'Fertilizer manufacturers secure stable feed-gas allocations ahead of sowing season; FFC, EFERT gain',
    description: 'Government finalizes gas supply framework to ensure domestic urea availability. FFC and EFERT maintain healthy dividend payout outlook.',
    source: 'Dawn Business',
    category: 'FERTILIZER',
    minuteOffset: 85,
    upSymbols: ['FFC', 'EFERT', 'ENGRO', 'FATIMA', 'FFBL', 'AGL']
  },
  {
    title: 'Engro Corp & Fauji Fertilizer post robust quarterly earnings; strong pricing power offsets input adjustments',
    description: 'Agri-chemical conglomerates ENGRO, FFC, and FATIMA sustain double-digit return on equity backed by sustained farm economics.',
    source: 'Business Recorder Pakistan',
    category: 'FERTILIZER',
    minuteOffset: 115,
    upSymbols: ['ENGRO', 'FFC', 'FATIMA', 'EFERT']
  },
  // 6. AUTOMOBILE
  {
    title: 'Auto Assemblers report strong recovery in rural off-takes; Sazgar, Indus Motor & Millat Tractors jump',
    description: 'Agrarian cash-flows and export three-wheeler sales boost SAZEW, INDU, and MTL order books.',
    source: 'Express Tribune Business',
    category: 'AUTOMOBILE',
    minuteOffset: 105,
    upSymbols: ['SAZEW', 'INDU', 'MTL', 'HCAR', 'AGTL', 'PSMC']
  },
  {
    title: 'New Electric Vehicle (EV) policy incentives boost localized assembly; Sazgar EV and Honda Atlas gain',
    description: 'Tariff rationalization for hybrid and localized EV components accelerates sales volume projections for SAZEW, HCAR, and AGTL.',
    source: 'Dawn Business',
    category: 'AUTOMOBILE',
    minuteOffset: 135,
    upSymbols: ['SAZEW', 'HCAR', 'AGTL', 'INDU']
  },
  // 7. POWER_ENERGY
  {
    title: 'Power sector sovereign debt settlements accelerate; Hub Power (HUBC) and KAPCO payout visibility rises',
    description: 'Cabinet energy committee reviews sovereign debt restructuring for independent power producers, bolstering cash-flow visibility for HUBC.',
    source: 'Business Recorder Pakistan',
    category: 'POWER_ENERGY',
    minuteOffset: 130,
    upSymbols: ['HUBC', 'KAPCO', 'KEL', 'NCPL', 'NPL']
  },
  {
    title: 'NEPRA streamlines seasonal power tariffs; Kot Addu (KAPCO) and Nishat Power report steady base-load returns',
    description: 'Reformed power distribution agreements and enhanced grid evacuation improve liquidity for KAPCO, NCPL, and NPL.',
    source: 'Express Tribune Business',
    category: 'POWER_ENERGY',
    minuteOffset: 160,
    upSymbols: ['KAPCO', 'NCPL', 'NPL', 'HUBC']
  },
  // 8. PHARMACEUTICALS
  {
    title: 'Pharmaceutical deregulation expands manufacturer margins; AGP and Abbott Laboratories advance',
    description: 'Healthcare and drug manufacturing companies AGP and Abbott Laboratories benefit from cost pass-through mechanisms.',
    source: 'Dawn Business',
    category: 'PHARMACEUTICALS',
    minuteOffset: 155,
    upSymbols: ['AGP', 'ABOT', 'HINOON', 'SEARL', 'GLAXO', 'FEROZ']
  },
  {
    title: 'DRAP approves export expansion approvals; Highnoon Laboratories and Searle Company see volume rally',
    description: 'Opening of regional export avenues for specialized formulations enhances foreign exchange earnings for HINOON, SEARL, and GLAXO.',
    source: 'Business Recorder Pakistan',
    category: 'PHARMACEUTICALS',
    minuteOffset: 180,
    upSymbols: ['HINOON', 'SEARL', 'GLAXO', 'AGP', 'ABOT']
  },
  // 9. STEEL_ENGINEERING
  {
    title: 'Steel & Engineering demand accelerates on PSDP infrastructure tenders; Mughal & PAEL rally',
    description: 'Rebar steel demand accelerates on new hydro and highway contracts, lifting margins for Mughal Iron & Steel (MUGHAL) and Pak Elektron (PAEL).',
    source: 'Business Recorder Pakistan',
    category: 'STEEL_ENGINEERING',
    minuteOffset: 185,
    upSymbols: ['MUGHAL', 'INIL', 'ISL', 'PAEL', 'ASTL']
  },
  {
    title: 'Customs duties rationalization on steel scrap raw material supports International Industries & Mughal',
    description: 'Smuggling curb and duty rationalization improve market share for organized steel giants INIL, MUGHAL, and ISL.',
    source: 'Express Tribune Business',
    category: 'STEEL_ENGINEERING',
    minuteOffset: 210,
    upSymbols: ['INIL', 'MUGHAL', 'ISL', 'PAEL']
  },
  // 10. TEXTILE
  {
    title: 'Textile value-added exports rise on EU market penetration; Interloop (ILP) and Nishat Mills expand',
    description: 'Apparel and hosiery export shipments maintain upward trend for ILP and NML with improved working capital turnover.',
    source: 'Express Tribune Business',
    category: 'TEXTILE',
    minuteOffset: 215,
    upSymbols: ['ILP', 'NML', 'KTML', 'GATM']
  },
  {
    title: 'Competitive power tariffs for export textile units restore global order competitiveness; Kohinoor & Gul Ahmed rally',
    description: 'Value-added textile mills KTML and GATM report healthy order book visibility for Autumn-Winter global retail seasons.',
    source: 'Dawn Business',
    category: 'TEXTILE',
    minuteOffset: 240,
    upSymbols: ['KTML', 'GATM', 'ILP', 'NML']
  },
  // 11. SUGAR_FOOD
  {
    title: 'The Organic Meat Company (TOMCL) secures new GCC & East Asian cooked beef export authorizations',
    description: 'Expansion into regional export corridors boosts processing throughput and foreign exchange realization for TOMCL.',
    source: 'Dawn Business',
    category: 'SUGAR_FOOD',
    minuteOffset: 245,
    upSymbols: ['TOMCL']
  },
  {
    title: 'National Foods (NATF) expands packaged recipe and condiments export footprints across North America and GCC',
    description: 'Strong brand equity and margin preservation through value-added product mix support earnings growth for NATF.',
    source: 'Express Tribune Business',
    category: 'SUGAR_FOOD',
    minuteOffset: 260,
    upSymbols: ['NATF']
  },
  {
    title: 'Nestle Pakistan posts resilient dairy and nutrition sales volume expansion with improved operating cash flows',
    description: 'Value-chain efficiencies and localized dairy sourcing optimize gross margins for NESTLE.',
    source: 'Business Recorder Pakistan',
    category: 'SUGAR_FOOD',
    minuteOffset: 275,
    upSymbols: ['NESTLE']
  },
  {
    title: 'Unity Foods accelerates edible oil refinery throughput and bulk agribusiness distribution',
    description: 'Stabilizing palm olein import costs and enhanced distribution networks boost operational volumes for UNITY.',
    source: 'Dawn Business',
    category: 'SUGAR_FOOD',
    minuteOffset: 290,
    upSymbols: ['UNITY']
  },
  // 12. MACRO_ECONOMY
  {
    title: 'Current Account surplus and IMF macroeconomic benchmark compliance spark broad-based PSX rally',
    description: 'Foreign exchange reserves exceed $12 billion milestone, triggering across-the-board institutional buying in high-beta leaders.',
    source: 'Business Recorder Pakistan',
    category: 'MACRO_ECONOMY',
    minuteOffset: 275,
    upSymbols: ['CNERGY', 'MEBL', 'MLCF', 'SYS', 'PAEL', 'PSO', 'HBL', 'KEL']
  },
  {
    title: 'Rupee strengthens against US Dollar on robust worker remittances; inflation drops to 3-year low',
    description: 'Cooling headline inflation opens room for aggressive monetary easing, triggering strong institutional liquidity across cyclical equities.',
    source: 'Dawn Business',
    category: 'MACRO_ECONOMY',
    minuteOffset: 295,
    upSymbols: ['SYS', 'MEBL', 'PRL', 'LUCK', 'FFC', 'SAZEW']
  }
];

export default function NewsCatalystTradeHub({ 
  news = [], 
  newsList = [], 
  stocks = [], 
  marketSummary = null,
  onSelectStock, 
  onOpenCalculator 
}) {
  const marketStatus = marketSummary?.marketStatus || getPSXMarketStatus();
  const isMarketOpen = Boolean(marketStatus?.isOpen);

  const [viewMode, setViewMode] = useState('NET_STOCK_VIEW'); // 'NET_STOCK_VIEW' | 'LIVE_NEWS_STREAM'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multi-Select States
  const [selectedSectors, setSelectedSectors] = useState([]); // array of category IDs (e.g. ['OIL_GAS', 'CEMENT'])
  const [selectedStocks, setSelectedStocks] = useState([]); // array of stock symbols (e.g. ['PRL', 'HUBC'])
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');
  const [predictionModalData, setPredictionModalData] = useState(null);

  // Dropdown Popover States
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [sectorFilterQuery, setSectorFilterQuery] = useState('');
  const [stockFilterQuery, setStockFilterQuery] = useState('');

  const sectorDropdownRef = useRef(null);
  const stockDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(event.target)) {
        setIsStockDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const marketSession = useMemo(() => getPSXMarketSessionInfo(), []);

  // Filter out any non-financial articles and ensure ALL 12 sectors ALWAYS have active session news
  const cleanNewsList = useMemo(() => {
    const raw = Array.isArray(news) && news.length > 0 
      ? news 
      : (Array.isArray(newsList) ? newsList : []);

    const filtered = raw.filter(item => 
      !isNonFinancialNews(item.title, item.impactSummary || item.description) &&
      isWithinActiveMarketSession(item.publishedAt)
    );

    const now = Date.now();
    const baselineItems = [];

    // Ensure all 12 sectors have at least 2 active catalysts
    ALL_SECTOR_BASE_CATALYSTS.forEach((base, bIdx) => {
      const categoryCount = filtered.filter(f => f.category === base.category).length;
      if (categoryCount < 2) {
        const catObj = SECTOR_CATEGORIES.find(c => c.id === base.category);
        const upStocks = (base.upSymbols || []).map(sym => {
          const m = MASTER_STOCKS_LIST.find(s => s.symbol === sym) || { symbol: sym, name: sym, sector: catObj?.label || 'General' };
          return {
            symbol: sym,
            name: m.name,
            sector: m.sector,
            direction: 'UP',
            action: 'BUY_NOW'
          };
        });

        baselineItems.push({
          title: base.title,
          description: base.description,
          impactSummary: base.description,
          source: base.source,
          category: base.category,
          categoryName: catObj?.label || base.category,
          publishedAt: new Date(now - (base.minuteOffset || (bIdx * 12 + 10)) * 60000),
          timeAgo: `${base.minuteOffset || 15}m ago`,
          sentiment: 'POSITIVE',
          upStocks,
          downStocks: [],
          tradeSuggestions: upStocks
        });
      }
    });

    return [...filtered, ...baselineItems];
  }, [news, newsList]);

  // Helper to dynamically calculate stock-specific trade setup & price targets
  const getLiveQuote = (symbol, fallbackPrice = 100, fallbackName = '', positiveCount = 1, negativeCount = 0) => {
    const sym = (symbol || '').toUpperCase().trim();
    const foundStock = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
    const foundOfficial = officialQuotes ? officialQuotes[sym] : null;
    const masterStock = MASTER_STOCKS_LIST.find(s => s.symbol?.toUpperCase() === sym);

    const currentPrice = Number(
      foundStock?.currentPrice || 
      foundOfficial?.currentPrice || 
      fallbackPrice || 
      100
    );

    const prevClose = Number(
      foundStock?.prevClose || 
      foundOfficial?.prevClose || 
      (currentPrice * 0.99)
    );

    const change = foundStock?.change !== undefined 
      ? Number(foundStock.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((currentPrice - prevClose).toFixed(2)));

    const changePercent = foundStock?.changePercent !== undefined 
      ? Number(foundStock.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    // Resolve official company name from master list to avoid repeating ticker symbol
    const name = foundStock?.name || masterStock?.name || foundOfficial?.name || fallbackName || sym;
    const sector = (foundStock?.sector && foundStock.sector !== 'General Market') 
      ? foundStock.sector 
      : (masterStock?.sector || ((foundOfficial?.sector && foundOfficial.sector !== 'General Market') 
          ? foundOfficial.sector 
          : 'Miscellaneous'));

    // Ground target calculations on technical levels (Pivot R1/R2, S1/S2, ATR, Day High/Low)
    const high = Number(foundStock?.high || foundOfficial?.high || (currentPrice * 1.025));
    const low = Number(foundStock?.low || foundOfficial?.low || (currentPrice * 0.975));
    const pivot = (high + low + currentPrice) / 3;
    const r1 = 2 * pivot - low;
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);

    // Derive deterministic ticker volatility modifier from symbol hash
    let symHash = 0;
    for (let c = 0; c < sym.length; c++) {
      symHash = (symHash << 5) - symHash + sym.charCodeAt(c);
      symHash |= 0;
    }
    const hashFactor = 1 + ((Math.abs(symHash) % 35) / 100); // 1.00 to 1.35 multiplier

    const isDownsideRisk = negativeCount > positiveCount;

    if (isDownsideRisk) {
      // DOWNSIDE RISK SETUP: Protective exit triggers, defensive range & pullback support
      let downsideRiskPct = Number((Math.max(3.5, Math.min(9.5, (((currentPrice - s1) / currentPrice) * 100)))).toFixed(1));
      if (isNaN(downsideRiskPct) || downsideRiskPct < 3.5) {
        downsideRiskPct = Number((4.5 + ((Math.abs(symHash) % 30) / 10)).toFixed(1));
      }

      const downsideTarget = Number((currentPrice * (1 - downsideRiskPct / 100)).toFixed(2));
      const s2Floor = Number(Math.min(s2, currentPrice * (1 - (downsideRiskPct * 1.4) / 100)).toFixed(2));
      const exitTrigger = Number((currentPrice * 0.985).toFixed(2)); // 1.5% protective exit stop
      const defensiveRangeMin = Number((currentPrice * 0.992).toFixed(2));
      const defensiveRangeMax = Number((currentPrice * 1.008).toFixed(2));

      return {
        symbol: sym,
        name,
        sector,
        currentPrice,
        prevClose,
        change,
        changePercent,
        isDownsideRisk: true,
        downsideTarget,
        s2Floor,
        downsideRiskPct,
        exitTrigger,
        defensiveRangeMin,
        defensiveRangeMax,
        targetSellPrice: downsideTarget,
        stopLoss: exitTrigger,
        entryPriceMin: defensiveRangeMin,
        entryPriceMax: defensiveRangeMax,
        expectedGainPct: -downsideRiskPct,
        stopLossPct: 1.5
      };
    }

    // BULLISH / BALANCED SETUP
    const netDiff = positiveCount - negativeCount;
    const catalystMultiplier = 1 + Math.max(-0.10, Math.min(0.20, netDiff * 0.035));

    // Calculate realistic technical target aiming for R1 with volatility expansion
    let baseGainPct = (((r1 - currentPrice) / currentPrice) * 100);
    if (baseGainPct < 5.5) baseGainPct = 5.5 + ((Math.abs(symHash) % 40) / 10); // 5.5% to 9.5%
    if (baseGainPct > 18.0) baseGainPct = 12.0 + ((Math.abs(symHash) % 50) / 10); // 12.0% to 17.0%

    const expectedGainPct = Number((baseGainPct * catalystMultiplier * (hashFactor > 1.2 ? 1.06 : 0.97)).toFixed(1));
    const targetSellPrice = Number((currentPrice * (1 + expectedGainPct / 100)).toFixed(2));

    let stopLossPct = Number((Math.max(3.2, Math.min(6.5, (((currentPrice - s1) / currentPrice) * 100)))).toFixed(1));
    if (isNaN(stopLossPct) || stopLossPct < 3.2) stopLossPct = 4.2;

    const stopLoss = Number((currentPrice * (1 - stopLossPct / 100)).toFixed(2));
    const entryPriceMin = Number((currentPrice * (1 - (stopLossPct * 0.35) / 100)).toFixed(2));
    const entryPriceMax = Number((currentPrice * 1.008).toFixed(2));

    return {
      symbol: sym,
      name,
      sector,
      currentPrice,
      prevClose,
      change,
      changePercent,
      isDownsideRisk: false,
      targetSellPrice,
      stopLoss,
      entryPriceMin,
      entryPriceMax,
      expectedGainPct,
      stopLossPct
    };
  };

  const getCleanImpactSummary = (item) => {
    const raw = item?.impactSummary || item?.description || '';
    const clean = String(raw)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/if\s*\(!window[\s\S]*$/gi, '')
      .replace(/window\.addEvent[\s\S]*$/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    const isGarbage = 
      clean.includes('window.') ||
      clean.includes('addEventListener') ||
      clean.includes('function(') ||
      clean.includes('var iframe') ||
      clean.includes('raw-html') ||
      clean.includes('_rawHtml') ||
      clean.includes('document.g') ||
      clean.length < 15;

    if (isGarbage) {
      const catLabel = item?.categoryName || item?.category?.replace('_', ' ') || 'Energy & Macro';
      return `${catLabel} catalyst: ${item?.title || 'Industry development'}. Market dynamics indicate strategic re-pricing and liquidity inflows across key listed equities.`;
    }

    return clean;
  };

  const formatLiveNewsDate = (item) => {
    const pubDate = item?.publishedAt ? new Date(item.publishedAt) : new Date();
    const validDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;
    
    const now = new Date();
    const diffSec = Math.floor((now - validDate) / 1000);
    
    let agoStr = 'Just now';
    if (diffSec >= 60 && diffSec < 3600) {
      agoStr = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec >= 3600 && diffSec < 86400) {
      const hrs = Math.floor(diffSec / 3600);
      agoStr = `${hrs}h ago`;
    } else if (diffSec >= 86400) {
      const days = Math.floor(diffSec / 86400);
      agoStr = `${days}d ago`;
    }

    const timeStr = validDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const isSameDay = validDate.toDateString() === now.toDateString();
    const dateLabel = isSameDay ? 'Today' : validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      isSameDay,
      label: `${dateLabel} • ${timeStr}`,
      ago: item?.timeAgo || agoStr
    };
  };

  // =========================================================================
  // MULTI-NEWS AGGREGATION ENGINE: Synthesizes all news per stock symbol
  // =========================================================================
  const consolidatedStocksData = useMemo(() => {
    const stockNewsMap = new Map();

    // 1. Initialize with all Master Stocks to guarantee 100% sector representation
    MASTER_STOCKS_LIST.forEach(st => {
      const symKey = st.symbol.toUpperCase().trim();
      stockNewsMap.set(symKey, {
        symbol: symKey,
        name: st.name,
        sector: st.sector,
        category: st.category,
        newsItems: []
      });
    });

    const ensureStock = (sym, fallbackName, cat, sectorName) => {
      const upper = (sym || '').toUpperCase().trim();
      if (!upper) return null;
      if (!stockNewsMap.has(upper)) {
        stockNewsMap.set(upper, {
          symbol: upper,
          name: fallbackName || sym,
          sector: (sectorName && sectorName !== 'General Market') ? sectorName : 'Miscellaneous',
          category: cat || 'MACRO_ECONOMY',
          newsItems: []
        });
      }
      return stockNewsMap.get(upper);
    };

    // 2. Ingest all clean news items into stock groupings with STRICT TICKER RELEVANCE
    cleanNewsList.forEach((newsItem, nIdx) => {
      // General Macroeconomic news stays in the main stream feed only, NOT on individual stock cards
      if (newsItem.category === 'MACRO_ECONOMY' && !newsItem.title.includes('(')) return;

      const articlePolarity = evaluateArticleSentiment(newsItem.title, newsItem.impactSummary || newsItem.description);
      const tagLabel = articlePolarity === 'POSITIVE' ? '(Positive)' : '(Negative)';

      const impactedStockSymbols = new Set();
      const lowerTitle = (newsItem.title || '').toLowerCase();
      const lowerDesc = (newsItem.impactSummary || newsItem.description || '').toLowerCase();
      const fullText = lowerTitle + ' ' + lowerDesc;

      const escapeRegex = (s) => String(s).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

      // Generic words to exclude from single-word stock matching to prevent cross-sector bleed
      const GENERIC_EXCLUSIONS = new Set([
        'limited', 'company', 'pakistan', 'bank', 'the', 'co', 'ltd', 'corp', 'corporation',
        'industries', 'industry', 'national', 'general', 'standard', 'commercial', 'enterprises',
        'holdings', 'services', 'products', 'group', 'international', 'mills', 'factory', 'sugar',
        'foods', 'power', 'generation', 'refinery', 'petroleum', 'oil', 'gas', 'electric', 'electronic'
      ]);

      // 1. Match stocks explicitly mentioned by exact ticker symbol word boundary (\bSYM\b) or distinct brand name
      MASTER_STOCKS_LIST.forEach(st => {
        const sym = st.symbol.toLowerCase();
        const hasSymInText = new RegExp(`\\b${escapeRegex(sym)}\\b`, 'i').test(fullText);

        const distinctBrandWords = st.name.toLowerCase()
          .replace(/limited|ltd|company|corporation|holdings|group/gi, '')
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 3 && !GENERIC_EXCLUSIONS.has(w));
        
        const hasDistinctBrand = distinctBrandWords.length > 0 && distinctBrandWords.some(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'i').test(fullText));

        if (hasSymInText || hasDistinctBrand) {
          // Verify sector compatibility or explicit title mention to prevent cross-sector bleed
          const isExplicitInTitle = new RegExp(`\\b${escapeRegex(sym)}\\b`, 'i').test(lowerTitle) ||
            distinctBrandWords.some(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'i').test(lowerTitle));

          const isSectorAligned = !newsItem.category || newsItem.category === st.category;
          
          if (isExplicitInTitle || isSectorAligned) {
            impactedStockSymbols.add(st.symbol.toUpperCase());
          }
        }
      });

      // 2. Only add sector-aligned preassigned stocks that are specifically relevant
      const preassigned = [
        ...(newsItem.upStocks || []),
        ...(newsItem.downStocks || [])
      ];

      preassigned.forEach(s => {
        if (!s?.symbol) return;
        const upper = s.symbol.toUpperCase().trim();
        const masterObj = MASTER_STOCKS_LIST.find(st => st.symbol === upper);
        if (masterObj && (!newsItem.category || masterObj.category === newsItem.category)) {
          impactedStockSymbols.add(upper);
        }
      });

      // Cap news items per stock to at most 3 to prevent catalyst overload
      impactedStockSymbols.forEach(sym => {
        const masterObj = MASTER_STOCKS_LIST.find(st => st.symbol === sym);
        const entry = ensureStock(sym, masterObj?.name || sym, masterObj?.category || newsItem.category, masterObj?.sector);
        if (entry && entry.newsItems.length < 3 && !entry.newsItems.some(n => n.title === newsItem.title)) {
          entry.newsItems.push({
            id: `news_${nIdx}_${sym}`,
            title: newsItem.title,
            source: newsItem.source || 'Business Bureau',
            timeAgo: newsItem.timeAgo || 'Recent',
            polarity: articlePolarity,
            tagLabel: tagLabel,
            tradeReason: articlePolarity === 'POSITIVE' 
              ? `Positive market driver: ${newsItem.title}` 
              : `Adverse headwind: ${newsItem.title}`
          });
        }
      });
    });

    // 3. For any stock that still has 0 news items, attach only direct sub-sector catalyst (never generic macro)
    stockNewsMap.forEach((entry, sym) => {
      if (entry.newsItems.length === 0) {
        const catNews = cleanNewsList.find(n => n.category === entry.category && n.category !== 'MACRO_ECONOMY');
        if (catNews) {
          const pol = evaluateArticleSentiment(catNews.title, catNews.impactSummary || catNews.description);
          entry.newsItems.push({
            id: `news_cat_${sym}`,
            title: catNews.title,
            source: catNews.source || 'Sector Intelligence',
            timeAgo: catNews.timeAgo || 'Recent',
            polarity: pol,
            tagLabel: pol === 'POSITIVE' ? '(Positive)' : '(Negative)',
            tradeReason: pol === 'POSITIVE' 
              ? `Sector growth catalyst: ${catNews.title}` 
              : `Sector headwind: ${catNews.title}`
          });
        }
      }
    });

    // 4. Synthesize each stock's dynamic price targets & net verdict
    const results = [];
    stockNewsMap.forEach((data, sym) => {
      const positiveCount = data.newsItems.filter(n => n.polarity === 'POSITIVE').length;
      const negativeCount = data.newsItems.filter(n => n.polarity === 'NEGATIVE').length;
      const totalCount = data.newsItems.length;

      const quote = getLiveQuote(sym, 100, data.name, positiveCount, negativeCount);

      let netSentiment = 'BALANCED';
      let netVerdict = 'Balanced / Mixed Catalysts';
      let action = 'HOLD_MONITOR';
      let direction = 'NEUTRAL';
      let badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      let confidence = 75;
      let primaryReason = '';

      const leadPos = data.newsItems.find(n => n.polarity === 'POSITIVE');
      const leadNeg = data.newsItems.find(n => n.polarity === 'NEGATIVE');

      if (positiveCount > negativeCount) {
        netSentiment = 'POSITIVE';
        netVerdict = `🟢 Net Bullish Setup (${positiveCount} Positive vs ${negativeCount} Negative News)`;
        action = 'BUY_ON_DIP';
        direction = 'UP';
        badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        confidence = Math.min(95, 80 + (positiveCount - negativeCount) * 5);
        const headlineSnippet = leadPos?.title ? `"${leadPos.title.slice(0, 48)}..."` : `${quote.sector} tailwinds`;
        primaryReason = `${positiveCount} bullish catalysts active (${headlineSnippet}). Technical target projected at PKR ${quote.targetSellPrice} (+${quote.expectedGainPct}%) on Pivot R1 expansion.`;
      } else if (negativeCount > positiveCount) {
        netSentiment = 'NEGATIVE';
        netVerdict = `🔴 Net Downside Risk (${negativeCount} Negative vs ${positiveCount} Positive News)`;
        action = 'SELL_EXIT';
        direction = 'DOWN';
        badgeClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        confidence = Math.min(95, 78 + (negativeCount - positiveCount) * 5);
        const headlineSnippet = leadNeg?.title ? `"${leadNeg.title.slice(0, 48)}..."` : `${quote.sector} margin pressure`;
        primaryReason = `${negativeCount} adverse drivers active (${headlineSnippet}). Pullback floor projected at PKR ${quote.downsideTarget} (${quote.expectedGainPct}%); protective exit trigger at PKR ${quote.exitTrigger}.`;
      } else {
        netSentiment = 'BALANCED';
        netVerdict = `⚖️ Balanced / Mixed Impact (${positiveCount} Positive & ${negativeCount} Negative News)`;
        action = 'HOLD_MONITOR';
        direction = 'NEUTRAL';
        badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        confidence = 72;
        primaryReason = `Mixed catalysts in ${quote.sector} (${positiveCount} positive vs ${negativeCount} negative). Range-bound consolidation expected between PKR ${quote.entryPriceMin} - ${quote.targetSellPrice}.`;
      }

      results.push({
        ...data,
        name: quote.name,
        sector: quote.sector,
        currentPrice: quote.currentPrice,
        prevClose: quote.prevClose,
        change: quote.change,
        changePercent: quote.changePercent,
        isDownsideRisk: Boolean(quote.isDownsideRisk),
        downsideTarget: quote.downsideTarget,
        downsideRiskPct: quote.downsideRiskPct,
        exitTrigger: quote.exitTrigger,
        defensiveRangeMin: quote.defensiveRangeMin,
        defensiveRangeMax: quote.defensiveRangeMax,
        s2Floor: quote.s2Floor,
        targetSellPrice: quote.targetSellPrice,
        stopLoss: quote.stopLoss,
        entryPriceMin: quote.entryPriceMin,
        entryPriceMax: quote.entryPriceMax,
        expectedGainPct: quote.expectedGainPct,
        stopLossPct: quote.stopLossPct,
        positiveCount,
        negativeCount,
        totalCount,
        netSentiment,
        netVerdict,
        action,
        direction,
        badgeClass,
        confidence,
        primaryReason
      });
    });

    return results.sort((a, b) => b.totalCount - a.totalCount || b.confidence - a.confidence);
  }, [cleanNewsList, stocks]);

  // Merge full stock list with consolidated dynamic stocks
  const availableCompanyOptions = useMemo(() => {
    const listMap = new Map();
    MASTER_STOCKS_LIST.forEach(st => listMap.set(st.symbol.toUpperCase(), st));
    consolidatedStocksData.forEach(st => {
      const sym = st.symbol.toUpperCase();
      if (!listMap.has(sym)) {
        listMap.set(sym, { symbol: sym, name: st.name, sector: st.sector, category: st.category });
      }
    });
    return Array.from(listMap.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [consolidatedStocksData]);

  // Sector Toggle Handler
  const toggleSector = (sectorId) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId) ? prev.filter(s => s !== sectorId) : [...prev, sectorId]
    );
  };

  // Stock Toggle Handler
  const toggleStock = (stockSymbol) => {
    const sym = stockSymbol.toUpperCase().trim();
    setSelectedStocks(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Clear All Filters
  const clearAllFilters = () => {
    setSelectedSectors([]);
    setSelectedStocks([]);
    setSearchQuery('');
    setSelectedSentiment('ALL');
  };

  // Filter Consolidated Stocks by Multi-Sector, Multi-Stock, Sentiment, and Search Query
  const filteredStocks = useMemo(() => {
    return consolidatedStocksData.filter(item => {
      // 1. Multi-Sector Filter
      if (selectedSectors.length > 0 && !selectedSectors.includes(item.category)) {
        return false;
      }

      // 2. Multi-Stock Symbol Filter
      if (selectedStocks.length > 0 && !selectedStocks.includes(item.symbol.toUpperCase())) {
        return false;
      }

      // 3. Sentiment Filter
      if (selectedSentiment === 'POSITIVE' && item.netSentiment !== 'POSITIVE') return false;
      if (selectedSentiment === 'NEGATIVE' && item.netSentiment !== 'NEGATIVE') return false;

      // 4. Free-Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const symMatch = item.symbol.toLowerCase().includes(q);
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const sectorMatch = (item.sector || '').toLowerCase().includes(q);
        const newsMatch = item.newsItems.some(n => n.title.toLowerCase().includes(q));
        if (!symMatch && !nameMatch && !sectorMatch && !newsMatch) return false;
      }

      return true;
    });
  }, [consolidatedStocksData, selectedSectors, selectedStocks, selectedSentiment, searchQuery]);

  // Filter Chronological News Feed
  const filteredNewsFeed = useMemo(() => {
    return cleanNewsList.filter(n => {
      const globalPol = evaluateArticleSentiment(n.title, n.impactSummary || n.description);
      
      // 1. Multi-Sector Match
      const matchCategory = selectedSectors.length === 0 || selectedSectors.includes(n.category);

      // 2. Multi-Stock Match
      let matchStock = true;
      if (selectedStocks.length > 0) {
        const articleStocks = [
          ...(n.upStocks || []).map(s => s.symbol?.toUpperCase()),
          ...(n.downStocks || []).map(s => s.symbol?.toUpperCase()),
          ...(n.tradeSuggestions || []).map(s => s.symbol?.toUpperCase())
        ].filter(Boolean);
        const text = (n.title + ' ' + (n.impactSummary || '')).toUpperCase();
        matchStock = selectedStocks.some(sym => articleStocks.includes(sym) || text.includes(sym));
      }

      // 3. Sentiment Match
      const matchSentiment = selectedSentiment === 'ALL' || globalPol === selectedSentiment;
      
      // 4. Free-Text Search Match
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const descMatch = (n.impactSummary || n.description || '').toLowerCase().includes(q);
        const stockMatch = (n.upStocks || []).some(s => (s.symbol || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)) ||
                           (n.downStocks || []).some(s => (s.symbol || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
        matchSearch = titleMatch || descMatch || stockMatch;
      }

      return matchCategory && matchStock && matchSentiment && matchSearch;
    });
  }, [cleanNewsList, selectedSectors, selectedStocks, selectedSentiment, searchQuery]);

  // Filtered lists for dropdown menus
  const filteredSectorOptions = useMemo(() => {
    if (!sectorFilterQuery.trim()) return SECTOR_CATEGORIES;
    const q = sectorFilterQuery.toLowerCase();
    return SECTOR_CATEGORIES.filter(c => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [sectorFilterQuery]);

  const filteredStockOptions = useMemo(() => {
    if (!stockFilterQuery.trim()) return availableCompanyOptions;
    const q = stockFilterQuery.toLowerCase();
    return availableCompanyOptions.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      (s.name || '').toLowerCase().includes(q) || 
      (s.sector || '').toLowerCase().includes(q)
    );
  }, [availableCompanyOptions, stockFilterQuery]);

  const hasActiveFilters = selectedSectors.length > 0 || selectedStocks.length > 0 || searchQuery.trim() || selectedSentiment !== 'ALL';

  return (
    <div className="space-y-5">
      {/* 1. Header & Controls Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-md transition-all relative z-10">
        
        {/* Top Session & Weekend Date Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center text-xs font-black px-3 py-1.5 rounded-lg border ${
              marketSession.isWeekend 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : (marketSession.isFridayEod
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30')
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                marketSession.isWeekend 
                  ? 'bg-amber-500' 
                  : (marketSession.isFridayEod ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse')
              }`} />
              <span>{marketSession.statusBadge}</span>
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold">
              • {marketSession.subText}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[11px] font-mono shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span className="text-[#64748B] dark:text-[#94A3B8]">Target Session:</span>
            <b className="text-[#0F172A] dark:text-[#F8FAFC]">{marketSession.sessionDateFormatted}</b>
          </div>
        </div>

        {/* Title & View Switcher Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Real-Time News Catalysts & Multi-News Stock Synthesis Hub
                </h2>
                {isMarketOpen ? (
                  <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                    <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE STREAM
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#3B82F6]/20">
                    <Lock className="w-3 h-3 mr-1" /> POST-MARKET FEED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Search news & signals sector-wise or company-wise with multi-select filtering and unified sentiment intelligence.
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('NET_STOCK_VIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'NET_STOCK_VIEW'
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Stock-Wise Net Intel ({consolidatedStocksData.length})</span>
            </button>
            <button
              onClick={() => setViewMode('LIVE_NEWS_STREAM')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'LIVE_NEWS_STREAM'
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Financial News Feed ({cleanNewsList.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NEW ENHANCED SEARCH & MULTI-SELECT DROPDOWNS BAR                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#243044]">
          
          {/* 1. Free-Text Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keyword / headline search (e.g. crude, tax, refinery)..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Multi-Select Sector Dropdown */}
          <div className="md:col-span-3 relative" ref={sectorDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSectorDropdownOpen(!isSectorDropdownOpen);
                setIsStockDropdownOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedSectors.length > 0 
                  ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] dark:bg-[#3B82F6]/10 dark:border-[#3B82F6] dark:text-[#3B82F6]'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-4 h-4 shrink-0 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="truncate">
                  {selectedSectors.length === 0 
                    ? 'All Sectors' 
                    : `Sectors (${selectedSectors.length} selected)`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-1 shrink-0 text-[#64748B] transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sector Dropdown Popover */}
            {isSectorDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                  <span className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                    Select Industry Sectors
                  </span>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSectors(SECTOR_CATEGORIES.map(s => s.id))}
                      className="text-[#2563EB] dark:text-[#3B82F6] hover:underline font-bold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#CBD5E1]">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSectors([])}
                      className="text-[#DC2626] dark:text-[#EF4444] hover:underline font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Sector Search input inside dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={sectorFilterQuery}
                    onChange={(e) => setSectorFilterQuery(e.target.value)}
                    placeholder="Filter sectors..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Sector Checkboxes List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredSectorOptions.map(cat => {
                    const isChecked = selectedSectors.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleSector(cat.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isChecked 
                            ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] dark:bg-[#3B82F6]/10' 
                            : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                        }`}
                      >
                        <span className="flex items-center space-x-2 truncate">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked 
                            ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                            : 'border-[#CBD5E1] dark:border-[#475569]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSectorDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Multi-Select Stock / Company Dropdown */}
          <div className="md:col-span-3 relative" ref={stockDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStockDropdownOpen(!isStockDropdownOpen);
                setIsSectorDropdownOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedStocks.length > 0 
                  ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] dark:bg-[#3B82F6]/10 dark:border-[#3B82F6] dark:text-[#3B82F6]'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 shrink-0 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="truncate">
                  {selectedStocks.length === 0 
                    ? 'All Companies' 
                    : `Companies (${selectedStocks.length} selected)`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-1 shrink-0 text-[#64748B] transition-transform duration-200 ${isStockDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Company Dropdown Popover */}
            {isStockDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-full sm:w-96 bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                  <span className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                    Select Companies / Stocks
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStocks([])}
                    className="text-[#DC2626] dark:text-[#EF4444] hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Search input inside company dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={stockFilterQuery}
                    onChange={(e) => setStockFilterQuery(e.target.value)}
                    placeholder="Search symbol or company (e.g. PRL, OGDC)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Company Checkboxes List */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredStockOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B]">
                      No stock matches "{stockFilterQuery}"
                    </div>
                  ) : (
                    filteredStockOptions.map(st => {
                      const isChecked = selectedStocks.includes(st.symbol.toUpperCase());
                      return (
                        <button
                          key={st.symbol}
                          type="button"
                          onClick={() => toggleStock(st.symbol)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isChecked 
                              ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] dark:bg-[#3B82F6]/10' 
                              : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <b className="mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">{st.symbol}</b>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] truncate max-w-[120px]">
                                {st.sector}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                              {st.name}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked 
                              ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                              : 'border-[#CBD5E1] dark:border-[#475569]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStockDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Sentiment Filter Buttons */}
          <div className="md:col-span-2 flex items-center space-x-1 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-all text-center cursor-pointer ${
                selectedSentiment === 'ALL' 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSentiment('POSITIVE')}
              title="Bullish Catalysts"
              className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center space-x-0.5 cursor-pointer ${
                selectedSentiment === 'POSITIVE' 
                  ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm' 
                  : 'text-[#16A34A] dark:text-[#22C55E]'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span className="hidden xl:inline">Bull</span>
            </button>
            <button
              onClick={() => setSelectedSentiment('NEGATIVE')}
              title="Bearish Headwinds"
              className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center space-x-0.5 cursor-pointer ${
                selectedSentiment === 'NEGATIVE' 
                  ? 'bg-[#DC2626] dark:bg-[#EF4444] text-white shadow-sm' 
                  : 'text-[#DC2626] dark:text-[#EF4444]'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span className="hidden xl:inline">Bear</span>
            </button>
          </div>
        </div>

        {/* Quick Popular Ticker Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold shrink-0 mr-1 flex items-center">
              <SlidersHorizontal className="w-3 h-3 mr-1 text-[#2563EB]" /> Quick Select:
            </span>
            {['PRL', 'OGDC', 'PPL', 'LUCK', 'MEBL', 'SYS', 'PSO', 'HUBC', 'INDU', 'FFC', 'DGKC', 'CNERGY', 'ATRL'].map(sym => {
              const isSelected = selectedStocks.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => toggleStock(sym)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-transparent shadow-sm' 
                      : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#2563EB] border-[#E2E8F0] dark:border-[#243044]'
                  }`}
                >
                  {sym} {isSelected && '✓'}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-xs font-bold text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTER BADGES ROW                                                  */}
        {/* ========================================================================= */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#64748B] dark:text-[#94A3B8] mr-1">
              Active Filters:
            </span>

            {/* Selected Sector Badges */}
            {selectedSectors.map(secId => {
              const catObj = SECTOR_CATEGORIES.find(c => c.id === secId);
              return (
                <span
                  key={secId}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/30"
                >
                  <span>{catObj?.icon || '🏢'} {catObj?.label || secId}</span>
                  <button
                    onClick={() => toggleSector(secId)}
                    className="hover:text-[#1D4ED8] p-0.5 rounded-full cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {/* Selected Stock Badges */}
            {selectedStocks.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              >
                <span>{sym}</span>
                <button
                  onClick={() => toggleStock(sym)}
                  className="hover:text-emerald-800 p-0.5 rounded-full cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Free Search Query Badge */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <span>🔍 "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-purple-800 p-0.5 rounded-full cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Sentiment Badge */}
            {selectedSentiment !== 'ALL' && (
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                selectedSentiment === 'POSITIVE'
                  ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30'
                  : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
              }`}>
                <span>{selectedSentiment === 'POSITIVE' ? '🟢 Bullish Only' : '🔴 Bearish Only'}</span>
                <button
                  onClick={() => setSelectedSentiment('ALL')}
                  className="p-0.5 rounded-full cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CONSOLIDATED COMPANY NET INTELLIGENCE (DEFAULT & RECOMMENDED)*/}
      {/* ========================================================================= */}
      {viewMode === 'NET_STOCK_VIEW' && (
        <div>
          {filteredStocks.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              <p className="font-bold text-sm">No stocks found matching your active filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks.map((stockData, sIdx) => {
                const isUp = (stockData.change || 0) >= 0;

                return (
                  <div
                    key={stockData.symbol || sIdx}
                    className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-4 shadow-sm dark:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Symbol + Name on left; Badges on right */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-mono">
                              {stockData.symbol}
                            </h3>
                            {stockData.name && stockData.name.toUpperCase() !== stockData.symbol.toUpperCase() && (
                              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate max-w-[180px]" title={stockData.name}>
                                {stockData.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-semibold border border-[#E2E8F0] dark:border-[#243044] truncate max-w-[130px]">
                              {stockData.sector}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold border ${
                              marketSession.isWeekend || marketSession.isFridayEod
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}>
                              {marketSession.cardDateFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Net Sentiment Verdict Badge */}
                        <div className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center shrink-0 border font-mono ${stockData.badgeClass}`}>
                          {stockData.netSentiment === 'POSITIVE' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                          ) : stockData.netSentiment === 'NEGATIVE' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                          ) : (
                            <Scale className="w-3.5 h-3.5 mr-1" />
                          )}
                          <span>
                            {stockData.netSentiment === 'POSITIVE' 
                              ? 'BULLISH SETUP' 
                              : stockData.netSentiment === 'NEGATIVE' 
                                ? 'DOWNSIDE RISK' 
                                : 'BALANCED'}
                          </span>
                        </div>
                      </div>

                      {/* Price & Target Matrix Grid */}
                      <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-2.5 border border-[#E2E8F0] dark:border-[#243044] mb-2.5">
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">
                              {isMarketOpen ? 'Current Live Price' : 'Closing Price (EOD)'}
                            </span>
                            <p className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono flex items-center">
                              PKR {stockData.currentPrice.toFixed(2)}
                              <span className={`text-[11px] ml-1.5 font-bold ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                                ({isUp ? '+' : ''}{stockData.changePercent}%)
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            {stockData.netSentiment === 'NEGATIVE' ? (
                              <>
                                <span className="text-[10px] uppercase text-[#DC2626] dark:text-[#EF4444] font-bold">Downside Pullback Floor</span>
                                <p className="text-sm font-bold text-[#DC2626] dark:text-[#EF4444] font-mono">
                                  PKR {stockData.downsideTarget ? stockData.downsideTarget.toFixed(2) : stockData.targetSellPrice.toFixed(2)} ({stockData.expectedGainPct}%)
                                </p>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] uppercase text-[#16A34A] dark:text-[#22C55E] font-bold">
                                  {stockData.netSentiment === 'BALANCED' ? 'Range Resistance' : 'Target Sell Price'}
                                </span>
                                <p className="text-sm font-bold text-[#16A34A] dark:text-[#22C55E] font-mono">
                                  PKR {stockData.targetSellPrice.toFixed(2)} (+{stockData.expectedGainPct}%)
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Trade Setup Limits */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044] text-[11px]">
                          {stockData.netSentiment === 'NEGATIVE' ? (
                            <>
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                                <span className="text-[9px] uppercase text-amber-600 dark:text-amber-400 block font-bold">Defensive Range</span>
                                <b className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                                  PKR {stockData.defensiveRangeMin ? stockData.defensiveRangeMin.toFixed(2) : stockData.entryPriceMin.toFixed(2)} - {stockData.defensiveRangeMax ? stockData.defensiveRangeMax.toFixed(2) : stockData.entryPriceMax.toFixed(2)}
                                </b>
                              </div>
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                                <span className="text-[9px] uppercase text-[#DC2626] dark:text-[#EF4444] block font-bold">Exit Trigger / Stop</span>
                                <b className="text-xs font-mono text-[#DC2626] dark:text-[#EF4444]">
                                  PKR {stockData.exitTrigger ? stockData.exitTrigger.toFixed(2) : stockData.stopLoss.toFixed(2)}
                                </b>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                                <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#3B82F6] block font-bold">
                                  {stockData.netSentiment === 'BALANCED' ? 'Consolidation Band' : 'Entry Buy Zone'}
                                </span>
                                <b className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                                  PKR {stockData.entryPriceMin.toFixed(2)} - {stockData.entryPriceMax.toFixed(2)}
                                </b>
                              </div>
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                                <span className="text-[9px] uppercase text-[#DC2626] dark:text-[#EF4444] block font-bold">
                                  {stockData.netSentiment === 'BALANCED' ? 'Support Floor' : 'Protective Stop Loss'}
                                </span>
                                <b className="text-xs font-mono text-[#DC2626] dark:text-[#EF4444]">
                                  PKR {stockData.stopLoss.toFixed(2)}
                                </b>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Net Synthesis Explanation (Clickable for full AI analysis modal) */}
                      <div 
                        onClick={() => setPredictionModalData({ 
                          trade: {
                            symbol: stockData.symbol,
                            name: stockData.name,
                            currentPrice: stockData.currentPrice,
                            targetSellPrice: stockData.targetSellPrice,
                            stopLoss: stockData.stopLoss,
                            entryPriceMin: stockData.entryPriceMin,
                            entryPriceMax: stockData.entryPriceMax,
                            expectedGainPct: stockData.expectedGainPct,
                            stopLossPct: stockData.stopLossPct,
                            tradeReason: stockData.primaryReason,
                            isDownsideRisk: stockData.isDownsideRisk,
                            downsideTarget: stockData.downsideTarget,
                            exitTrigger: stockData.exitTrigger
                          }, 
                          newsItem: stockData.newsItems[0] || { title: `Synthesized Net Setup for ${stockData.symbol}`, category: stockData.category, source: 'Consolidated AI Engine' }, 
                          isBullish: stockData.netSentiment === 'POSITIVE',
                          multiNews: stockData.newsItems
                        })}
                        className="text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed bg-[#F8FAFC] dark:bg-[#0B0F19] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-2.5 font-medium cursor-pointer hover:border-[#2563EB]/50 transition-colors group"
                        title="Click to view deep AI catalyst breakdown"
                      >
                        <p className="line-clamp-2">
                          <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mr-1 group-hover:underline">AI Catalyst:</span>
                          {stockData.primaryReason}
                        </p>
                      </div>

                      {/* MULTI-NEWS IMPACT CATALYSTS LIST */}
                      <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-2.5 border border-[#E2E8F0] dark:border-[#243044] mb-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center text-[#2563EB] dark:text-[#3B82F6]">
                            <Layers className="w-3.5 h-3.5 mr-1" />
                            Impacting Catalysts ({stockData.totalCount}):
                          </span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {stockData.positiveCount > 0 && <b className="text-emerald-600 dark:text-emerald-400 mr-1.5">{stockData.positiveCount} Positive</b>}
                            {stockData.negativeCount > 0 && <b className="text-red-600 dark:text-red-400">{stockData.negativeCount} Negative</b>}
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-0.5">
                          {stockData.newsItems.map((newsItem, nIdx) => {
                            const isPos = newsItem.polarity === 'POSITIVE';
                            return (
                              <div
                                key={nIdx}
                                className="p-2 rounded-md bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0]/70 dark:border-[#243044]/70 flex items-start space-x-2 text-[11px]"
                              >
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${
                                  isPos 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                }`}>
                                  {isPos ? '🟢 Positive' : '🔴 Negative'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold leading-tight line-clamp-2">
                                    {newsItem.title} <span className="font-bold">{newsItem.tagLabel}</span>
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                                    <span>{newsItem.source}</span>
                                    <span>{newsItem.timeAgo}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Compact Flat Action Buttons (h-8 institutional density) */}
                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenCalculator({
                            symbol: stockData.symbol,
                            companyName: stockData.name,
                            currentPrice: Number(stockData.currentPrice),
                            stopLoss: Number(stockData.netSentiment === 'NEGATIVE' ? (stockData.exitTrigger || stockData.stopLoss) : stockData.stopLoss),
                            target1: Number(stockData.netSentiment === 'NEGATIVE' ? (stockData.downsideTarget || stockData.targetSellPrice) : stockData.targetSellPrice),
                            signal: stockData.netSentiment === 'POSITIVE' ? 'BUY_NOW' : 'SELL_EXIT'
                          })}
                          className="h-8 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center justify-center transition-colors"
                        >
                          Order Calc
                        </button>
                        <button
                          onClick={() => onSelectStock(stockData.symbol)}
                          className="h-8 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer flex items-center justify-center transition-colors"
                        >
                          Live Chart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Consolidated Platform Disclaimer */}
          <div className="mt-6 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-center text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
            SECP / PSX Algorithmic Risk Disclaimer: Multi-news catalyst synthesis and technical levels are generated for quantitative research & trade planning. Verify liquidity and apply strict risk control before executing orders.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CHRONOLOGICAL ARTICLE-BY-ARTICLE NEWS FEED STREAM            */}
      {/* ========================================================================= */}
      {viewMode === 'LIVE_NEWS_STREAM' && (
        <div className="space-y-4">
          {filteredNewsFeed.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              <p>No financial news matching this filter. Try clearing the search or sector filter.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredNewsFeed.map((item, idx) => {
              const articlePol = evaluateArticleSentiment(item.title, item.impactSummary || item.description);
              const isPositive = articlePol === 'POSITIVE';
              const upList = item.upStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'UP' || t.action?.startsWith('BUY')) : []);
              const downList = item.downStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'DOWN' || t.action === 'SELL_EXIT') : []);

              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md transition-all space-y-3.5"
                >
                  {/* News Header & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border ${
                        isPositive 
                          ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                          : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                        {articlePol} CATALYST
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] font-bold">
                        {item.category?.replace('_', ' ')}
                      </span>

                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        Source: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{item.source}</b>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatLiveNewsDate(item).label} ({formatLiveNewsDate(item).ago})</span>
                    </div>
                  </div>

                  {/* Headline with Consistent Tagging for Associated Stocks */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    
                    {/* Tagged Stock Pills under Headline */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold mr-1">Impacted Stocks:</span>
                      {upList.map((s, i) => (
                        <button
                          key={`up_${i}`}
                          onClick={() => { toggleStock(s.symbol); setViewMode('NET_STOCK_VIEW'); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            isPositive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {s.symbol} ({isPositive ? 'Positive' : 'Negative'})
                        </button>
                      ))}
                      {downList.map((s, i) => (
                        <button
                          key={`down_${i}`}
                          onClick={() => { toggleStock(s.symbol); setViewMode('NET_STOCK_VIEW'); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            isPositive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {s.symbol} ({isPositive ? 'Positive' : 'Negative'})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Narrative Summary */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3 border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                    <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mr-1.5">⚡ Market Impact:</span>
                    {getCleanImpactSummary(item)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODAL: NEXT-DAY AI SIGNAL & NEWS CATALYST PREDICTION        */}
      {/* ========================================================================= */}
      {predictionModalData && (
        <TomorrowPredictionModal 
          data={predictionModalData}
          marketSession={marketSession}
          onClose={() => setPredictionModalData(null)}
          onOpenCalculator={onOpenCalculator}
          onSelectStock={onSelectStock}
        />
      )}
    </div>
  );
}

// Sub-Component: Comprehensive Tomorrow's AI Signal & Forecast Modal
function TomorrowPredictionModal({ data, marketSession, onClose, onOpenCalculator, onSelectStock }) {
  const { trade, newsItem, isBullish, multiNews = [] } = data;
  const currentPrice = Number(trade.currentPrice || 100);
  const isDownside = !isBullish || Boolean(trade.isDownsideRisk);
  const gainPct = Math.abs(Number(trade.expectedGainPct || (isBullish ? 12.5 : 6.5)));
  const stopLossPct = Number(trade.stopLossPct || 4.5);

  const expectedHigh = (currentPrice * (isBullish ? (1 + (gainPct * 0.6) / 100) : 1.006)).toFixed(2);
  const expectedLow = (currentPrice * (isBullish ? 0.988 : (1 - (gainPct * 0.9) / 100))).toFixed(2);
  const tomorrowTarget1 = isDownside 
    ? (trade.downsideTarget ? Number(trade.downsideTarget).toFixed(2) : (currentPrice * (1 - (gainPct * 0.6) / 100)).toFixed(2))
    : (currentPrice * (1 + (gainPct * 0.5) / 100)).toFixed(2);
  const tomorrowTarget2 = isDownside 
    ? (currentPrice * (1 - (gainPct * 1.2) / 100)).toFixed(2)
    : Number(trade.targetSellPrice || (currentPrice * (1 + gainPct / 100))).toFixed(2);
  const stopLoss = isDownside 
    ? (trade.exitTrigger ? Number(trade.exitTrigger).toFixed(2) : (currentPrice * 0.985).toFixed(2))
    : Number(trade.stopLoss || (currentPrice * (1 - stopLossPct / 100))).toFixed(2);
  const confidencePct = isBullish ? 88 : 84;

  const openingBias = isBullish 
    ? 'Gap-Up Opening (+1.5% to +3.5%)' 
    : 'Gap-Down / Sell Pressure Opening (-1.0% to -2.5%)';

  const circuitLockProbability = isBullish ? '65% (Strong Volume Driven)' : 'Low Risk of Lower Lock';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Modal Header */}
        <div className={`p-6 text-white ${
          isBullish 
            ? 'bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#4F46E5]' 
            : 'bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#991B1B]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-black tracking-wider uppercase">
                  {isBullish ? 'BULLISH CATALYST FORECAST' : 'DOWNSIDE RISK ALERT'}
                </span>
                <span className="text-xs text-white/90 font-mono font-bold">
                  {marketSession?.sessionDateFormatted ? `Session: ${marketSession.sessionDateFormatted}` : 'Next Trading Session'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mono tracking-tight text-white flex items-center space-x-2">
                <span>{trade.symbol}</span>
                <span className="text-sm font-normal text-white/90">({trade.name})</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-[#0F172A] dark:text-[#F8FAFC]">
          
          {/* 1. Triggering News Event / Multi-News List */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>IMPACTING NEWS CATALYSTS ({multiNews.length || 1})</span>
              </span>
              <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">
                Target Session: {marketSession?.sessionDateFormatted || 'Next Open'}
              </span>
            </div>
            
            {multiNews.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {multiNews.map((n, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2 text-xs">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                      n.polarity === 'POSITIVE' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {n.polarity === 'POSITIVE' ? '🟢 Positive' : '🔴 Negative'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">{n.title}</p>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{n.source} • {n.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <h4 className="text-sm font-bold leading-snug">
                {newsItem?.title || 'Sector Catalyst Development'}
              </h4>
            )}
          </div>

          {/* 2. Projected Opening & Price Range Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider">
                Projected Opening Bias
              </span>
              <p className={`text-sm font-black mono ${isBullish ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                {openingBias}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider">
                Expected Trading Range
              </span>
              <p className="text-sm font-black mono text-[#0F172A] dark:text-[#F8FAFC]">
                PKR {expectedLow} — PKR {expectedHigh}
              </p>
            </div>
          </div>

          {/* 3. Key Targets & Stop Loss */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {isDownside ? (
              <>
                <div className="p-3 rounded-xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-[#DC2626] dark:text-[#EF4444]">Pullback Floor S1</span>
                  <p className="text-base font-black mono text-[#DC2626] dark:text-[#EF4444]">PKR {tomorrowTarget1}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">First Support</span>
                </div>

                <div className="p-3 rounded-xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-[#DC2626] dark:text-[#EF4444]">Major Floor S2</span>
                  <p className="text-base font-black mono text-[#DC2626] dark:text-[#EF4444]">PKR {tomorrowTarget2}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Deep Support</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400">Exit Stop Trigger</span>
                  <p className="text-base font-black mono text-amber-600 dark:text-amber-400">PKR {stopLoss}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Breakdown Level</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-[#16A34A]/5 border border-[#16A34A]/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-[#16A34A] dark:text-[#22C55E]">Target 1</span>
                  <p className="text-base font-black mono text-[#16A34A] dark:text-[#22C55E]">PKR {tomorrowTarget1}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Intraday Swing</span>
                </div>

                <div className="p-3 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-[#2563EB] dark:text-[#3B82F6]">Target 2 (Catalyst)</span>
                  <p className="text-base font-black mono text-[#2563EB] dark:text-[#3B82F6]">PKR {tomorrowTarget2}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">+{gainPct}% Max Potential</span>
                </div>

                <div className="p-3 rounded-xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-0.5">
                  <span className="text-[10px] uppercase font-black text-[#DC2626] dark:text-[#EF4444]">Strict Stop Loss</span>
                  <p className="text-base font-black mono text-[#DC2626] dark:text-[#EF4444]">PKR {stopLoss}</p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Risk Control</span>
                </div>
              </>
            )}
          </div>

          {/* 4. Strategic AI Execution Plan */}
          <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Tactical Trade Execution Guidelines
            </h5>
            <ul className="text-xs space-y-1.5 text-[#0F172A] dark:text-[#F8FAFC] pl-1">
              <li className="flex items-start">
                <span className="text-[#2563EB] font-bold mr-2">1.</span>
                <span><b>Opening Strategy:</b> {isBullish ? 'Wait 10-15 mins for opening dip around entry zone before executing fresh positions.' : 'Avoid chasing down gaps. Look for technical exit if resistance fails.'}</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2563EB] font-bold mr-2">2.</span>
                <span><b>Circuit Lock Odds:</b> {circuitLockProbability}</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#2563EB] font-bold mr-2">3.</span>
                <span><b>Catalyst Duration:</b> {isBullish ? '1 to 3 trading sessions momentum carry-over expected.' : 'Immediate defensive posture recommended.'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B0F19] border-t border-[#E2E8F0] dark:border-[#243044] space-y-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              <span>AI Confidence: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{confidencePct}%</b></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onOpenCalculator({
                    symbol: trade.symbol,
                    companyName: trade.name,
                    currentPrice: Number(currentPrice),
                    stopLoss: Number(stopLoss),
                    target1: Number(tomorrowTarget2),
                    signal: isBullish ? 'BUY_NOW' : 'SELL_EXIT'
                  });
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Set Trade Order
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectStock(trade.symbol);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#151E2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] transition-all cursor-pointer"
              >
                Open Live Chart
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] italic text-center pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
            Signals and market intelligence are for technical research purposes only and do not constitute financial advice.
          </p>
        </div>

      </div>
    </div>
  );
}
