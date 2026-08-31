# 💻 PSX Stockking - Real-Time Financial Intelligence Terminal & AI Exit Advisor (Frontend)

Modern, ultra-fast React + Vite + Tailwind CSS financial terminal built for the **Pakistan Stock Exchange (PSX)**. Features live KSE-100 ticker tape, 39-sector performance heatmap, multi-sector breaking news hub with UP/DOWN stock catalysts, full 763 listed equity screener with pagination, and interactive portfolio tracker with live P&L and Google Gemini AI exit tips.

---

## 🌟 Key Frontend Features

1. **⚡ Live News Catalyst & Trade Hub (`NewsCatalystTradeHub.jsx`):**
   - Minute-by-minute live news feeds from Dawn, Business Recorder, and Tribune.
   - Dedicated sub-sections for every news article:
     - 🟢 **Stocks Expected To Go UP (Bullish Buy Targets):** Entry Buy Zone, Target Sell Price, Volume Surge, Expected Gain %.
     - 🔴 **Stocks Expected To Go DOWN (Bearish Downside Warnings):** Strict Stop Loss, Downside Risk %, Trade Rationale.

2. **💼 My Portfolio & Live AI Exit Advisor (`PortfolioAdvisor.jsx`):**
   - Real-time Profit & Loss (P&L) telemetry comparing your entry buy rate with live PSX DPS market prices.
   - **Today's Market Move (Day P&L):** Calculates day gain/loss for every holding.
   - **Interactive Edit Buy Rate Modal:** Update buy price or quantity in 1 second.
   - **AI Smart Tips Card:** Exact **Kab Sell Karna Hai (Target Price)**, **Trailing Stop Loss**, and **News Catalyst Impact**.

3. **📊 Full 763 PSX Listed Universe Screener (`StockScreenerTable.jsx`):**
   - Instant search across all 763 listed companies.
   - 39 PSX Sector dropdown filters.
   - Configurable pagination (25, 50, 100, 250, All).

4. **🏛️ Real-Time PSX Market Session Banner:**
   - Pre-market / Market Closed (`🔒 OFFICIAL CLOSING RATES`) vs Live Session (`🟢 LIVE SESSION 09:30 - 15:30 PKT`).

---

## 🚀 Getting Started

### 1. Installation
```bash
cd client
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Branded Ticker Tape & Market Session Badge
│   │   ├── MarketHero.jsx           # KSE-100 Cards & 39 Sector Performance Heatmap
│   │   ├── NewsCatalystTradeHub.jsx # Multi-Sector News Feed with UP/DOWN Catalysts
│   │   ├── PortfolioAdvisor.jsx     # Live P&L Portfolio Tracker & AI Exit Tips Hub
│   │   ├── DailyRecommendations.jsx # Quant Swing Trade Ideas (Target 1, Target 2, SL)
│   │   ├── StockScreenerTable.jsx   # 763 Companies Screener with Sector Filters
│   │   ├── StockDetailModal.jsx     # OHLCV Chart, Technicals, Pivot Points
│   │   ├── PositionSizeModal.jsx    # 1-Click Order Execution Planner
│   │   └── WatchlistDrawer.jsx      # Slide-out Saved Tickers Drawer
│   ├── services/
│   │   └── api.js                   # Axios REST API Client
│   ├── App.jsx                      # Global State & Auto-Refresh Controller
│   ├── index.css                    # Tailwind CSS & Custom Trading Terminal Styles
│   └── main.jsx                     # Vite React Entrypoint
├── package.json
├── vite.config.js
└── README.md
```