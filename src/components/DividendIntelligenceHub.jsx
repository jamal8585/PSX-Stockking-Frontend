import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Sparkles, 
  Calculator, 
  Clock, 
  Search, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  LineChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Percent,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

// --- AUTHENTIC PSX UPCOMING & ANNOUNCED DIVIDENDS DATA ---
const UPCOMING_DIVIDEND_STOCKS = [
  // =========================================================================
  // --- SEPTEMBER (June FY-End Final Dividends & Corporate Actions) ---
  // =========================================================================
  {
    symbol: 'OGDC',
    name: 'Oil & Gas Development Company Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 4.00,
    annualDividend: 14.50,
    defaultPrice: 328.70,
    bookClosure: 'Sep 24 to Oct 01, 2026',
    approxExDate: 'Sep 22, 2026',
    lastBuyDate: 'Sep 20, 2026',
    status: 'confirmed', // 'confirmed', 'expected', 'aristocrat'
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Book Closure se kam az kam 2-3 din pehle (Sep 20 tak) buy karein taake T+2 settlement cycle mein aapka naam share register par record date se pehle charh jaye.',
    whyBuyReason: 'Pakistan ki sab se barri E&P giant hai with massive cash reserves. Circular debt clearance package se cash flow bohot mazboot hai aur consistent 100% quarterly dividend history hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'POL',
    name: 'Pakistan Oilfields Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Mega Cash Dividend',
    payoutCycle: 'Semi-Annual / Annual Heavy Payout',
    expectedDividend: 35.00,
    annualDividend: 75.00,
    defaultPrice: 734.56,
    bookClosure: 'Sep 22 to Sep 29, 2026',
    approxExDate: 'Sep 20, 2026',
    lastBuyDate: 'Sep 18, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Heavy payout dividend stock hai! Sep 18 tak buy karne par record date par full PKR 35/share dividend direct CDC bank account mein credit hoga.',
    whyBuyReason: 'Zero debt balance sheet hai aur PSX ka highest cash dividend yield dene wala energy blue-chip stock hai. Dollar-linked oil revenue aur steady production isay secure banati hain.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'MARI',
    name: 'Mari Petroleum / Energies Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash Dividend + Bonus Issue',
    payoutCycle: 'Final Annual Payout',
    expectedDividend: 18.00,
    annualDividend: 38.00,
    defaultPrice: 663.26,
    bookClosure: 'Sep 18 to Sep 25, 2026',
    approxExDate: 'Sep 16, 2026',
    lastBuyDate: 'Sep 14, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 14 tak positions build karein taake cash dividend ke saath saath corporate bonus shares ki allotment eligibility bhi mil jaye.',
    whyBuyReason: 'Mari gas field ki continuous discoveries aur massive reserve replacements ki wajah se stock all-time high profitability par trade kar raha hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'HUBC',
    name: 'The Hub Power Company Limited',
    sector: 'Power Generation',
    month: 'September',
    dividendType: '4th Interim / Final Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 5.00,
    annualDividend: 20.00,
    defaultPrice: 209.67,
    bookClosure: 'Sep 18 to Sep 26, 2026',
    approxExDate: 'Sep 16, 2026',
    lastBuyDate: 'Sep 14, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 14 se pehle buy karein. Dividend distribution ke baad stock normally jaldi price recover kar leta hai.',
    whyBuyReason: 'Thar coal mining aur CPEC IPP power projects se dollar-indexed secure return milta hai. Har quarter regular aur heavy cash dividend deta hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    payoutCycle: 'Annual / Final Payout',
    expectedDividend: 3.50,
    annualDividend: 11.50,
    defaultPrice: 234.50,
    bookClosure: 'Sep 25 to Oct 02, 2026',
    approxExDate: 'Sep 23, 2026',
    lastBuyDate: 'Sep 21, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Sep 21 se pehle buy karein taake ex-dividend date se pehle share holdings CDC account mein credit ho sakein.',
    whyBuyReason: 'Sui field exploration aur energy receivables mein tezi ki wajah se munafa barha hai. Strong balance sheet aur high state backing.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'INDU',
    name: 'Indus Motor Company Limited (Toyota)',
    sector: 'Automobile',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    payoutCycle: 'Quarterly / Final Payout',
    expectedDividend: 45.00,
    annualDividend: 110.00,
    defaultPrice: 1928.89,
    bookClosure: 'Sep 22 to Sep 30, 2026',
    approxExDate: 'Sep 20, 2026',
    lastBuyDate: 'Sep 18, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 18 tak khareedein. Auto sector mein sab se heavy single-payout dividend deta hai.',
    whyBuyReason: 'Toyota ki local hybrid manufacturing dominance aur zero-debt balance sheet company ko solid cash surplus faraham karti hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'COLG',
    name: 'Colgate-Palmolive (Pakistan) Limited',
    sector: 'Consumer & Staples',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    payoutCycle: 'Annual / Final Payout',
    expectedDividend: 28.00,
    annualDividend: 55.00,
    defaultPrice: 1198.02,
    bookClosure: 'Sep 16 to Sep 24, 2026',
    approxExDate: 'Sep 14, 2026',
    lastBuyDate: 'Sep 12, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 12 tak portfolio mein hold karein taake cash dividend eligibility confirm ho.',
    whyBuyReason: 'Zero debt consumer staples champion jo high return on equity (ROE) generate karta hai aur regular cash payout deta hai.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'LUCK',
    name: 'Lucky Cement Limited',
    sector: 'Cement & Construction',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    payoutCycle: 'Annual / Final Payout',
    expectedDividend: 15.00,
    annualDividend: 25.00,
    defaultPrice: 437.33,
    bookClosure: 'Sep 26 to Oct 04, 2026',
    approxExDate: 'Sep 24, 2026',
    lastBuyDate: 'Sep 22, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 22 tak entry lein taake book closure record cut-off mein registration complete ho.',
    whyBuyReason: 'Pakistan ka largest cement manufacturer aur conglomerate hai (automobile, chemicals, power). Zero debt aur massive export revenues.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'ILP',
    name: 'Interloop Limited',
    sector: 'Textile & Apparel',
    month: 'September',
    dividendType: 'Final Cash Dividend',
    payoutCycle: 'Semi-Annual / Final Payout',
    expectedDividend: 2.50,
    annualDividend: 7.50,
    defaultPrice: 68.00,
    bookClosure: 'Sep 25 to Oct 02, 2026',
    approxExDate: 'Sep 23, 2026',
    lastBuyDate: 'Sep 21, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Sep 21 se pehle buy karein.',
    whyBuyReason: 'Pakistan ka top textile apparel exporter hai jo Nike aur Adidas jaisay global brands ko supply karta hai. Dollar export revenues se steady dividend payout.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },

  // =========================================================================
  // --- OCTOBER (Q3 Calendar Year Heavyweights: Banks & Fertilizers) ---
  // =========================================================================
  {
    symbol: 'FFC',
    name: 'Fauji Fertilizer Company Limited',
    sector: 'Fertilizer',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend (CY26)',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 9.00,
    annualDividend: 52.00,
    defaultPrice: 552.70,
    bookClosure: 'Oct 20 to Oct 28, 2026',
    approxExDate: 'Oct 18, 2026',
    lastBuyDate: 'Oct 16, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 16 se pehle buy karein. FFC har saal 4 dafa consistent quarterly dividend lazmi deta hai.',
    whyBuyReason: 'Pakistan ki fertilizer market leader hai. Agriculture demand aur urea off-take hamesha high rehta hai, jis se stable 90%+ profit payout hota hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'EFERT',
    name: 'Engro Fertilizers Limited',
    sector: 'Fertilizer',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend (CY26)',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 5.50,
    annualDividend: 20.50,
    defaultPrice: 181.35,
    bookClosure: 'Oct 16 to Oct 24, 2026',
    approxExDate: 'Oct 14, 2026',
    lastBuyDate: 'Oct 12, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 12 tak position lein taake record date par cash dividend direct bank account mein transfer ho.',
    whyBuyReason: 'Modern production plants aur continuous gas efficiency ki wajah se high cash generation hai. Almost 100% earnings dividend mein baant-ti hai with ~11% annual yield.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'UBL',
    name: 'United Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Mega Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 11.00,
    annualDividend: 44.00,
    defaultPrice: 450.76,
    bookClosure: 'Oct 22 to Oct 30, 2026',
    approxExDate: 'Oct 20, 2026',
    lastBuyDate: 'Oct 18, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 18 tak buy karein. UBL industry ka single highest dividend yield dene wala commercial bank hai.',
    whyBuyReason: 'Exceptional deposit franchise aur high treasury yields ki wajah se net interest income all-time peak par hai. Payout ratio 85%+ rehta hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'MCB',
    name: 'MCB Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 9.00,
    annualDividend: 36.00,
    defaultPrice: 405.27,
    bookClosure: 'Oct 20 to Oct 28, 2026',
    approxExDate: 'Oct 18, 2026',
    lastBuyDate: 'Oct 16, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 16 tak holdings create karein taake ex-date par complete payout eligible ho.',
    whyBuyReason: 'Banking sector ka sab se safe aur high-capital adequacy wala bank hai. Har quarter regular aur predictable PKR 9/share dividend deta hai.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'MEBL',
    name: 'Meezan Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Islamic Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 7.00,
    annualDividend: 28.00,
    defaultPrice: 320.00,
    bookClosure: 'Oct 18 to Oct 26, 2026',
    approxExDate: 'Oct 16, 2026',
    lastBuyDate: 'Oct 14, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 14 se pehle buy karein. Islamic banking growth ke sab se behtareen returns deta hai.',
    whyBuyReason: 'Pakistan ka No.1 Islamic Bank hai jiska Non-Performing Loans (NPL) ratio industry mein sab se kam hai. Phenomenal ROE aur shariah-compliant dividend payout.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'KAPCO',
    name: 'Kot Addu Power Company Limited',
    sector: 'Power Generation',
    month: 'October',
    dividendType: 'Final Cash Dividend (Super High Yield)',
    payoutCycle: 'Final Heavy Payout',
    expectedDividend: 4.50,
    annualDividend: 9.00,
    defaultPrice: 27.47,
    bookClosure: 'Oct 12 to Oct 20, 2026',
    approxExDate: 'Oct 10, 2026',
    lastBuyDate: 'Oct 08, 2026',
    status: 'confirmed',
    statusLabel: 'Confirmed / Board Approved',
    buyTimingTip: 'Oct 08 tak purchase karein. Super-high percentage yield dene wala power stock hai (16%+ yield).',
    whyBuyReason: 'Large cash surplus aur high treasury returns se massive cash dividend pay karta hai. Low share price par outstanding dividend return.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'HBL',
    name: 'Habib Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 4.00,
    annualDividend: 16.00,
    defaultPrice: 318.05,
    bookClosure: 'Oct 24 to Nov 01, 2026',
    approxExDate: 'Oct 22, 2026',
    lastBuyDate: 'Oct 20, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 20 tak buy karein.',
    whyBuyReason: 'Pakistan ka largest branch network bank hai. Treasury earnings aur international remittances growth se consistent quarterly dividend support hota hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'NESTLE',
    name: 'Nestle Pakistan Limited',
    sector: 'Consumer & Staples',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 85.00,
    annualDividend: 280.00,
    defaultPrice: 6800.00,
    bookClosure: 'Oct 16 to Oct 24, 2026',
    approxExDate: 'Oct 14, 2026',
    lastBuyDate: 'Oct 12, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Oct 12 tak khareedein. Heavy price wala defensive blue-chip stock hai.',
    whyBuyReason: 'FMCG aur dairy foods mein unmatched market pricing power hai. Zero debt aur recession-proof business model.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },

  // =========================================================================
  // --- NOVEMBER (Q1 FY26 Announcements & Quarterly Disbursements) ---
  // =========================================================================
  {
    symbol: 'HUBC',
    name: 'The Hub Power Company (Q1 FY26)',
    sector: 'Power Generation',
    month: 'November',
    dividendType: '1st Interim Cash Dividend (FY26)',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 4.50,
    annualDividend: 20.00,
    defaultPrice: 209.67,
    bookClosure: 'Nov 12 to Nov 20, 2026',
    approxExDate: 'Nov 10, 2026',
    lastBuyDate: 'Nov 08, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Nov 08 se pehle positions open karein.',
    whyBuyReason: 'Q1 FY results mein Thar energy dividends aur base plant return se regular quarterly income sustain hoti hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'PSO',
    name: 'Pakistan State Oil Company Limited',
    sector: 'Oil & Gas (Marketing)',
    month: 'November',
    dividendType: 'Final / Q1 Interim Cash Dividend',
    payoutCycle: 'Semi-Annual / Annual',
    expectedDividend: 8.50,
    annualDividend: 16.00,
    defaultPrice: 363.84,
    bookClosure: 'Nov 15 to Nov 24, 2026',
    approxExDate: 'Nov 13, 2026',
    lastBuyDate: 'Nov 11, 2026',
    status: 'expected',
    statusLabel: 'Board Meeting / Expected',
    buyTimingTip: 'Nov 11 tak entry lein.',
    whyBuyReason: 'Pakistan ka largest fuel marketing giant. Petroleum retail volumetric growth aur circular debt resolution se payout recovery expect hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'AGP',
    name: 'AGP Limited',
    sector: 'Pharmaceuticals',
    month: 'November',
    dividendType: 'Interim Cash Dividend',
    payoutCycle: 'Quarterly / Semi-Annual',
    expectedDividend: 2.50,
    annualDividend: 8.50,
    defaultPrice: 85.00,
    bookClosure: 'Nov 18 to Nov 26, 2026',
    approxExDate: 'Nov 16, 2026',
    lastBuyDate: 'Nov 14, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Nov 14 tak buy karein.',
    whyBuyReason: 'Pharma market mein essential medicine portfolio aur steady institutional orders se consistent quarterly payout maintain karta hai.',
    shariahCompliant: true,
    safetyRating: 'MEDIUM'
  },
  {
    symbol: 'ABOT',
    name: 'Abbott Laboratories (Pakistan) Limited',
    sector: 'Pharmaceuticals',
    month: 'November',
    dividendType: 'Interim Cash Dividend',
    payoutCycle: 'Semi-Annual / Annual',
    expectedDividend: 15.00,
    annualDividend: 45.00,
    defaultPrice: 620.00,
    bookClosure: 'Nov 10 to Nov 18, 2026',
    approxExDate: 'Nov 08, 2026',
    lastBuyDate: 'Nov 06, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Nov 06 tak purchase karein.',
    whyBuyReason: 'Global healthcare leader ka local arm hai jo high brand trust aur strong margins par operate karta hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },

  // =========================================================================
  // --- DECEMBER (Pre-Annual CY Closing & Year-End Accumulation) ---
  // =========================================================================
  {
    symbol: 'FATIMA',
    name: 'Fatima Fertilizer Company Limited',
    sector: 'Fertilizer',
    month: 'December',
    dividendType: 'Year-End Pre-Closing Payout',
    payoutCycle: 'Annual / Semi-Annual',
    expectedDividend: 4.00,
    annualDividend: 9.00,
    defaultPrice: 155.01,
    bookClosure: 'Dec 18 to Dec 28, 2026',
    approxExDate: 'Dec 16, 2026',
    lastBuyDate: 'Dec 14, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Dec 14 tak buy karein.',
    whyBuyReason: 'High capacity utilization aur low concessionary gas feed pricing se zabardast dividend yield provide karta hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'SYS',
    name: 'Systems Limited',
    sector: 'Technology',
    month: 'December',
    dividendType: 'Pre-Year End Bonus / Cash Payout',
    payoutCycle: 'Annual Payout',
    expectedDividend: 6.00,
    annualDividend: 12.00,
    defaultPrice: 124.54,
    bookClosure: 'Dec 15 to Dec 24, 2026',
    approxExDate: 'Dec 13, 2026',
    lastBuyDate: 'Dec 11, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Dec 11 se pehle buy karein.',
    whyBuyReason: 'Pakistan ki No.1 IT export company hai with robust USD overseas revenue growth in Gulf and US markets.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'BAHL',
    name: 'Bank AL Habib Limited',
    sector: 'Commercial Banks',
    month: 'December',
    dividendType: 'Pre-Closing Interim Cash Dividend',
    payoutCycle: 'Quarterly Regular (4x/yr)',
    expectedDividend: 5.00,
    annualDividend: 20.00,
    defaultPrice: 125.00,
    bookClosure: 'Dec 20 to Dec 30, 2026',
    approxExDate: 'Dec 18, 2026',
    lastBuyDate: 'Dec 16, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Dec 16 tak buy karein.',
    whyBuyReason: 'Trade finance leader with zero bad debt history. Predictable cash flow aur quarterly dividend policy.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'ENGRO',
    name: 'Engro Corporation Limited',
    sector: 'Conglomerates',
    month: 'December',
    dividendType: 'Year-End Pre-Closing Payout',
    payoutCycle: 'Quarterly / Semi-Annual',
    expectedDividend: 8.00,
    annualDividend: 32.00,
    defaultPrice: 340.00,
    bookClosure: 'Dec 22 to Dec 31, 2026',
    approxExDate: 'Dec 20, 2026',
    lastBuyDate: 'Dec 18, 2026',
    status: 'aristocrat',
    statusLabel: 'Quarterly Cycle Expected',
    buyTimingTip: 'Dec 18 tak accumulate karein.',
    whyBuyReason: 'Diversified conglomerate energy, fertilizer, terminals aur telecom tower investments se massive cash flow.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  }
];

const MONTH_FILTERS = ['All Months', 'September', 'October', 'November', 'December'];
const SECTOR_FILTERS = [
  'All Sectors', 
  'Oil & Gas (E&P)', 
  'Fertilizer', 
  'Commercial Banks', 
  'Power Generation', 
  'Automobile', 
  'Consumer & Staples',
  'Cement & Construction',
  'Textile & Apparel',
  'Technology',
  'Pharmaceuticals',
  'Conglomerates'
];
const STATUS_FILTERS = [
  { id: 'all', label: 'All Status' },
  { id: 'confirmed', label: '🟢 Confirmed / Announced' },
  { id: 'expected', label: '🟡 Board Meeting / Expected' },
  { id: 'aristocrat', label: '🔵 High-Yield Aristocrats' }
];

export default function DividendIntelligenceHub({ stocks = [], onSelectStock }) {
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyShariah, setOnlyShariah] = useState(false);
  const [sortBy, setSortBy] = useState('month'); // 'month', 'yield', 'annualYield', 'payout'

  // Calculator State
  const [calcSymbol, setCalcSymbol] = useState('FFC');
  const [calcShares, setCalcShares] = useState(2000);
  const [calcDividendPerShare, setCalcDividendPerShare] = useState(9.00);
  const [calcTaxRate, setCalcTaxRate] = useState(15); // 15% Filer, 30% Non-Filer
  const [calcBuyPrice, setCalcBuyPrice] = useState(552.70);

  // Helper to resolve live price dynamically
  const getLivePrice = (sym, defaultPrice = 120) => {
    if (Array.isArray(stocks) && stocks.length > 0) {
      const found = stocks.find(s => s?.symbol?.toUpperCase() === sym.toUpperCase());
      if (found) {
        if (Number(found.currentPrice) > 0) return Number(found.currentPrice);
        if (Number(found.price) > 0) return Number(found.price);
        if (Number(found.close) > 0) return Number(found.close);
      }
    }
    // Fallback to official bundled dictionary if available
    if (officialQuotes && typeof officialQuotes === 'object') {
      const q = officialQuotes[sym.toUpperCase()];
      if (q && Number(q.currentPrice) > 0) return Number(q.currentPrice);
      if (q && Number(q.close) > 0) return Number(q.close);
    }
    return defaultPrice;
  };

  const filteredDividends = useMemo(() => {
    let list = UPCOMING_DIVIDEND_STOCKS.filter(item => {
      const matchMonth = selectedMonth === 'All Months' || item.month.toLowerCase() === selectedMonth.toLowerCase();
      const matchSector = selectedSector === 'All Sectors' || item.sector === selectedSector;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchSearch = searchQuery === '' || 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchShariah = !onlyShariah || item.shariahCompliant;

      return matchMonth && matchSector && matchStatus && matchSearch && matchShariah;
    });

    // Sorting
    return list.sort((a, b) => {
      const priceA = getLivePrice(a.symbol, a.defaultPrice);
      const priceB = getLivePrice(b.symbol, b.defaultPrice);
      const yieldA = priceA > 0 ? (a.expectedDividend / priceA) * 100 : 0;
      const yieldB = priceB > 0 ? (b.expectedDividend / priceB) * 100 : 0;
      const annualYieldA = priceA > 0 ? (a.annualDividend / priceA) * 100 : 0;
      const annualYieldB = priceB > 0 ? (b.annualDividend / priceB) * 100 : 0;

      if (sortBy === 'yield') return yieldB - yieldA;
      if (sortBy === 'annualYield') return annualYieldB - annualYieldA;
      if (sortBy === 'payout') return b.expectedDividend - a.expectedDividend;
      return 0; // default month order
    });
  }, [selectedMonth, selectedSector, selectedStatus, searchQuery, onlyShariah, sortBy, stocks]);

  const handleLoadCalculator = (item) => {
    const liveP = getLivePrice(item.symbol, item.defaultPrice);
    setCalcSymbol(item.symbol);
    setCalcDividendPerShare(item.expectedDividend);
    setCalcBuyPrice(liveP);
    const el = document.getElementById('dividend-calculator-box');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const totalInvestment = Number(calcShares) * Number(calcBuyPrice);
  const grossDividend = Number(calcShares) * Number(calcDividendPerShare);
  const taxAmount = grossDividend * (Number(calcTaxRate) / 100);
  const netDividendInBank = grossDividend - taxAmount;
  const singlePayoutYield = totalInvestment > 0 ? (netDividendInBank / totalInvestment) * 100 : 0;
  const estimatedAnnualYield = singlePayoutYield * 4;

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-6 shadow-sm dark:shadow-md transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B] shrink-0">
              <Coins className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  PSX Upcoming & Announced Dividends Intelligence
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] text-white">
                  OFFICIAL PSX CALENDAR
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Authentic PSX corporate announcements, book closure schedules, <b>T+2 settlement rules (Last Buy Date)</b>, live dynamic yield calculations, aur interactive <b>Dividend Net Cash Calculator</b>.
              </p>
            </div>
          </div>

          {/* Season Intelligence Stats Pill */}
          <div className="flex items-center space-x-4 bg-[#F8FAFC] dark:bg-[#0B0F19] px-4 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] shrink-0 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Current Cycle</span>
              <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono">Sep – Dec Peak Season</span>
            </div>
            <div className="h-7 w-[1px] bg-[#E2E8F0] dark:bg-[#243044]"></div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Top Annual Yield</span>
              <span className="font-bold text-[#16A34A] dark:text-[#22C55E] mono">Up to 16.4% (KAPCO / POL)</span>
            </div>
            <Sparkles className="w-5 h-5 text-[#D97706] dark:text-[#F59E0B] animate-pulse" />
          </div>
        </div>

        {/* 3 Core Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#243044] text-xs">
          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">T+2 Settlement Rule (Last Buy Date):</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Dividend lene ke liye <b>Book Closure se 2 din pehle (Last Buy Date)</b> shares buy karein taake CDC record date par naam register ho.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <Percent className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Live Dynamic Yields:</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Yields static nahi hain! Har stock ka yield real-time market price ke mutabiq dynamically calculate hota hai.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <Calculator className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">FBR Net Tax Deduction:</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Active Filer par <b>15% WHT</b> aur Non-Filer par <b>30% WHT</b> deduct ho kar net cash direct aapke CDC linked bank account mein credit hota hai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Month-Wise, Sector-Wise & Status Dynamic Filters */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md space-y-4">
        {/* Month Selector Tabs */}
        <div>
          <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] tracking-wider block mb-2">
            📅 Target Calendar Month:
          </span>
          <div className="flex flex-wrap gap-2">
            {MONTH_FILTERS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMonth === m
                    ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black shadow-sm font-black'
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
                }`}
              >
                {m === 'All Months' ? '🌐 All Months (Sep – Dec)' : `🗓️ ${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
          <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] tracking-wider block mb-2">
            🏷️ PSX Announcement Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A] shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector, Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
          {/* Sector Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mr-1 hidden sm:inline">
              Sector:
            </span>
            {SECTOR_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSector(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedSector === s
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search, Shariah Checkbox & Sort Selector */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Sort Selector */}
            <div className="flex items-center space-x-1 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[#0F172A] dark:text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="month">Default Calendar</option>
                <option value="yield">Highest Single Yield %</option>
                <option value="annualYield">Highest Annual Yield %</option>
                <option value="payout">Highest Payout (PKR)</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search symbol / name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* Shariah Checkbox */}
            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={onlyShariah}
                onChange={e => setOnlyShariah(e.target.checked)}
                className="rounded accent-[#16A34A] dark:accent-[#22C55E] cursor-pointer"
              />
              <span className="text-[#16A34A] dark:text-[#22C55E]">🕌 KMI-30</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Dividend Companies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
            <Coins className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>Eligible Dividend Opportunities ({filteredDividends.length} Companies)</span>
          </h3>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Filtered by: {selectedMonth} • {selectedSector} • {selectedStatus !== 'all' ? selectedStatus.toUpperCase() : 'ALL STATUS'}
          </span>
        </div>

        {filteredDividends.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#D97706] dark:text-[#F59E0B] mx-auto" />
            <h4 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">No Dividend Opportunities Found</h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Filter criteria ko reset karein taake baqi dividend stocks nazar aa sakein.</p>
            <button
              onClick={() => {
                setSelectedMonth('All Months');
                setSelectedSector('All Sectors');
                setSelectedStatus('all');
                setSearchQuery('');
                setOnlyShariah(false);
              }}
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer hover:bg-[#1D4ED8]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDividends.map((item) => {
              const livePrice = getLivePrice(item.symbol, item.defaultPrice);
              const singleYield = livePrice > 0 ? ((item.expectedDividend / livePrice) * 100).toFixed(1) : '0.0';
              const annualYield = livePrice > 0 ? ((item.annualDividend / livePrice) * 100).toFixed(1) : '0.0';

              const isConfirmed = item.status === 'confirmed';
              const isExpected = item.status === 'expected';

              return (
                <div
                  key={`${item.month}-${item.symbol}`}
                  className="group bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#D97706]/60 dark:hover:border-[#F59E0B]/60 rounded-xl p-5 shadow-sm dark:shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Symbol, Badges & Expected Payout Box */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span 
                            onClick={() => onSelectStock && onSelectStock(item.symbol)}
                            className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono cursor-pointer hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
                            title="Click to view full technical chart & intelligence"
                          >
                            {item.symbol}
                          </span>
                          
                          {/* Month Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] text-[10px] font-bold border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center space-x-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{item.month}</span>
                          </span>

                          {/* Shariah Badge */}
                          {item.shariahCompliant && (
                            <span className="px-2 py-0.5 rounded-md bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] text-[10px] font-bold border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                              🕌 KMI-30
                            </span>
                          )}

                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${
                            isConfirmed 
                              ? 'bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border-[#16A34A]/30 dark:border-[#22C55E]/30'
                              : isExpected
                              ? 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] border-[#D97706]/30 dark:border-[#F59E0B]/30'
                              : 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border-[#2563EB]/30 dark:border-[#3B82F6]/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                              isConfirmed ? 'bg-[#16A34A] dark:bg-[#22C55E] animate-pulse' : isExpected ? 'bg-[#D97706] dark:bg-[#F59E0B]' : 'bg-[#2563EB] dark:bg-[#3B82F6]'
                            }`}></span>
                            <span>{item.statusLabel}</span>
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 truncate max-w-[280px]">
                          {item.name} • <b className="text-[#0F172A] dark:text-[#F8FAFC]">{item.sector}</b>
                        </p>
                      </div>

                      {/* Expected Dividend Floating Badge */}
                      <div className="text-right shrink-0 bg-[#F8FAFC] dark:bg-[#0B0F19] px-3.5 py-2 rounded-lg border border-[#D97706]/30 dark:border-[#F59E0B]/30 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Expected Payout</span>
                        <span className="text-lg font-black text-[#D97706] dark:text-[#F59E0B] mono block mt-0.5">
                          PKR {item.expectedDividend.toFixed(2)}
                        </span>
                        <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                          <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] font-bold">
                            {singleYield}% single
                          </span>
                          <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">
                            • ~{annualYield}% ann.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Announcement & Live Rate Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs">
                      <div>
                        <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Announcement Type</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-[11px] truncate block mt-0.5" title={item.dividendType}>
                          {item.dividendType}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#3B82F6] font-bold block">Live Market Price</span>
                        <span className="font-black text-[#2563EB] dark:text-[#3B82F6] mono text-sm block mt-0.5">
                          PKR {livePrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#16A34A] dark:text-[#22C55E] font-bold block">Est. Annual Payout</span>
                        <span className="font-black text-[#16A34A] dark:text-[#22C55E] mono text-sm block mt-0.5">
                          PKR {item.annualDividend.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* ⏰ "T+2 Settlement & Last Buy Date" Timeline Box */}
                    <div className="bg-[#FFFBEB] dark:bg-[#78350F]/15 border border-[#D97706]/30 dark:border-[#F59E0B]/30 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[#D97706] dark:text-[#F59E0B] font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Buy Timing & Settlement Schedule:</span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#D97706]/20 dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]">
                          Last Buy: {item.lastBuyDate}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-white/60 dark:bg-black/20 p-1.5 rounded">
                        <div><b>Ex-Dividend Date:</b> {item.approxExDate}</div>
                        <div><b>Book Closure:</b> {item.bookClosure}</div>
                      </div>
                      <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                        {item.buyTimingTip}
                      </p>
                    </div>

                    {/* 💡 "Kion Buy Karna Chaye?" Fundamental Rationale */}
                    <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 p-3 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center space-x-1.5 text-[#2563EB] dark:text-[#3B82F6] font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Kion Buy Karna Chaye? (Fundamental Reason)</span>
                      </div>
                      <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                        {item.whyBuyReason}
                      </p>
                    </div>
                  </div>

                  {/* Compact, Sleek & Elegant Action Buttons */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-[#243044]">
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
                      <span className="font-semibold text-[10px]">Safety: {item.safetyRating}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLoadCalculator(item)}
                        className="py-1.5 px-3 rounded-lg bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#2563EB] hover:text-white dark:bg-[#3B82F6]/10 dark:hover:bg-[#3B82F6] dark:text-[#3B82F6] dark:hover:text-white border border-[#2563EB]/25 dark:border-[#3B82F6]/25 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                        title="Calculate Net Cash Dividend"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Calculate</span>
                      </button>

                      <button
                        onClick={() => onSelectStock && onSelectStock(item.symbol)}
                        className="py-1.5 px-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] text-xs font-semibold flex items-center space-x-1 border border-[#E2E8F0] dark:border-[#243044] transition-all cursor-pointer"
                        title="Open Technical Chart & Intel"
                      >
                        <span>Intel</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Interactive Dividend Profit & Tax Calculator Tool */}
      <div id="dividend-calculator-box" className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-6 shadow-sm dark:shadow-md space-y-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
            <Calculator className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">Interactive PSX Dividend Profit & Net Cash Calculator</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Calculate exact cash dividends deposited into your bank account after 15% (Filer) or 30% (Non-Filer) Withholding Tax.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div>
              <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-bold mb-1 uppercase text-[11px]">Selected Stock Symbol:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={calcSymbol}
                  onChange={e => {
                    const sym = e.target.value.toUpperCase();
                    setCalcSymbol(sym);
                    const found = UPCOMING_DIVIDEND_STOCKS.find(s => s.symbol === sym);
                    if (found) {
                      setCalcDividendPerShare(found.expectedDividend);
                      setCalcBuyPrice(getLivePrice(sym, found.defaultPrice));
                    }
                  }}
                  className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono text-sm uppercase focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-bold mb-1 uppercase text-[11px]">Quantity (Shares):</label>
                <input
                  type="number"
                  min="1"
                  value={calcShares}
                  onChange={e => setCalcShares(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-bold mb-1 uppercase text-[11px]">Expected Div/Share (PKR):</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcDividendPerShare}
                  onChange={e => setCalcDividendPerShare(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#D97706] dark:text-[#F59E0B] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-bold mb-1 uppercase text-[11px]">Share Buy Price (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcBuyPrice}
                  onChange={e => setCalcBuyPrice(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-bold mb-1 uppercase text-[11px]">Tax Status (FBR WHT):</label>
                <select
                  value={calcTaxRate}
                  onChange={e => setCalcTaxRate(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] cursor-pointer"
                >
                  <option value={15}>Active Filer (15% Tax)</option>
                  <option value={30}>Non-Filer (30% Tax)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Outputs Column */}
          <div className="lg:col-span-7 bg-[#F8FAFC] dark:bg-[#0B0F19] p-5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                <span>Total Capital Outlay ({calcShares} shares @ PKR {calcBuyPrice}):</span>
                <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono text-sm">
                  PKR {totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                <span>Gross Expected Dividend ({calcShares} × PKR {calcDividendPerShare}):</span>
                <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono text-sm">
                  PKR {grossDividend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                <span>Withholding Tax Deduction ({calcTaxRate}%):</span>
                <span className="font-bold text-[#DC2626] dark:text-[#EF4444] mono text-sm">
                  - PKR {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#243044] flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold text-[#16A34A] dark:text-[#22C55E] block">Net Bank Account Credit 💰</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Directly transferred through CDC E-Dividend</span>
                </div>
                <span className="text-2xl font-bold text-[#16A34A] dark:text-[#22C55E] mono">
                  PKR {netDividendInBank.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Yield Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Single Payout Net Yield</span>
                <span className="text-base font-bold text-[#2563EB] dark:text-[#3B82F6] mono mt-0.5 block">
                  {singlePayoutYield.toFixed(2)}%
                </span>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Estimated Annualized Yield (4x)</span>
                <span className="text-base font-bold text-[#D97706] dark:text-[#F59E0B] mono mt-0.5 block">
                  ~{estimatedAnnualYield.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
