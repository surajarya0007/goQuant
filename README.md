
# Real-Time Crypto Order Book Dashboard

A Next.js dashboard that streams real-time cryptocurrency order book data—bids, asks, bid-ask spread, volume imbalance, and market depth—from a public API. It features an intuitive, responsive UI with components for the order book, spread and imbalance indicators, a depth chart, and a trading-pair selector. Designed as a coding assignment, it showcases live data fetching, processing, and visualization across desktop and mobile.


## Installation

**Prerequisites**
- Node.js (v16 or later)
- npm package manager

**Running Locally**

*Clone the repo*

    git clone https://github.com/surajarya0007/goQuant.git

    cd goQuant

*Install dependencies*

    npm install

*Start development server*

    npm run dev

*Open this link in browser application*

    http://localhost:3000


## File Structure

├── pages/  
│   ├── index.js               # Main dashboard  
│   └── _app.js                # Global App config  
├── components/  
│   ├── OrderBookTable.jsx  
│   ├── SpreadIndicator.jsx  
│   ├── ImbalanceIndicator.jsx  
│   ├── DepthChart.jsx  
│   └── TradingPairSelector.jsx  
├── hooks/  
│   └── useOrderbook.js        # Fetches/subscribes to order book  
├── styles/  
│   └── globals.css  
├── utils/                     # Formatting, summing, etc.  
├── public/                    # Static assets  
├── .env.local.example  
├── package.json  
└── README.md                  # ← You are here  


## Features

**1. Real-time Order Book**  
   - Live bid & ask orders in a continuously-updating table  
   - Highlights the best bid and best ask at the top

**2. Spread Indicator**  
   - Calculates **best ask – best bid**  
   - Displays numeric spread for quick market-tightness insight

**3. Imbalance Indicator**  
   - Computes relative difference between total bid vs. ask volume  
   - Positive → buy-side pressure, Negative → sell-side pressure

**4. Market Depth Chart**  
   - Plots cumulative bid & ask volumes per price level  
   - Visualizes liquidity and order stacking

**5. Trading Pair Selector**  
   - Dropdown to switch between pairs (e.g., BTC/USD, ETH/USD)  
   - Reloads feed for selected market

**6. Responsive Design**  
   - Stacks or resizes components on mobile for readability

**7. Live Data Feed**  
   - Integrates with public exchange API (e.g., Binance) via WebSockets or polling


## Libraries & Tools

- **Next.js & React** – Framework & UI  
- **react-chartjs-2 (Chart.js)** – Market depth charting  
- **WebSocket API / Axios** – Real-time & RESTful data fetching  
- **Tailwind CSS / styled-components** – Styling & responsive layout  
- **Lodash** – Utility functions (formatting, summing)  
- **React Hooks** – State & side-effect management  


## Assumptions

- **Public Data Feed**: No user authentication or API key is required for the public data used in this demo..  
- **Single Pair Focus**: One trading pair at a time; switches reconnect feed.  
- **Fixed Depth**: Top 10 bids/asks for performance & clarity.  
- **Calculation Methods**:  
  - Spread = `bestAsk – bestBid`  
  - Imbalance = `(totalBuyVolume – totalSellVolume)/(totalBuyVolume + totalSellVolume)` or as a percentage  
- **Responsive Layout**: Vertical stacking on narrow screens.  
- **Static Demo**: It does not support actual trading or saving state. It also assumes stable network connectivity and does minimal error handling.


## Future Enhancements

- More Pairs: Predefined or user-entered trading pairs

- Historical Charts: Candlestick or line charts

- Additional Indicators: MA, RSI, VWAP, etc.

- Simulated Trading: Connect to a testnet for mock orders

- Performance: Virtualized lists/incremental loading for deep order books
