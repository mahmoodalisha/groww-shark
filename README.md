# Groww Shark 🦈  
A Modern Finance Dashboard builder

Groww Shark is a full-featured finance dashboard builder built with **Next.js (App Router)**, **Redux Toolkit**, and **modern charting libraries**.  
It supports **real-time market data**, **watchlists**, **widgets**, **advanced search**, and **interactive charts (line & candlestick)** using real APIs no hard-coded data.

---

## 🚀 Features Overview

### 🔹 Market Coverage
* Indices  → Alpha Vantage API
* Crypto → CoinRanking API (RapidAPI)
* Stocks  → Alpha Vantage API
* Futures  → Alpha Vantage API
* Forex  → Alpha Vantage API
* F&O  → Alpha Vantage API

### 🔹 Live Market Data
* **Stocks / Indices / Forex** → Alpha Vantage API
* **Crypto** → CoinRanking API (RapidAPI)
* No hard-coded prices — all data is fetched live

### 🔹 UI & UX
* Color-coded price changes (Green ↑ / Red ↓)
* Expandable market categories with smooth animations
* Loading states while fetching data
* Responsive layout with dark theme

---

## 📁 Project Structure

```
groww-shark/
│
├── public/
│
├── src/
│
│   ├── app/
│   │   ├── layout.js                    # App shell + BottomNav
│   │   ├── providers.js                 # Redux provider
│   │   ├── globals.css                  # Soft dark theme only
│   │   ├── page.js                      # Default → widgets
│   │
│   │   ├── watchlist/
│   │   │   ├── page.js                  # Market watch table
│   │   │   ├── ViewWatchlistModal.js
│   │   │   └── CreateWatchlistModal.js
│   │
│   │   ├── chart/                       #  FULL SCREEN CHART
│   │   │   ├── page.js                  # Chart page (symbol-based)
│   │   │   ├── ChartHeader.js           # Name, price, interval selector
│   │
│   │   ├── widgets/
│   │   │   ├── page.js                  # Widget grid (default page)
│   │   │   └── AddWidgetModal.js
│   │
│   │   ├── explore/
│   │   │   └── page.js
│   │
│   │   ├── community/
│   │   │   └── page.js
│   │
│   │   ├── menu/
│   │   │   └── page.js
│   │
│   │   └── api/
│   │       └── proxy/
│   │           ├── route.js              # Snapshot + router
│   │           └── history/
│   │               ├── alpha
│   │                   └── route.js
│
│   ├── components/
│   │   ├── BottomNav.js
│   │   ├── WidgetCard.js                 # card / table / chart
│
│   ├── charts/                           #  CHART ENGINE
│   │   ├── ChartRenderer.js              # Chart.js wrapper
│   │   ├── CandleChart.js
│   │
│
│   ├── store/
│   │   ├── index.js                      # configureStore
│   │   ├── watchlistSlice.js
│   │   ├── marketDataSlice.js            # snapshot only
│   │   └── widgetsSlice.js
│
│   ├── lib/
│   │   ├── fetchers/
│   │   │   ├── snapshotFetcher.js        # watchlist/widgets prices
│   │   │   ├── historyFetcher.js         # charts history only
│   │   │   └── cache.js                  # shared cache helper
│   │   │
│   │   ├── normalizers/
│   │   │   ├── stockHistory.js           # Alpha → chart data
│   │   │   ├── cryptoHistory.js          # CoinRanking → chart data
│   │   │   └── cryptoNormalizer.js       # CoinRanking → snapshot
│   │   │
│
├── .env.local
├── package.json
└── README.md

```


---

## 📊 Market Data Architecture

### Snapshot Data (Prices, % Change)
* Fetched via `/api/proxy`
* Uses **Alpha Vantage GLOBAL_QUOTE**
* Cached for 5 minutes at the **server level**
* Stored in Redux (`marketDataSlice`) for UI rendering

### Historical Data (Candlestick Charts)
* Fetched via `/api/proxy/history/alpha`
* Uses **Alpha Vantage TIME_SERIES_DAILY**
* Loaded **only when switching to candlestick view**

---

## 📈 Chart System

### Line Chart
* Uses cached snapshot data
* No additional API calls
* Rendered via `ChartRenderer.js` (Chart.js wrapper)

### Candlestick Chart
* Uses **Lightweight Charts v5**
* Fetches OHLC data only when needed
* Fully interactive (zoom, pan, crosshair)

---

## ⭐ Watchlist Dashboard

