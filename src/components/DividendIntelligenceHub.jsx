import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Calculator, 
  Clock, 
  CheckCircle2, 
  Info, 
  Search, 
  Filter, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Zap, 
  HelpCircle,
  Percent,
  Banknote,
  DollarSign
} from 'lucide-react';

const UPCOMING_DIVIDEND_STOCKS = [
  // --- SEPTEMBER (June FY-End Final Dividends) ---
  {
    symbol: 'OGDC',
    name: 'Oil & Gas Development Company',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash Dividend (FY24/25)',
    expectedDividend: 4.00,
    expectedYield: '3.1%',
    approxExDate: 'Sep 22 - Sep 28',
    buyTimingTip: 'Book Closure se kam az kam 2-3 din pehle khareedein (e.g. Sep 20 tak) taake T+2 settlement mein naam register ho sake.',
    whyBuyReason: 'Pakistan ki sab se barri E&P giant hai. Circular debt clearance package se cash flow bohot mazboot hai aur consistent 100% quarterly payout history hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash Dividend',
    expectedDividend: 3.50,
    expectedYield: '2.8%',
    approxExDate: 'Sep 24 - Sep 30',
    buyTimingTip: 'Sep 21 se pehle buy karein taake ex-dividend date se pehle share holdings CDC account mein credit ho jayein.',
    whyBuyReason: 'Sui field exploration aur energy receivables mein tezi ki wajah se munafa barha hai. Strong balance sheet aur zero default risk.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'POL',
    name: 'Pakistan Oilfields Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Mega Dividend',
    expectedDividend: 35.00,
    expectedYield: '7.6%',
    approxExDate: 'Sep 18 - Sep 25',
    buyTimingTip: 'Heavy payout stock hai! Sep 16 tak buy karne se record date par full PKR 35/share dividend milega.',
    whyBuyReason: 'Zero debt company hai aur PSX ka highest cash dividend yield dene wala energy stock hai. Dollar revenue stream aur stable oil prices isay secure banati hain.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'MARI',
    name: 'Mari Energies Limited',
    sector: 'Oil & Gas (E&P)',
    month: 'September',
    dividendType: 'Final Cash + Bonus Shares',
    expectedDividend: 18.00,
    expectedYield: '5.2%',
    approxExDate: 'Sep 20 - Sep 27',
    buyTimingTip: 'Sep 18 tak positions build karein taake cash dividend ke saath bonus shares allotment ki eligibility bhi mil jaye.',
    whyBuyReason: 'Mari gas field ki continuous discoveries aur massive reserve replacements ki wajah se stock all-time high profitability par trade kar raha hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'HUBC',
    name: 'The Hub Power Company Limited',
    sector: 'Power Generation',
    month: 'September',
    dividendType: '4th Interim / Final Cash Dividend',
    expectedDividend: 5.00,
    expectedYield: '3.8%',
    approxExDate: 'Sep 15 - Sep 22',
    buyTimingTip: 'Sep 14 se pehle buy karein. Dividend ke baad stock quickly recover karta hai.',
    whyBuyReason: 'Thar coal mining aur CPEC IPP power projects se dollar-indexed return milta hai. Quarterly cash payouts ka track record 100% reliable hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'INDU',
    name: 'Indus Motor Company (Toyota)',
    sector: 'Automobile',
    month: 'September',
    dividendType: 'Final Cash Dividend',
    expectedDividend: 45.00,
    expectedYield: '3.4%',
    approxExDate: 'Sep 22 - Sep 29',
    buyTimingTip: 'Sep 20 tak khareedein. Auto sector mein sab se heavy single-payout dividend deta hai.',
    whyBuyReason: 'Toyota ki local hybrid manufacturing aur debt-free balance sheet company ko solid cash reserves faraham karti hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'ILP',
    name: 'Interloop Limited',
    sector: 'Textile',
    month: 'September',
    dividendType: 'Final Cash Dividend',
    expectedDividend: 2.50,
    expectedYield: '3.2%',
    approxExDate: 'Sep 25 - Oct 02',
    buyTimingTip: 'Sep 23 se pehle portfolio mein add karein.',
    whyBuyReason: 'Pakistan ka top textile apparel exporter hai jo Nike aur Adidas jaisay brands ko supply karta hai. Dollar export revenues se steady dividend payout.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },

  // --- OCTOBER (Q3 Calendar Year Heavyweights: Banks & Fertilizers) ---
  {
    symbol: 'FFC',
    name: 'Fauji Fertilizer Company',
    sector: 'Fertilizer',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    expectedDividend: 6.50,
    expectedYield: '4.2%',
    approxExDate: 'Oct 20 - Oct 27',
    buyTimingTip: 'Oct 18 se pehle buy karein. FFC har saal 4 dafa consistent quarterly dividend lazmi deta hai.',
    whyBuyReason: 'Pakistan ki fertilizer market leader hai. Agriculture demand aur urea off-take hamesha high rehta hai, jis se stable 90%+ profit payout hota hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'EFERT',
    name: 'Engro Fertilizers Limited',
    sector: 'Fertilizer',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    expectedDividend: 4.50,
    expectedYield: '3.6%',
    approxExDate: 'Oct 15 - Oct 22',
    buyTimingTip: 'Oct 13 tak position lein taake record date par cash dividend direct bank account mein transfer ho.',
    whyBuyReason: 'Modern production plants aur continuous gas efficiency ki wajah se high cash generation hai. Almost 100% earnings dividend mein baant-ti hai.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'MEBL',
    name: 'Meezan Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    expectedDividend: 7.50,
    expectedYield: '3.4%',
    approxExDate: 'Oct 18 - Oct 25',
    buyTimingTip: 'Oct 16 se pehle buy karein. Islamic banking growth ke sab se behtareen returns deta hai.',
    whyBuyReason: 'Pakistan ka No.1 Islamic Bank hai jiska Non-Performing Loans (NPL) ratio industry mein sab se kam hai. Phenomenal ROE aur shariah-compliant dividend payout.',
    shariahCompliant: true,
    safetyRating: 'VERY HIGH (AAA)'
  },
  {
    symbol: 'MCB',
    name: 'MCB Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    expectedDividend: 9.00,
    expectedYield: '4.4%',
    approxExDate: 'Oct 22 - Oct 29',
    buyTimingTip: 'Oct 20 tak holdings create karein taake ex-date par complete payout eligible ho.',
    whyBuyReason: 'Banking sector ka sab se safe aur high-capital adequacy wala bank hai. Har quarter regular aur heavy cash dividend deta hai.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'UBL',
    name: 'United Bank Limited',
    sector: 'Commercial Banks',
    month: 'October',
    dividendType: '3rd Interim Mega Dividend',
    expectedDividend: 11.00,
    expectedYield: '5.2%',
    approxExDate: 'Oct 24 - Oct 31',
    buyTimingTip: 'Oct 22 tak buy karein. UBL industry ka single highest dividend yield dene wala commercial bank hai.',
    whyBuyReason: 'Exceptional deposit franchise aur high treasury yields ki wajah se net interest income all-time peak par hai. Payout ratio 85%+ rehta hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'NESTLE',
    name: 'Nestle Pakistan Limited',
    sector: 'Textile & Consumer',
    month: 'October',
    dividendType: '3rd Interim Cash Dividend',
    expectedDividend: 80.00,
    expectedYield: '2.8%',
    approxExDate: 'Oct 16 - Oct 23',
    buyTimingTip: 'Oct 14 tak khareedein. Heavy price wala defensive blue-chip stock hai.',
    whyBuyReason: 'FMCG aur dairy foods mein unmatched market pricing power hai. Zero debt aur recession-proof business model.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },

  // --- NOVEMBER (Q1 FY Announcements & Payout Disbursements) ---
  {
    symbol: 'HUBC',
    name: 'The Hub Power Company (Q1)',
    sector: 'Power Generation',
    month: 'November',
    dividendType: '1st Interim Cash Dividend',
    expectedDividend: 4.00,
    expectedYield: '3.1%',
    approxExDate: 'Nov 12 - Nov 19',
    buyTimingTip: 'Nov 10 se pehle positions open karein.',
    whyBuyReason: 'Q1 FY results mein Thar energy dividends aur base plant return se regular quarterly income sustain hoti hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'AGP',
    name: 'AGP Limited',
    sector: 'Textile & Consumer',
    month: 'November',
    dividendType: 'Interim Cash Dividend',
    expectedDividend: 2.50,
    expectedYield: '2.9%',
    approxExDate: 'Nov 18 - Nov 25',
    buyTimingTip: 'Nov 16 tak buy karein.',
    whyBuyReason: 'Pharma market mein essential medicine portfolio aur steady institutional orders se consistent quarterly payout maintain karta hai.',
    shariahCompliant: true,
    safetyRating: 'MEDIUM'
  },
  {
    symbol: 'ABOT',
    name: 'Abbott Laboratories (Pakistan)',
    sector: 'Textile & Consumer',
    month: 'November',
    dividendType: 'Interim Cash Dividend',
    expectedDividend: 12.00,
    expectedYield: '2.4%',
    approxExDate: 'Nov 10 - Nov 17',
    buyTimingTip: 'Nov 08 tak purchase karein.',
    whyBuyReason: 'Global healthcare leader ka local arm hai jo high brand trust aur strong margins par operate karta hai.',
    shariahCompliant: false,
    safetyRating: 'HIGH'
  },

  // --- DECEMBER (Pre-Annual CY Closing & Year-End Accumulation) ---
  {
    symbol: 'COLG',
    name: 'Colgate-Palmolive (Pakistan)',
    sector: 'Textile & Consumer',
    month: 'December',
    dividendType: 'Interim / Special Cash Payout',
    expectedDividend: 25.00,
    expectedYield: '2.1%',
    approxExDate: 'Dec 15 - Dec 22',
    buyTimingTip: 'Dec 13 tak buy karein.',
    whyBuyReason: 'Zero debt consumer staples champion jo high return on capital (ROC) generate karta hai aur regular cash payout deta hai.',
    shariahCompliant: false,
    safetyRating: 'VERY HIGH'
  },
  {
    symbol: 'SYS',
    name: 'Systems Limited',
    sector: 'Textile & Consumer',
    month: 'December',
    dividendType: 'Pre-Year End Bonus / Cash Payout',
    expectedDividend: 6.00,
    expectedYield: '1.8%',
    approxExDate: 'Dec 18 - Dec 26',
    buyTimingTip: 'Dec 16 se pehle buy karein.',
    whyBuyReason: 'Pakistan ki No.1 IT export company hai with robust USD overseas revenue growth in Gulf and US markets.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
  },
  {
    symbol: 'FATIMA',
    name: 'Fatima Fertilizer Company',
    sector: 'Fertilizer',
    month: 'December',
    dividendType: 'Year-End Pre-Closing Payout',
    expectedDividend: 3.50,
    expectedYield: '6.5%',
    approxExDate: 'Dec 20 - Dec 28',
    buyTimingTip: 'Dec 18 tak buy karein.',
    whyBuyReason: 'High capacity utilization aur low cost gas allocation se zabardast dividend yield provide karta hai.',
    shariahCompliant: true,
    safetyRating: 'HIGH'
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
  'Textile & Consumer'
];

export default function DividendIntelligenceHub({ stocks = [], onSelectStock }) {
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyShariah, setOnlyShariah] = useState(false);

  // Calculator State
  const [calcSymbol, setCalcSymbol] = useState('FFC');
  const [calcShares, setCalcShares] = useState(2000);
  const [calcDividendPerShare, setCalcDividendPerShare] = useState(6.50);
  const [calcTaxRate, setCalcTaxRate] = useState(15); // 15% Filer, 30% Non-Filer
  const [calcBuyPrice, setCalcBuyPrice] = useState(155.00);

  // Auto-populate price from live stocks state
  const getLivePrice = (sym, defaultPrice = 120) => {
    const found = stocks.find(s => s.symbol.toUpperCase() === sym.toUpperCase());
    return found ? Number(found.currentPrice) : defaultPrice;
  };

  // Filtered List
  const filteredDividends = useMemo(() => {
    return UPCOMING_DIVIDEND_STOCKS.filter(item => {
      const matchMonth = selectedMonth === 'All Months' || item.month.toLowerCase() === selectedMonth.toLowerCase();
      const matchSector = selectedSector === 'All Sectors' || item.sector === selectedSector;
      const matchSearch = searchQuery === '' || 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchShariah = !onlyShariah || item.shariahCompliant;

      return matchMonth && matchSector && matchSearch && matchShariah;
    });
  }, [selectedMonth, selectedSector, searchQuery, onlyShariah]);

  // Handle Loading Stock into Calculator
  const handleLoadCalculator = (item) => {
    const liveP = getLivePrice(item.symbol, 100);
    setCalcSymbol(item.symbol);
    setCalcDividendPerShare(item.expectedDividend);
    setCalcBuyPrice(liveP);
    // Scroll smoothly to calculator
    const el = document.getElementById('dividend-calculator-box');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculator Outputs
  const totalInvestment = Number(calcShares) * Number(calcBuyPrice);
  const grossDividend = Number(calcShares) * Number(calcDividendPerShare);
  const taxAmount = grossDividend * (Number(calcTaxRate) / 100);
  const netDividendInBank = grossDividend - taxAmount;
  const singlePayoutYield = totalInvestment > 0 ? (netDividendInBank / totalInvestment) * 100 : 0;
  const estimatedAnnualYield = singlePayoutYield * 4; // Approx 4 quarterly payouts

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/25 shrink-0">
              <Coins className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  PSX Upcoming Dividends Intelligence Hub
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-sm">
                  SEP – DEC 2026 CALENDAR
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Explore month-wise & sector-wise dividend announcements, <b>2–3 din pehle buy karne ke timing rules</b>, fundamental profit rationales, aur interactive <b>Dividend Net Cash Calculator</b>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#070B12] px-4 py-2.5 rounded-2xl border border-gray-800 shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Dividend Season</span>
              <span className="font-extrabold text-amber-400 mono">Sep–Oct Peak Payouts</span>
            </div>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* 3 Pro Tips Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-800/80 text-xs">
          <div className="bg-[#070B12] p-3.5 rounded-2xl border border-gray-800/80 flex items-start space-x-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">T+2 Settlement Timing Rule:</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Dividend lene ke liye <b>Book Closure date se 2-3 din pehle</b> shares buy karein taake record date par holdings verify hon.
              </p>
            </div>
          </div>

          <div className="bg-[#070B12] p-3.5 rounded-2xl border border-gray-800/80 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Kion Buy Karna Chaye?</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Har company card ke andar detail likhi hai kion ye stock reliable cash generation aur dividend growth provide karta hai.
              </p>
            </div>
          </div>

          <div className="bg-[#070B12] p-3.5 rounded-2xl border border-gray-800/80 flex items-start space-x-2.5">
            <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Net Tax Calculation:</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Filer par <b>15% WHT</b> aur Non-Filer par <b>30% WHT</b> deduct ho kar direct aapke CDC linked bank account mein credit hota hai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Month-Wise & Sector-Wise Dynamic Filters */}
      <div className="bg-[#0D131F] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        {/* Month Selector Tabs */}
        <div>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">
            📅 Select Target Month:
          </span>
          <div className="flex flex-wrap gap-2">
            {MONTH_FILTERS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedMonth === m
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-[#070B12] text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700'
                }`}
              >
                {m === 'All Months' ? '🌐 All Months (Sep - Dec)' : `🗓️ ${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Sector & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-gray-800">
          {/* Sector Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-black uppercase text-gray-400 mr-1 hidden sm:inline">
              Sector:
            </span>
            {SECTOR_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSector(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSector === s
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-[#070B12] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search & Shariah Checkbox */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stock symbol..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#070B12] border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white uppercase mono placeholder-gray-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#070B12] border border-gray-800 text-xs font-bold text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyShariah}
                onChange={e => setOnlyShariah(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-emerald-400">🕌 Shariah Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Dividend Companies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Eligible Dividend Opportunities ({filteredDividends.length} Companies)</span>
          </h3>
          <span className="text-xs text-gray-400">Showing {selectedMonth} • {selectedSector}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDividends.map((item) => {
            const livePrice = getLivePrice(item.symbol, 120);

            return (
              <div
                key={`${item.month}-${item.symbol}`}
                className="bg-[#0D131F] border border-gray-800 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  {/* Top Row: Symbol, Name, Sector, Shariah Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span 
                          onClick={() => onSelectStock && onSelectStock(item.symbol)}
                          className="text-2xl font-black text-white mono cursor-pointer hover:text-cyan-400 transition-colors"
                        >
                          {item.symbol}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-black border border-amber-500/20">
                          {item.month}
                        </span>
                        {item.shariahCompliant && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                            KMI-30 Shariah
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">
                        {item.name} • <b className="text-gray-300">{item.sector}</b>
                      </p>
                    </div>

                    {/* Expected Dividend Badge */}
                    <div className="text-right shrink-0 bg-[#070B12] px-3.5 py-2 rounded-2xl border border-amber-500/30">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Expected Payout</span>
                      <span className="text-base font-black text-amber-400 mono">
                        PKR {item.expectedDividend.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        Yield: {item.expectedYield}
                      </span>
                    </div>
                  </div>

                  {/* Dividend Type & Live Price Matrix */}
                  <div className="grid grid-cols-2 gap-2 bg-[#070B12] p-2.5 rounded-2xl border border-gray-800/80 text-xs">
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 font-bold block">Announcement Type</span>
                      <span className="font-extrabold text-white text-[11px] truncate block">{item.dividendType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold block">Live Market Rate</span>
                      <span className="font-black text-cyan-400 mono text-sm">PKR {livePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 💡 "Kion Buy Karna Chaye?" Rationale */}
                  <div className="bg-gradient-to-r from-blue-950/30 to-cyan-950/20 border border-blue-800/30 p-3 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-cyan-300 font-black text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Kion Buy Karna Chaye? (Fundamental Reason)</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {item.whyBuyReason}
                    </p>
                  </div>

                  {/* ⏰ "2-3 Din Pehle Buy Karne Ka Tareeqa" Timing Tip */}
                  <div className="bg-gradient-to-r from-amber-950/30 to-yellow-950/20 border border-amber-800/40 p-3 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-black text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Buy Timing Rule (Approx Ex-Date: {item.approxExDate}):</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {item.buyTimingTip}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Actions: Calculate Net Profit & Technical Chart */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-800/80">
                  <button
                    onClick={() => handleLoadCalculator(item)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:opacity-90 text-black font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Calculate My Dividend</span>
                  </button>

                  <button
                    onClick={() => onSelectStock && onSelectStock(item.symbol)}
                    className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    title="Open Technical Chart & Fundamentals"
                  >
                    <span>View Intel</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Dividend Profit & Tax Calculator Tool */}
      <div id="dividend-calculator-box" className="bg-gradient-to-b from-[#0F172A] via-[#0D131F] to-[#070B12] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Interactive PSX Dividend Profit & Net Cash Calculator</h3>
            <p className="text-xs text-gray-400">Calculate exact cash dividends deposited into your bank account after 15% (Filer) or 30% (Non-Filer) Withholding Tax.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-bold mb-1 uppercase text-[11px]">Selected Stock Symbol:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={calcSymbol}
                  onChange={e => setCalcSymbol(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-black mono text-sm uppercase focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1 uppercase text-[11px]">Quantity (Shares):</label>
                <input
                  type="number"
                  min="1"
                  value={calcShares}
                  onChange={e => setCalcShares(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 uppercase text-[11px]">Expected Div/Share (PKR):</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcDividendPerShare}
                  onChange={e => setCalcDividendPerShare(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-amber-400 font-black mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1 uppercase text-[11px]">Share Buy Price (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcBuyPrice}
                  onChange={e => setCalcBuyPrice(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 uppercase text-[11px]">Tax Status (FBR WHT):</label>
                <select
                  value={calcTaxRate}
                  onChange={e => setCalcTaxRate(Number(e.target.value))}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                >
                  <option value={15}>Active Filer (15% Tax)</option>
                  <option value={30}>Non-Filer (30% Tax)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Outputs Column */}
          <div className="lg:col-span-7 bg-[#070B12] p-5 rounded-3xl border border-gray-800/90 flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Total Capital Outlay ({calcShares} shares @ PKR {calcBuyPrice}):</span>
                <span className="font-bold text-white mono text-sm">
                  PKR {totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-400">
                <span>Gross Expected Dividend ({calcShares} × PKR {calcDividendPerShare}):</span>
                <span className="font-bold text-amber-400 mono text-sm">
                  PKR {grossDividend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-400">
                <span>Withholding Tax Deduction ({calcTaxRate}%):</span>
                <span className="font-bold text-rose-400 mono text-sm">
                  - PKR {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-black text-emerald-400 block">Net Bank Account Credit 💰</span>
                  <span className="text-[10px] text-gray-400">Directly transferred through CDC E-Dividend</span>
                </div>
                <span className="text-2xl font-black text-emerald-400 mono">
                  PKR {netDividendInBank.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Yield Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800/80">
              <div className="bg-[#0D131F] p-3 rounded-2xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Single Payout Net Yield</span>
                <span className="text-base font-black text-cyan-400 mono mt-0.5 block">
                  {singlePayoutYield.toFixed(2)}%
                </span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-2xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Estimated Annualized Yield (4x)</span>
                <span className="text-base font-black text-amber-400 mono mt-0.5 block">
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
