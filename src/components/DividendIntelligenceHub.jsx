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
  Calendar
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

  const getLivePrice = (sym, defaultPrice = 120) => {
    const found = stocks.find(s => s.symbol.toUpperCase() === sym.toUpperCase());
    return found ? Number(found.currentPrice) : defaultPrice;
  };

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

  const handleLoadCalculator = (item) => {
    const liveP = getLivePrice(item.symbol, 100);
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
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  PSX Upcoming Dividends Intelligence Hub
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black">
                  SEP – DEC 2026 CALENDAR
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Explore month-wise & sector-wise dividend announcements, <b>2–3 din pehle buy karne ke timing rules</b>, fundamental profit rationales, aur interactive <b>Dividend Net Cash Calculator</b>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#F8FAFC] dark:bg-[#0B0F19] px-4 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Current Dividend Season</span>
              <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono">Sep–Oct Peak Payouts</span>
            </div>
            <Sparkles className="w-5 h-5 text-[#D97706] dark:text-[#F59E0B] animate-pulse" />
          </div>
        </div>

        {/* 3 Pro Tips Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#243044] text-xs">
          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">T+2 Settlement Timing Rule:</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Dividend lene ke liye <b>Book Closure date se 2-3 din pehle</b> shares buy karein taake record date par holdings verify hon.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Kion Buy Karna Chaye?</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Har company card ke andar detail likhi hai kion ye stock reliable cash generation aur dividend growth provide karta hai.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2.5">
            <Calculator className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Net Tax Calculation:</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Filer par <b>15% WHT</b> aur Non-Filer par <b>30% WHT</b> deduct ho kar direct aapke CDC linked bank account mein credit hota hai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Month-Wise & Sector-Wise Dynamic Filters */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md space-y-4">
        {/* Month Selector Tabs */}
        <div>
          <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] tracking-wider block mb-2">
            📅 Select Target Month:
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
                {m === 'All Months' ? '🌐 All Months (Sep - Dec)' : `🗓️ ${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Sector & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
          {/* Sector Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mr-1 hidden sm:inline">
              Sector:
            </span>
            {SECTOR_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSector(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSector === s
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search & Shariah Checkbox */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stock symbol..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={onlyShariah}
                onChange={e => setOnlyShariah(e.target.checked)}
                className="rounded accent-[#16A34A] dark:accent-[#22C55E] cursor-pointer"
              />
              <span className="text-[#16A34A] dark:text-[#22C55E]">🕌 Shariah Only</span>
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
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Showing {selectedMonth} • {selectedSector}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDividends.map((item) => {
            const livePrice = getLivePrice(item.symbol, 120);

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
                        >
                          {item.symbol}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] text-[10px] font-bold border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{item.month}</span>
                        </span>
                        {item.shariahCompliant && (
                          <span className="px-2 py-0.5 rounded-md bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] text-[10px] font-bold border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                            🕌 KMI-30
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 truncate max-w-[280px]">
                        {item.name} • <b className="text-[#0F172A] dark:text-[#F8FAFC]">{item.sector}</b>
                      </p>
                    </div>

                    {/* Enhanced Expected Dividend Floating Badge */}
                    <div className="text-right shrink-0 bg-[#F8FAFC] dark:bg-[#0B0F19] px-3.5 py-2 rounded-lg border border-[#D97706]/30 dark:border-[#F59E0B]/30 shadow-xs">
                      <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Expected Payout</span>
                      <span className="text-lg font-black text-[#D97706] dark:text-[#F59E0B] mono block mt-0.5">
                        PKR {item.expectedDividend.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] font-bold block mt-0.5">
                        +{item.expectedYield} Yield
                      </span>
                    </div>
                  </div>

                  {/* Announcement & Live Rate Grid */}
                  <div className="grid grid-cols-2 gap-2.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs">
                    <div>
                      <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Announcement Type</span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-[11px] truncate block mt-0.5">{item.dividendType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#3B82F6] font-bold block">Live Market Rate</span>
                      <span className="font-black text-[#2563EB] dark:text-[#3B82F6] mono text-sm block mt-0.5">PKR {livePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 💡 "Kion Buy Karna Chaye?" Rationale */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 p-3 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-[#2563EB] dark:text-[#3B82F6] font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Kion Buy Karna Chaye? (Fundamental Reason)</span>
                    </div>
                    <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                      {item.whyBuyReason}
                    </p>
                  </div>

                  {/* ⏰ "2-3 Din Pehle Buy Karne Ka Tareeqa" Timing Tip */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#D97706]/30 dark:border-[#F59E0B]/30 p-3 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-[#D97706] dark:text-[#F59E0B] font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Buy Timing Rule (Approx Ex-Date: {item.approxExDate}):</span>
                    </div>
                    <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                      {item.buyTimingTip}
                    </p>
                  </div>
                </div>

                {/* Compact, Sleek & Elegant Action Buttons */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-[#243044]">
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#22C55E] inline-block animate-pulse"></span>
                    <span className="font-medium">Active Announcement</span>
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
                  onChange={e => setCalcSymbol(e.target.value.toUpperCase())}
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
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
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