### Supported Features
* Multiple watchlists
* Active watchlist switching
* Add / remove instruments
* Delete watchlists
* UI flags for modals

### Watchlist Creating Modal
* Opens when isCreatingWatchlist === true
* Contains: Input (watchlist name)
* Create / Cancel buttons
* Watchlist buttons
* Rendered from state.watchlist.watchlists
* Clicking → setActiveWatchlist(id)

### User actions
* User clicks + Create Watchlist, a modal opens
* User types watchlist name, clicks Create, closes the modal
* In that Modal user also has the option to set Active that watchlist
* New watchlist appears as a tab button
* That watchlist becomes active
* Now in the dashboard user can click on any watchlist and set Active that watchlist so any instruments he stars goes to that active watchlist
* User has another option to view the watchlist, he clicks on the eye icon and ViewWatchlistModal opens and in that modal the list appears and from this modal he can remove any instrument and can also delete the whole watchlist

* All powered by **Redux Toolkit (`watchlistSlice`)**.

---

## 🧩 Widgets Dashboard

### widgets/page.js
* Main widgets dashboard
* Displays added widgets
* Shows "+ Add Widget" placeholder
* Controls AddWidgetModal visibility

### AddWidgetModal.js
* Create custom widgets
* Configure:
  * Widget name
  * API source
  * Refresh interval
  * View type (card / table / chart)

---

## 🔍 Search System (No Extra APIs)

### How Search Works
* Source of truth: `marketDataSlice.categories`
* Filters instruments by name or symbol
* Uses **Fuse.js** for fuzzy search

### Examples
* Handles Spelling errors done by the User while search
"Telsa" → Tesla Inc (TSLA)
"Aplei" → Apple Inc (AAPL)


### On Selection
* Sets active instrument
* Loads chart using cached snapshot or history

---

## 🧠 Caching Strategy

### Cache #1 — Server Cache (API Proxy)
* Lives inside `/api/proxy`
* Prevents repeated Alpha Vantage calls
* TTL = 5 minutes

### Cache #2 — Client Cache (Redux)
* Stores snapshot prices
* Used for UI rendering
* Does NOT prevent API calls

---

## 🔄 Data Flow (Clear Mental Model)
```
Search / Watchlist
↓
GLOBAL_QUOTE (Alpha Vantage)
↓
API Proxy Cache
↓
Redux Snapshot
↓
Line Chart (No API)
```
* For Line Chart /api/proxy?function=GLOBAL_QUOTE&symbol=NVDA

```
Candlestick Chart
↓
TIME_SERIES_DAILY
↓
/api/proxy/history/alpha
↓
Lightweight Charts
```
* For Candle Stick Graph /api/proxy/history/alpha?symbol=AAPL&interval=1D


✅ hits Alpha Vantage  
❌ But subsequent calls may be served from **server cache**

Browser always calls `/api/proxy`  
Proxy only calls Alpha Vantage when cache expires

---

## 🧠 Why This Architecture Works

* Prevents API rate-limit issues
* Zero redundant network calls
* Scales well for large watchlists
* Clear separation of concerns
* Production-grade data flow

---

## 🏁 Conclusion

Groww Shark is a **production-ready finance dashboard** demonstrating:
* Real API integration
* Advanced state management
* Clean architecture
* Scalable frontend design
* Professional charting solutions

---

## 🔮 Future Scope & Enhancements

The current implementation lays a strong foundation, and the platform can be extended further with the following enhancements:

* 🧲 **Drag & Drop Widgets**
  * Allow users to freely rearrange widgets on the dashboard using drag-and-drop.
  * Save widget layout preferences per user.
  * Improves personalization and dashboard flexibility.

* 🏷️ **Company Logos & Branding**
  * Display official company logos alongside stock names and symbols.
  * Fetch logos dynamically using symbol-based logo APIs.
  * Enhances visual clarity and brand recognition.

* ⏱️ **Real-Time Streaming Updates**
  * Integrate WebSockets or Server-Sent Events (SSE) for live price updates.
  * Reduce polling-based API calls.
  * Enables near real-time market movement tracking.

* 📐 **Resizable Widgets**
  * Allow users to resize widgets (small / medium / large).
  * Better support for different data views like tables vs charts.


* 📱 **Mobile-First Enhancements**
  * Optimize chart interactions for touch gestures.
  * Improve widget layout responsiveness on smaller screens.


---


## 🙌 Author
Built with ❤️ by **Alisha Mahmood**
