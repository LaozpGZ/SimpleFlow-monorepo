var A = Object.defineProperty;
var W = (d, e, o) => e in d ? A(d, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : d[e] = o;
var E = (d, e, o) => W(d, typeof e != "symbol" ? e + "" : e, o);
function M(d) {
  return d;
}
const v = {
  // BNB Smart Chain (BEP20)
  56: {
    id: 14,
    name: "BNB Smart Chain (BEP20)",
    displayName: "BSC",
    chainId: 56,
    scanUrl: "https://bscscan.com"
  },
  // Ethereum
  1: {
    id: 1,
    name: "Ethereum",
    displayName: "Ethereum",
    chainId: 1,
    scanUrl: "https://etherscan.io"
  },
  // Arbitrum
  42161: {
    id: 51,
    name: "Arbitrum",
    displayName: "Arbitrum",
    chainId: 42161,
    scanUrl: "https://arbiscan.io"
  },
  // Avalanche C-Chain
  43114: {
    id: 28,
    name: "Avalanche C-Chain",
    displayName: "Avalanche",
    chainId: 43114,
    scanUrl: "https://snowscan.xyz"
  },
  // Polygon
  137: {
    id: 25,
    name: "Polygon",
    displayName: "Polygon",
    chainId: 137,
    scanUrl: "https://polygonscan.com"
  },
  // Base
  8453: {
    id: 199,
    name: "Base",
    displayName: "Base",
    chainId: 8453,
    scanUrl: "https://basescan.org"
  },
  // Optimism
  10: {
    id: 42,
    name: "Optimism",
    displayName: "Optimism",
    chainId: 10,
    scanUrl: "https://optimistic.etherscan.io"
  },
  // Fantom
  250: {
    id: 24,
    name: "Fantom",
    displayName: "Fantom",
    chainId: 250,
    scanUrl: "https://ftmscan.com"
  },
  // zkSync Era
  324: {
    id: 183,
    name: "zkSync Era",
    displayName: "zkSync",
    chainId: 324,
    scanUrl: "https://explorer.zksync.io"
  },
  // Linea
  59144: {
    id: 198,
    name: "Linea",
    displayName: "Linea",
    chainId: 59144,
    scanUrl: "https://lineascan.build"
  },
  // Gnosis Chain
  100: {
    id: 20,
    name: "Gnosis Chain",
    displayName: "Gnosis",
    chainId: 100,
    scanUrl: "https://gnosisscan.io"
  },
  // Cronos
  25: {
    id: 68,
    name: "Cronos",
    displayName: "Cronos",
    chainId: 25,
    scanUrl: "https://cronoscan.com"
  },
  // Blast
  81457: {
    id: 210,
    name: "Blast",
    displayName: "Blast",
    chainId: 81457,
    scanUrl: "https://blastscan.io"
  },
  // Mantle
  5e3: {
    id: 195,
    name: "Mantle",
    displayName: "Mantle",
    chainId: 5e3,
    scanUrl: "https://mantlescan.xyz"
  },
  // Scroll
  534352: {
    id: 205,
    name: "Scroll",
    displayName: "Scroll",
    chainId: 534352,
    scanUrl: "https://scrollscan.com"
  },
  // Polygon zkEVM
  1101: {
    id: 3890,
    name: "Polygon zkEVM",
    displayName: "Polygon zkEVM",
    chainId: 1101,
    scanUrl: "https://zkevm.polygonscan.com"
  },
  // opBNB
  204: {
    id: 1839,
    name: "opBNB",
    displayName: "opBNB",
    chainId: 204,
    scanUrl: "https://mainnet.opbnbscan.com"
  },
  // Solana
  "-1": {
    id: 5426,
    name: "Solana",
    displayName: "Solana",
    chainId: -1,
    scanUrl: "https://solscan.io"
  }
};
Object.values(v).reduce((d, e) => (d[e.id] = e, d), {});
function S(d) {
  return v[d];
}
const L = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"], P = {
  1: "1m",
  "1m": "1m",
  5: "5m",
  "5m": "5m",
  15: "15m",
  "15m": "15m",
  30: "30m",
  "30m": "30m",
  "1h": "1h",
  60: "1h",
  "60m": "1h",
  240: "4h",
  "1D": "1d",
  "1d": "1d",
  "1W": "1w",
  "1M": "1M"
}, R = {
  supported_resolutions: L.map(M),
  supports_marks: !1,
  supports_timescale_marks: !1,
  supports_time: !0,
  exchanges: [
    {
      value: "PancakeSwap",
      name: "PancakeSwap",
      desc: "PancakeSwap DEX"
    }
  ],
  symbols_types: [
    {
      name: "Token",
      value: "token"
    }
  ]
};
class V {
  constructor(e = {}, o) {
    E(this, "configuration");
    E(this, "api");
    E(this, "ws", null);
    E(this, "wsUrl", "wss://dws.coinmarketcap.com/ws");
    // "wss://pcs-ws.dquery.ai/ws";
    E(this, "subscriptions", /* @__PURE__ */ new Map());
    this.configuration = {
      ...R,
      ...e
    }, this.api = o, window.pcsExtraData ? (window.pcsExtraData.fetch24HrData = this.fetch24HrData.bind(this), console.log("[Datafeed]: Injected fetch24HrData method into window.pcsExtraData")) : console.warn("[Datafeed]: window.pcsExtraData is not defined, cannot inject fetch24HrData method");
  }
  /**
   * Initialize Datafeed and return configuration
   * @param callback - Callback function to return configuration
   */
  onReady(e) {
    console.log("[Datafeed]: onReady() called"), setTimeout(() => {
      e(this.configuration);
    }, 0);
  }
  /**
   * Parse trading pair information
   * Get token addresses and chain IDs from window.TradingView
   */
  resolveSymbol(e, o, a) {
    console.log("[Datafeed]: resolveSymbol() called with", e);
    try {
      const s = window.pcsExtraData.token0Address, n = window.pcsExtraData.token1Address, r = window.pcsExtraData.fromChainId, c = window.pcsExtraData.toChainId;
      if (!s || !n || !r || !c) {
        console.error("Missing token addresses or chainId in window.pcsExtraData"), a("Missing token information");
        return;
      }
      const i = S(Number(r));
      i ? console.log(
        `Using chain: ${i.name} (${i.displayName}), Chain ID: ${i.chainId}`
      ) : console.warn(`Chain ID ${r} is not supported. Using default BNB Chain (56).`);
      const l = S(Number(c));
      l ? console.log(`Using chain: ${l.name} (${l.displayName}), Chain ID: ${l.chainId}`) : console.warn(`Chain ID ${c} is not supported. Using default BNB Chain (56).`);
      const m = s.slice(-4), f = n.slice(-4), w = `${m}/${f}`, h = {
        name: e,
        // Original name for internal identification
        description: e,
        // Display name, e.g. "USDT/BNB"
        ticker: e,
        exchange: "PancakeSwap",
        listed_exchange: "PancakeSwap",
        type: "token",
        session: "24x7",
        timezone: "Etc/UTC",
        pricescale: 1e5,
        // Price precision, adjust according to actual situation
        minmov: 1,
        format: "price",
        has_intraday: !0,
        has_daily: !0,
        has_weekly_and_monthly: !0,
        supported_resolutions: this.configuration.supported_resolutions || [],
        volume_precision: 8,
        data_status: "streaming",
        currency_code: "USD",
        original_currency_code: "USD",
        // Use long_description field to store additional information
        long_description: JSON.stringify({
          baseToken: s,
          quoteToken: n,
          fromChainId: r,
          toChainId: c,
          displayName: w,
          fromChainName: (i == null ? void 0 : i.name) || "BNB Smart Chain (BEP20)",
          fromChainDisplayName: (i == null ? void 0 : i.displayName.toLowerCase()) || "BSC",
          toChainName: (l == null ? void 0 : l.name) || "BNB Smart Chain (BEP20)",
          toChainDisplayName: (l == null ? void 0 : l.displayName.toLowerCase()) || "BSC"
        })
      };
      setTimeout(() => {
        o(h);
      }, 0);
    } catch (s) {
      console.error("Error in resolveSymbol:", s), a("Failed to resolve symbol");
    }
  }
  /**
   * Get historical K-line data
   * This is the core method for TradingView chart loading, responsible for fetching historical price data
   *
   * @param symbolInfo - Trading pair information object containing all info set in resolveSymbol
   * @param resolution - Time period, e.g. '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param periodParams - Time range parameters including from (start timestamp in seconds), to (end timestamp in seconds), and countBack (number of K-lines requested)
   * @param onResult - Success callback function to return K-line data
   * @param onError - Error callback function
   */
  getBars(e, o, a, s, n) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: o,
      from: new Date(a.from * 1e3).toISOString(),
      to: new Date(a.to * 1e3).toISOString(),
      countBack: a.countBack
    });
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: i, fromChainId: l, toChainId: m } = r;
      if (!c || !i || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), n("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(l), "from"), this.api.setPlatform(Number(m), "to");
      const { from: f, to: w, countBack: h } = a;
      console.log(`[Datafeed]: Fetching prices for base token ${c} and quote token ${i}`), console.warn(`[Datafeed]: tv Resolution: ${o}, cmc Resolution: ${P[o]}`);
      const N = this.api.getBars("from", c, P[o], f, w, h), k = this.api.getBars("to", i, P[o], f, w, h);
      Promise.all([N, k]).then(([u, $]) => {
        if (!u || u.length === 0 || !$ || $.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${f} to=${w}`), s([], { noData: !0 });
          return;
        }
        const b = [], B = /* @__PURE__ */ new Map();
        u.forEach((t) => {
          B.set(t.time, { base: t });
        }), $.forEach((t) => {
          const g = B.get(t.time);
          g ? g.quote = t : B.set(t.time, { quote: t });
        });
        let p = null;
        B.forEach((t, g) => {
          if (t.base && t.quote) {
            let D = t.base.open / t.quote.open;
            const C = t.base.high / t.quote.low, I = t.base.low / t.quote.high, y = t.base.close / t.quote.close;
            p && (D = p.close, console.log(`[Datafeed]: Applied last close = new open logic. Previous close: ${p.close}, Original open: ${t.base.open / t.quote.open}`));
            const T = t.base.volume !== void 0 ? t.base.volume : 0, U = t.quote.volume !== void 0 ? t.quote.volume : 0, O = (T + U) / 2, F = Math.max(D, y) * 5, q = Math.min(D, y) / 5;
            (C > F || I < q) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(g).toISOString()}:`, {
              symbol: e.name,
              time: g,
              timeUTC: new Date(g).toUTCString(),
              open: D,
              high: C,
              low: I,
              close: y,
              highToOpenRatio: C / D,
              highToCloseRatio: C / y,
              lowToOpenRatio: I / D,
              lowToCloseRatio: I / y,
              baseToken: {
                open: t.base.open,
                high: t.base.high,
                low: t.base.low,
                close: t.base.close
              },
              quoteToken: {
                open: t.quote.open,
                high: t.quote.high,
                low: t.quote.low,
                close: t.quote.close
              }
            });
            const _ = {
              time: g,
              open: D,
              high: C,
              low: I,
              close: y,
              volume: O
            };
            b.push(_), p = _;
          }
        }), b.sort((t, g) => t.time - g.time), console.log(`[Datafeed]: Calculated ${b.length} bars for ${e.name}`, {
          firstBar: b.length > 0 ? b[0] : null,
          lastBar: b.length > 0 ? b[b.length - 1] : null
        }), s(b, { noData: b.length === 0 });
      }).catch((u) => {
        console.error("[Datafeed]: Error fetching bars from API:", u), n(`Failed to fetch bars: ${u instanceof Error ? u.message : String(u)}`);
      });
    } catch (r) {
      console.error("[Datafeed]: Error in getBars method:", r), n(`Error processing request: ${r instanceof Error ? r.message : String(r)}`);
    }
  }
  /**
   * Subscribe to real-time data
   * This method is responsible for establishing WebSocket connection and subscribing to real-time K-line data
   *
   * @param symbolInfo - Trading pair information object containing all info set in resolveSymbol
   * @param resolution - Time period, e.g. '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param onTick - Callback function to receive real-time K-line data
   * @param subscriberUID - Unique subscriber identifier
   * @param onResetCacheNeededCallback - Reset cache callback function
   */
  subscribeBars(e, o, a, s, n) {
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: i, fromChainId: l, toChainId: m } = r;
      if (!c || !i || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo for WebSocket subscription", e);
        return;
      }
      this.subscriptions.set(s, {
        symbolInfo: e,
        resolution: o,
        onTick: a
      });
      const f = S(Number(l));
      if (!f) {
        console.error(`[Datafeed]: Chain ID ${l} not supported for WebSocket subscription`);
        return;
      }
      const w = S(Number(m));
      if (!w) {
        console.error(`[Datafeed]: Chain ID ${m} not supported for WebSocket subscription`);
        return;
      }
      const h = f.id, N = w.id;
      this.initWebSocket();
      const k = P[o], u = `datahub@kline@${h}@${c.toLowerCase()}@${k}`, $ = `datahub@kline@${N}@${i.toLowerCase()}@${k}`;
      this.ws && this.ws.readyState === WebSocket.OPEN ? (this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [u]
        })
      ), this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [$]
        })
      )) : console.warn("[Datafeed]: WebSocket not ready, will try to subscribe when connected");
    } catch (r) {
      console.error("[Datafeed]: Error in subscribeBars:", r);
    }
  }
  /**
   * Initialize WebSocket connection
   * This method is responsible for creating WebSocket connection and setting up event handlers
   * If connection already exists, it won't be recreated
   */
  initWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[Datafeed]: WebSocket connection already open");
      return;
    }
    this.ws && (console.log("[Datafeed]: Closing existing WebSocket connection"), this.ws.close(), this.ws = null);
    try {
      this.ws = new WebSocket(this.wsUrl), this.ws.onopen = () => {
        console.log("[Datafeed]: WebSocket connection established"), this.resubscribeAll();
      }, this.ws.onmessage = (e) => {
        try {
          const o = JSON.parse(e.data);
          this.processWebSocketMessage(o);
        } catch (o) {
          console.error("[Datafeed]: Error processing WebSocket message:", o);
        }
      }, this.ws.onerror = (e) => {
        console.error("[Datafeed]: WebSocket error:", e);
      }, this.ws.onclose = (e) => {
        console.log(`[Datafeed]: WebSocket connection closed: ${e.code} ${e.reason}`), e.code !== 1e3 && setTimeout(() => this.initWebSocket(), 5e3);
      };
    } catch (e) {
      console.error("[Datafeed]: Error initializing WebSocket:", e);
    }
  }
  /**
   * Resend all subscription requests
   * When WebSocket connection is re-established, need to resend all subscription requests
   */
  resubscribeAll() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[Datafeed]: Cannot resubscribe, WebSocket not open");
      return;
    }
    console.log(`[Datafeed]: Resubscribing to ${this.subscriptions.size} symbols`), this.subscriptions.forEach((e, o) => {
      const { symbolInfo: a, resolution: s } = e;
      try {
        const n = JSON.parse(a.long_description || "{}"), { baseToken: r, quoteToken: c, fromChainId: i, toChainId: l } = n;
        if (!r || !c || !i || !l) {
          console.error(`[Datafeed]: Missing token information for ${o}`);
          return;
        }
        const m = S(Number(i));
        if (!m) {
          console.error(`[Datafeed]: Chain ID ${i} not supported for ${o}`);
          return;
        }
        const f = S(Number(l));
        if (!f) {
          console.error(`[Datafeed]: Chain ID ${l} not supported for ${o}`);
          return;
        }
        const w = m.id, h = f.id, N = P[s], k = `datahub@kline@${w}@${r.toLowerCase()}@${N}`, u = `datahub@kline@${h}@${c.toLowerCase()}@${N}`;
        this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [k]
          })
        ), this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [u]
          })
        );
      } catch (n) {
        console.error(`[Datafeed]: Error resubscribing for ${o}:`, n);
      }
    });
  }
  /**
   * Asynchronously fetch 24-hour data and return calculated results
   * Get token addresses and chain IDs from window.pcsExtraData
   * @returns Calculated 24-hour data including high, low, close and changes
   */
  async fetch24HrData() {
    try {
      const e = window.pcsExtraData.token0Address, o = window.pcsExtraData.token1Address, a = window.pcsExtraData.fromChainId, s = window.pcsExtraData.toChainId;
      if (!e || !o)
        return console.error("[fetch24HrData]: Missing token addresses"), null;
      console.log(`[Datafeed]: Fetching 24hr data for ${e}/${o}`), this.api.setPlatform(Number(a), "from"), this.api.setPlatform(Number(s), "to");
      const n = await this.api.get24HrData(e, "from"), r = await this.api.get24HrData(o, "to");
      if (!n || !r)
        return console.error("[Datafeed]: Failed to fetch 24hr data"), null;
      const c = n.h / r.l, i = n.l / r.h, l = n.c / r.c, m = n.changes - r.changes;
      return console.log("[Datafeed]: 24hr data calculated:", { high: c, low: i, close: l, changes: m }), { high: c, low: i, close: l, changes: m };
    } catch (e) {
      return console.error("[Datafeed]: Error fetching 24hr data:", e), null;
    }
  }
  /**
   * Process WebSocket received messages
   * @param data - Received message data
   */
  processWebSocketMessage(e) {
    if (typeof e == "string")
      try {
        e = JSON.parse(e);
      } catch (h) {
        console.error("[Datafeed]: Error parsing WebSocket message:", h);
        return;
      }
    if (!e) {
      console.warn("[Datafeed]: Empty WebSocket message");
      return;
    }
    if (!e.d || !e.c) {
      console.warn("[Datafeed]: Missing required data fields in message:", e);
      return;
    }
    const o = e.c;
    let a = "";
    const s = o.split("@");
    if (s.length >= 4)
      a = s[3].toLowerCase();
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${o}`);
      return;
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn("[Datafeed]: Invalid price data format:", e.d);
      return;
    }
    const n = e.d.u, r = parseFloat(n[0]), c = parseFloat(n[1]), i = parseFloat(n[2]), l = parseFloat(n[3]), m = parseFloat(n[4]);
    let f = parseFloat(n[5]);
    if (f < 1e10 && (f *= 1e3), isNaN(r) || isNaN(c) || isNaN(i) || isNaN(l) || isNaN(f)) {
      console.warn("[Datafeed]: Invalid price values after parsing:", {
        open: r,
        high: c,
        low: i,
        close: l,
        volume: m,
        timestamp: f
      });
      return;
    }
    const w = {
      o: r,
      h: c,
      l: i,
      c: l,
      v: m,
      t: f
    };
    try {
      this.subscriptions.forEach((h, N) => {
        const { symbolInfo: k, onTick: u } = h, $ = JSON.parse(k.long_description || "{}"), { baseToken: b, quoteToken: B } = $;
        if ((a === b.toLowerCase() || a === B.toLowerCase()) && (a === b.toLowerCase() ? h.baseData = w : h.quoteData = w, h.baseData && h.quoteData)) {
          const p = h.baseData, t = h.quoteData;
          if (Math.abs(p.t - t.t) <= 1e3) {
            if (!isFinite(p.o) || p.o <= 0 || !isFinite(p.h) || p.h <= 0 || !isFinite(p.l) || p.l <= 0 || !isFinite(p.c) || p.c <= 0 || !isFinite(t.o) || t.o <= 0 || !isFinite(t.h) || t.h <= 0 || !isFinite(t.l) || t.l <= 0 || !isFinite(t.c) || t.c <= 0) {
              console.error(`[Datafeed]: Invalid price data for ${k.name}, skipping update`);
              return;
            }
            let g = p.o / t.o;
            const D = p.h / t.l, C = p.l / t.h, I = p.c / t.c, y = (p.v + t.v) / 2;
            if (h.lastBar && (g = h.lastBar.close, console.log(`[Datafeed]: Applied last close = new open logic for WebSocket. Previous close: ${h.lastBar.close}, Original open: ${p.o / t.o}`)), !isFinite(g) || !isFinite(D) || !isFinite(C) || !isFinite(I) || !isFinite(y)) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${k.name}:`, {
                open: g,
                high: D,
                low: C,
                close: I,
                volume: y
              });
              return;
            }
            const T = {
              time: p.t,
              open: g,
              high: D,
              low: C,
              close: I,
              volume: y
            };
            h.lastBar = T, u(T);
          }
        }
      });
    } catch (h) {
      console.error("[Datafeed]: Error processing WebSocket kline data:", h);
    }
  }
  /**
   * Cancel real-time data subscription
   * This method is responsible for canceling specific WebSocket subscriptions
   *
   * @param subscriberUID - Unique subscriber identifier
   */
  unsubscribeBars(e) {
    console.log("[Datafeed]: unsubscribeBars() called with", e);
    try {
      if (!this.subscriptions.get(e)) {
        console.warn(`[Datafeed]: Subscription ${e} not found`);
        return;
      }
      this.subscriptions.delete(e), this.subscriptions.size === 0 && this.ws && (console.log("[Datafeed]: No more subscriptions, closing WebSocket connection"), this.ws.close(1e3, "No active subscriptions"), this.ws = null);
    } catch (o) {
      console.error(`[Datafeed]: Error unsubscribing ${e}:`, o);
    }
  }
  /**
   * Search trading pairs
   * This is a placeholder method, will be implemented later
   */
  searchSymbols() {
    console.log("[Datafeed]: searchSymbols() called");
  }
}
class z {
  constructor(e = {}) {
    E(this, "config");
    this.config = {
      baseUrl: "https://pcs.dquery.ai",
      fromPlatform: "bsc",
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 displayName
      toPlatform: "bsc",
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 displayName
      ...e
    };
  }
  /**
   * 設置平台/鏈ID
   * @param chainId - 區塊鏈的 chainId
   */
  setPlatform(e, o) {
    const a = S(e);
    a ? (o === "from" ? this.config.fromPlatform = a.displayName.toLowerCase() : this.config.toPlatform = a.displayName.toLowerCase(), console.log(`set platform: ${a.name} (ID: ${a.id}, ChainId: ${e})`)) : (o === "from" ? this.config.fromPlatform = "bsc" : this.config.toPlatform = "bsc", console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`));
  }
  /**
   * 獲取K線數據
   * @param params - K線參數
   */
  async getKLineData(e, o) {
    const a = new URL("/u-kline/v1/k-line/candles", this.config.baseUrl);
    a.searchParams.append(
      "platform",
      o === "from" ? this.config.fromPlatform.toString() : this.config.toPlatform.toString()
    ), a.searchParams.append("address", e.address), a.searchParams.append("interval", e.interval), e.limit && a.searchParams.append("limit", e.limit.toString()), e.from && a.searchParams.append("from", e.from.toString()), e.to && a.searchParams.append("to", e.to.toString());
    try {
      const s = await fetch(a.toString());
      if (!s.ok)
        throw new Error(`API error: ${s.status}`);
      return await s.json();
    } catch (s) {
      throw console.error("Failed to fetch K-line data:", s), s;
    }
  }
  /**
   * 將API返回的K線數據轉換為TradingView Bar格式
   * @param data - API返回的K線數據
   */
  convertToTradingViewBars(e) {
    return e.map((o) => {
      const [a, s, n, r, c, i] = o;
      return {
        time: i,
        // 時間戳 (毫秒)
        open: a,
        high: s,
        low: n,
        close: r,
        volume: c
      };
    });
  }
  /**
   * 根據交易對和時間範圍獲取K線數據
   * @param tokenAddress - 代幣地址
   * @param resolution - 時間週期
   * @param from - 開始時間戳 (秒)
   * @param to - 結束時間戳 (秒)
   * @param limit - 限制數量
   */
  /**
   * 將 TradingView 解析度轉換為 API 所需的時間間隔格式
   * @param resolution - TradingView 解析度
   */
  convertResolution(e) {
    const o = P[e];
    return o ? {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "30m": "30min",
      "1h": "1h",
      "4h": "4h",
      "1d": "1d",
      "1w": "1w",
      "1M": "1M"
    }[o] || "5min" : (console.warn(`未知的解析度: ${e}，使用默認值 5min`), "5min");
  }
  async getBars(e, o, a, s, n, r) {
    try {
      const c = this.convertResolution(a), i = await this.getKLineData(
        {
          address: o,
          interval: c,
          from: s * 1e3,
          // 轉換為毫秒
          to: n * 1e3,
          // 轉換為毫秒
          limit: r
        },
        e
      );
      if (i.status.error_code !== "0")
        throw new Error(`API error: ${i.status.error_message}`);
      return this.convertToTradingViewBars(i.data);
    } catch (c) {
      throw console.error("Failed to get bars:", c), c;
    }
  }
  /**
   * 獲取代幣 24 小時數據
   * @param tokenAddress - 代幣地址
   * @returns 24小時數據，包含最高價、最低價、當前價格和價格變化百分比
   */
  async get24HrData(e, o) {
    try {
      const a = Math.floor(Date.now() / 1e3), s = a - 24 * 60 * 60, n = await this.getBars(o, e, "60", s, a, 24);
      if (!n || n.length === 0)
        throw new Error(`No data available for token ${e}`);
      let r = -1 / 0, c = 1 / 0;
      n.forEach((f) => {
        f.high > r && (r = f.high), f.low < c && (c = f.low);
      });
      const i = n[n.length - 1].close, l = n[0].open, m = (i - l) / l * 100;
      return {
        h: r,
        l: c,
        c: i,
        changes: m
      };
    } catch (a) {
      throw console.error("Failed to get 24hr data:", a), a;
    }
  }
}
const x = (d) => new z(d);
function J(d, e) {
  const o = e || x();
  return new V(d, o);
}
function H(d, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.pcsExtraData = window.pcsExtraData || {}, window.pcsExtraData.token0Address = window.pcsExtraData.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.pcsExtraData.token1Address = window.pcsExtraData.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.pcsExtraData.fromChainId = window.pcsExtraData.fromChainId || 56, window.pcsExtraData.toChainId = window.pcsExtraData.toChainId || 56;
  const o = window.pcsExtraData.fromChainId, a = window.pcsExtraData.toChainId, s = S(o), n = S(a);
  s ? console.log(
    `Using blockchain: ${s.name} (${s.displayName}), Chain ID: ${s.chainId}`
  ) : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`), n ? console.log(`Using blockchain: ${n.name} (${n.displayName}), Chain ID: ${n.chainId}`) : console.warn(`Chain ID ${a} is not supported. Using default BNB Chain (56).`);
  const r = x(), l = {
    ...{
      symbol: "WBNB/CAKE",
      // 顯示名稱，實際數據來自 window.TradingView 中的代幣地址
      interval: "15",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: J({}, r),
      // 使用我們自己的 datafeed
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      theme: "Light"
    },
    ...e,
    container: typeof d == "string" ? d : d.id
  };
  return new window.TradingView.widget(l);
}
function j(d = "https://assets.pcswap.org/web/charts/charting_library/", e = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((o, a) => {
    const s = document.createElement("script");
    s.src = `${d}charting_library.standalone.js`, s.async = !0, s.onload = () => {
      const n = document.createElement("script");
      n.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, n.async = !0, n.onload = () => {
        o({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, n.onerror = () => a(new Error("Failed to load Datafeeds library")), document.head.appendChild(n);
    }, s.onerror = () => a(new Error("Failed to load TradingView library")), document.head.appendChild(s);
  });
}
function K() {
  return window.TradingView;
}
function G() {
  return window.Datafeeds;
}
const Q = {
  createTradingViewWidget: H,
  loadTradingViewLibrary: j,
  getTradingView: K,
  getDatafeeds: G,
  CHAIN_ID_MAP: v,
  getChainInfoByChainId: S
};
export {
  H as createTradingViewWidget,
  Q as default,
  G as getDatafeeds,
  K as getTradingView,
  j as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
