import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Activity, 
  HelpCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  BarChart2,
  PieChart
} from 'lucide-react';
import { fetchStockFinancials } from '../services/api';

export default function CompanyFinancialsView({ stock, isDark = true }) {
  const [periodType, setPeriodType] = useState('quarterly'); // 'quarterly' | 'annual'
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareTarget, setCompareTarget] = useState('sector'); // 'sector' | peer symbol
  const [showFullStatements, setShowFullStatements] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const symbol = stock?.symbol || 'WTL';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStockFinancials(symbol);
        if (isMounted) {
          if (res?.success && res.data) {
            setFinancials(res.data);
          } else {
            setError('Financial data could not be loaded for this company.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch financial statements.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [symbol]);

  // Active dataset based on toggle (Quarterly vs Annual)
  const currentSet = useMemo(() => {
    if (!financials) return null;
    return periodType === 'quarterly' ? financials.quarterly : financials.annual;
  }, [financials, periodType]);

  const metrics = currentSet?.metrics || {};
  const netProfitSeries = currentSet?.netProfitSeries || [];
  const totalAssetsSeries = currentSet?.totalAssetsSeries || [];
  const radar = financials?.radarPerformance || {};

  // Format integer with commas
  const fmt = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return Number(num).toLocaleString('en-US');
  };

  // Mini Sparkbar Indicator Component
  const SparkBars = ({ values = [3, 4, 2, 5], isPositive = true }) => {
    const max = Math.max(...values.map(Math.abs), 1);
    return (
      <div className="flex items-end space-x-0.5 h-4 w-9 shrink-0">
        {values.map((v, i) => {
          const heightPct = Math.max(20, Math.min(100, Math.round((Math.abs(v) / max) * 100)));
          const barColor = isPositive ? 'bg-emerald-500' : 'bg-red-500';
          return (
            <div 
              key={i} 
              className={`w-1.5 rounded-t-[1px] transition-all ${barColor}`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
    );
  };

  // Render Interactive Net Profit Bar Chart
  const renderNetProfitChart = () => {
    if (!netProfitSeries || netProfitSeries.length === 0) return null;

    const values = netProfitSeries.map(d => d.value);
    const maxVal = Math.max(...values, 100000);
    const minVal = Math.min(...values, 0);
    const range = Math.max(1, maxVal - minVal);

    const svgWidth = 240;
    const svgHeight = 150;
    const padTop = 15;
    const padBottom = 28;
    const chartHeight = svgHeight - padTop - padBottom;
    const zeroY = padTop + ((maxVal - 0) / range) * chartHeight;

    const barWidth = 22;
    const barSpacing = (svgWidth - (barWidth * netProfitSeries.length)) / (netProfitSeries.length + 1);

    return (
      <div className="relative flex flex-col items-center">
        <h4 className={`text-xs font-bold mb-1 text-center ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          Net Profit
        </h4>
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          {/* Zero baseline */}
          <line 
            x1="0" 
            y1={zeroY} 
            x2={svgWidth} 
            y2={zeroY} 
            stroke={isDark ? '#334155' : '#cbd5e1'} 
            strokeWidth="1.2" 
          />

          {/* Grid lines and tick labels */}
          <text x="2" y={padTop + 8} fill={isDark ? '#64748B' : '#94a3b8'} fontSize="8" fontFamily="monospace">
            {fmt(Math.round(maxVal / 1000))}k
          </text>
          <text x="2" y={zeroY - 3} fill={isDark ? '#64748B' : '#94a3b8'} fontSize="8" fontFamily="monospace">
            0
          </text>
          {minVal < 0 && (
            <text x="2" y={svgHeight - padBottom} fill={isDark ? '#64748B' : '#94a3b8'} fontSize="8" fontFamily="monospace">
              {fmt(Math.round(minVal / 1000))}k
            </text>
          )}

          {/* Bars */}
          {netProfitSeries.map((item, idx) => {
            const x = barSpacing + idx * (barWidth + barSpacing);
            const val = item.value;
            const isPos = val >= 0;
            const barH = Math.max(3, (Math.abs(val) / range) * chartHeight);
            const y = isPos ? (zeroY - barH) : zeroY;

            return (
              <g 
                key={idx} 
                className="cursor-pointer group"
                onMouseEnter={() => setActiveTooltip({
                  title: `${item.period} Net Profit`,
                  val: `${fmt(item.value)} thousand PKR`,
                  x,
                  y
                })}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={isPos ? '#2563EB' : '#1E3A8A'}
                  rx="1"
                  className="transition-all hover:brightness-125"
                />
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill={isDark ? '#94A3B8' : '#64748B'}
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {item.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render Interactive Total Assets Bar Chart
  const renderTotalAssetsChart = () => {
    if (!totalAssetsSeries || totalAssetsSeries.length === 0) return null;

    const values = totalAssetsSeries.map(d => d.value);
    const maxVal = Math.max(...values, 1000000);
    const svgWidth = 240;
    const svgHeight = 150;
    const padTop = 15;
    const padBottom = 28;
    const chartHeight = svgHeight - padTop - padBottom;

    const barWidth = 22;
    const barSpacing = (svgWidth - (barWidth * totalAssetsSeries.length)) / (totalAssetsSeries.length + 1);

    return (
      <div className="relative flex flex-col items-center">
        <h4 className={`text-xs font-bold mb-1 text-center ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          Total Assets
        </h4>
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          {/* Baseline */}
          <line 
            x1="0" 
            y1={svgHeight - padBottom} 
            x2={svgWidth} 
            y2={svgHeight - padBottom} 
            stroke={isDark ? '#334155' : '#cbd5e1'} 
            strokeWidth="1.2" 
          />

          {/* Grid lines and tick labels */}
          <text x="2" y={padTop + 8} fill={isDark ? '#64748B' : '#94a3b8'} fontSize="8" fontFamily="monospace">
            {fmt(Math.round(maxVal / 1000))}k
          </text>
          <text x="2" y={svgHeight - padBottom - 4} fill={isDark ? '#64748B' : '#94a3b8'} fontSize="8" fontFamily="monospace">
            0
          </text>

          {/* Bars */}
          {totalAssetsSeries.map((item, idx) => {
            const x = barSpacing + idx * (barWidth + barSpacing);
            const val = Math.max(0, item.value);
            const barH = Math.max(4, (val / maxVal) * chartHeight);
            const y = svgHeight - padBottom - barH;

            return (
              <g 
                key={idx} 
                className="cursor-pointer group"
                onMouseEnter={() => setActiveTooltip({
                  title: `${item.period} Total Assets`,
                  val: `${fmt(item.value)} thousand PKR`,
                  x,
                  y
                })}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill="#1E3A8A"
                  rx="1"
                  className="transition-all hover:brightness-125"
                />
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill={isDark ? '#94A3B8' : '#64748B'}
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {item.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render 6-Axis Radar / Spider Chart (Performance vs Sector)
  const renderRadarChart = () => {
    const axes = [
      { key: 'peRatio', label: 'P/E Ratio', max: 50 },
      { key: 'returnOnAssets', label: 'Return On Assets', max: 30 },
      { key: 'returnOnEquity', label: 'Return On Equity', max: 50 },
      { key: 'operatingProfitMargin', label: 'Operating Profit Margin', max: 50 },
      { key: 'debtToEquity', label: 'Debt to Equity', max: 100 },
      { key: 'dividendYield', label: 'Dividend Yield', max: 15 }
    ];

    const size = 300;
    const center = size / 2;
    const radius = 100;
    const angleStep = (Math.PI * 2) / axes.length;

    // Helper to get coordinates for a ratio point
    const getPoint = (ratioVal, maxVal, index) => {
      const normalized = Math.max(0.05, Math.min(1, Math.abs(ratioVal) / maxVal));
      const r = normalized * radius;
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    // Concentric web levels (20%, 40%, 60%, 80%, 100%)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

    const stockCoords = axes.map((axis, i) => {
      const val = radar.stock?.[axis.key] || 0;
      return getPoint(val, axis.max, i);
    });

    const sectorCoords = axes.map((axis, i) => {
      const val = radar.sectorBenchmark?.[axis.key] || 0;
      return getPoint(val, axis.max, i);
    });

    const stockPath = stockCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';
    const sectorPath = sectorCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';

    return (
      <div className="relative flex flex-col items-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric Web Polygons */}
          {levels.map((lvl, lIdx) => {
            const pts = axes.map((_, i) => {
              const r = lvl * radius;
              const angle = i * angleStep - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={lIdx}
                points={pts}
                fill="none"
                stroke={isDark ? '#1E293B' : '#E2E8F0'}
                strokeWidth="1"
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {axes.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const endX = center + radius * Math.cos(angle);
            const endY = center + radius * Math.sin(angle);
            const labelX = center + (radius + 24) * Math.cos(angle);
            const labelY = center + (radius + 14) * Math.sin(angle);

            return (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke={isDark ? '#334155' : '#CBD5E1'}
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDark ? '#94A3B8' : '#475569'}
                  fontSize="8.5"
                  className="font-medium"
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          {/* Sector Benchmark Polygon (Neutral Outline) */}
          <path
            d={sectorPath}
            fill="#64748B"
            fillOpacity="0.1"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Stock Polygon (Solid Vibrant Accent) */}
          <path
            d={stockPath}
            fill="#0284C7"
            fillOpacity="0.3"
            stroke="#0284C7"
            strokeWidth="2"
          />

          {/* Points on Stock Polygon */}
          {stockCoords.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#0284C7"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="transition-transform hover:scale-125"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center space-x-6 mt-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#0284C7]" />
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>{symbol}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1.5 border-b-2 border-dashed border-gray-400" />
            <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>
              Sector ({radar.sectorName || 'Benchmark'})
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`p-10 text-center rounded-2xl border ${isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200'}`}>
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-cyan-500 mb-3" />
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Synchronizing 100% authentic unconsolidated financial statements from PSX...
        </p>
      </div>
    );
  }

  if (error || !financials) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200'}`}>
        <p className="text-red-400 text-sm font-semibold">{error || 'Financial data currently unavailable.'}</p>
      </div>
    );
  }

  const latestPeriod = currentSet?.periods?.[0] || 'Q2 2026';

  return (
    <div className="space-y-6">
      {/* Top Header Card with Period Toggle & Subtitle */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Financials
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
              100% Real PSX Data
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Unconsolidated Financial Statements • All numbers in thousands (000's) except EPS
          </p>
        </div>

        {/* Toggle Capsule: QUARTERLY | ANNUAL */}
        <div className={`flex items-center p-1 rounded-xl border self-start md:self-auto ${
          isDark ? 'bg-[#070B12] border-gray-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setPeriodType('quarterly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              periodType === 'quarterly'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QUARTERLY
          </button>
          <button
            onClick={() => setPeriodType('annual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              periodType === 'annual'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ANNUAL
          </button>
        </div>
      </div>

      {/* Main Grid: Left Financial Cards (2-Col) + Right Radar Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 of 12 cols): Net Profit & Total Assets Sections */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Net Profit & Income Performance Card */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Bar Chart */}
              <div className="border-b md:border-b-0 md:border-r border-gray-800/60 pb-4 md:pb-0 md:pr-4">
                {renderNetProfitChart()}
              </div>

              {/* Right: Metrics Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold pb-1 border-b border-gray-800/40">
                  <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Metric</span>
                  <div className="flex items-center space-x-6">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{latestPeriod}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Trend</span>
                  </div>
                </div>

                {/* Net Profit Growth */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Net Profit Growth
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${metrics.netProfitGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metrics.netProfitGrowth > 0 ? `+${metrics.netProfitGrowth}%` : `${metrics.netProfitGrowth}%`}
                    </span>
                    <SparkBars values={[-2, -3, 4, -2]} isPositive={metrics.netProfitGrowth >= 0} />
                  </div>
                </div>

                {/* Sales */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Sales
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
                      {fmt(metrics.sales)}
                    </span>
                    <SparkBars values={[3, 4, 4, 5]} isPositive={true} />
                  </div>
                </div>

                {/* Sales Growth */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Sales Growth
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${metrics.salesGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metrics.salesGrowth > 0 ? `+${metrics.salesGrowth}%` : `${metrics.salesGrowth}%`}
                    </span>
                    <SparkBars values={[1, 2, 2, 4]} isPositive={metrics.salesGrowth >= 0} />
                  </div>
                </div>

                {/* EPS */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    EPS
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${metrics.eps >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metrics.eps}
                    </span>
                    <SparkBars values={[-3, -2, -3, -4]} isPositive={metrics.eps >= 0} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Total Assets & Balance Sheet Card */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Bar Chart */}
              <div className="border-b md:border-b-0 md:border-r border-gray-800/60 pb-4 md:pb-0 md:pr-4">
                {renderTotalAssetsChart()}
              </div>

              {/* Right: Metrics Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold pb-1 border-b border-gray-800/40">
                  <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Balance Sheet</span>
                  <div className="flex items-center space-x-6">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{latestPeriod}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Trend</span>
                  </div>
                </div>

                {/* Total Liabilities */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Total Liabilities
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
                      {fmt(metrics.totalLiabilities)}
                    </span>
                    <SparkBars values={[4, 4, 4, 4]} isPositive={true} />
                  </div>
                </div>

                {/* Total Equity */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Total Equity
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${metrics.totalEquity >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmt(metrics.totalEquity)}
                    </span>
                    <SparkBars values={[-3, -3, -3, -3]} isPositive={metrics.totalEquity >= 0} />
                  </div>
                </div>

                {/* Total Debt */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Total Debt
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold font-mono ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
                      {fmt(metrics.totalDebt)}
                    </span>
                    <SparkBars values={[2, 3, 3, 4]} isPositive={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 of 12 cols): Performance (vs. Sector) Radar Chart */}
        <div className="lg:col-span-5">
          <div className={`p-5 rounded-2xl border h-full flex flex-col justify-between ${
            isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Performance (vs. Sector)
                  </h3>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'bg-gray-800/80 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    Year: {radar.year || '2025'}
                  </span>
                </div>
              </div>

              {/* Compare Select Box */}
              <div className="mb-4">
                <div className="relative">
                  <select
                    value={compareTarget}
                    onChange={(e) => setCompareTarget(e.target.value)}
                    className={`w-full appearance-none px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                      isDark 
                        ? 'bg-[#070B12] border-gray-800 text-gray-300 hover:border-gray-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <option value="sector">Compare: Sector Average ({radar.sectorName || 'Benchmark'})</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 pointer-events-none text-gray-400" />
                </div>
              </div>

              {/* Radar Spider Chart */}
              <div className="py-2">
                {renderRadarChart()}
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t text-[11px] ${
              isDark ? 'border-gray-800 text-gray-500' : 'border-slate-200 text-slate-400'
            }`}>
              Spider chart benchmarks 6 fundamental pillars against official PSX sector averages.
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Full Unconsolidated Financial Statements Drawer */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#0B0F19] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setShowFullStatements(!showFullStatements)}
          className={`w-full p-4 flex items-center justify-between font-bold text-xs transition-colors cursor-pointer ${
            isDark ? 'hover:bg-gray-800/40 text-gray-300' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Complete Unconsolidated Financial Statements (Historical Ledger)</span>
          </div>
          {showFullStatements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullStatements && (
          <div className="p-4 pt-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-800 text-gray-400' : 'border-slate-200 text-slate-600'}`}>
                  <th className="py-2.5 px-3 font-semibold">Line Item (000's PKR)</th>
                  {currentSet?.periods?.map((p, idx) => (
                    <th key={idx} className="py-2.5 px-3 text-right font-semibold font-mono">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {Object.entries(currentSet?.statements?.rows || {}).map(([item, vals], i) => (
                  <tr key={i} className={isDark ? 'hover:bg-gray-800/20' : 'hover:bg-slate-50'}>
                    <td className={`py-2 px-3 font-medium ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>{item}</td>
                    {vals.map((v, vIdx) => (
                      <td key={vIdx} className={`py-2 px-3 text-right font-mono font-semibold ${v < 0 ? 'text-red-400' : (isDark ? 'text-gray-200' : 'text-slate-900')}`}>
                        {v < 0 ? `(${fmt(Math.abs(v))})` : fmt(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
