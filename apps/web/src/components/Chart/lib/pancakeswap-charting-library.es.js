var A = Object.defineProperty;
var x = (c, e, o) => e in c ? A(c, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : c[e] = o;
var T = (c, e, o) => x(c, typeof e != "symbol" ? e + "" : e, o);
function R(c) {
  return c;
}
const P = {
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
Object.values(P).reduce((c, e) => (c[e.id] = e, c), {});
function C(c) {
  return P[c];
}
const L = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"], $ = {
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
}, z = {
  supported_resolutions: L.map(R),
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
class J {
  constructor(e = {}, o) {
    T(this, "configuration");
    T(this, "api");
    T(this, "ws", null);
    T(this, "wsUrl", "wss://dws.coinmarketcap.com/ws");
    // "wss://pcs-ws.dquery.ai/ws";
    T(this, "subscriptions", /* @__PURE__ */ new Map());
    this.configuration = {
      ...z,
      ...e
    }, this.api = o;
  }
  /**
   * 初始化 Datafeed 並返回配置
   * @param callback - 回調函數，用於返回配置
   */
  onReady(e) {
    console.log("[Datafeed]: onReady() called"), setTimeout(() => {
      e(this.configuration);
    }, 0);
  }
  /**
   * 解析交易對信息
   * 從 window.TradingView 中獲取代幣地址和鏈 ID
   */
  resolveSymbol(e, o, n) {
    console.log("[Datafeed]: resolveSymbol() called with", e);
    try {
      const a = window.TradingView.token0Address, s = window.TradingView.token1Address, r = window.TradingView.chainId;
      if (!a || !s || !r) {
        console.error("Missing token addresses or chainId in window.TradingView"), n("Missing token information");
        return;
      }
      const i = C(Number(r));
      i ? console.log(`Using chain: ${i.name} (${i.displayName}), Chain ID: ${i.chainId}`) : console.warn(`Chain ID ${r} is not supported. Using default BNB Chain (56).`);
      const l = a.slice(-4), h = s.slice(-4), d = `${l}/${h}`, m = {
        name: e,
        // 原始名稱，用於內部識別
        description: e,
        // 顯示名稱，如 "USDT/BNB"
        ticker: e,
        exchange: "PancakeSwap",
        listed_exchange: "PancakeSwap",
        type: "token",
        session: "24x7",
        timezone: "Etc/UTC",
        pricescale: 1e5,
        // 價格精度，根據實際情況調整
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
        // 使用 long_description 字段存儲額外信息
        long_description: JSON.stringify({
          baseToken: a,
          quoteToken: s,
          chainId: r,
          displayName: d,
          chainName: (i == null ? void 0 : i.name) || "BNB Smart Chain (BEP20)",
          chainDisplayName: (i == null ? void 0 : i.displayName) || "BSC"
        })
      };
      setTimeout(() => {
        o(m), this.fetch24HrData(a, s);
      }, 0);
    } catch (a) {
      console.error("Error in resolveSymbol:", a), n("Failed to resolve symbol");
    }
  }
  /**
   * 獲取歷史 K 線數據
   * 這個方法是 TradingView 圖表加載時的核心方法，負責獲取歷史價格數據
   *
   * @param symbolInfo - 交易對信息對象，包含了在 resolveSymbol 中設置的所有信息
   * @param resolution - 時間週期，如 '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param periodParams - 時間範圍參數，包含 from（開始時間戳，秒）、to（結束時間戳，秒）和 countBack（請求的 K 線數量）
   * @param onResult - 成功回調函數，用於返回 K 線數據
   * @param onError - 錯誤回調函數
   */
  getBars(e, o, n, a, s) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: o,
      from: new Date(n.from * 1e3).toISOString(),
      to: new Date(n.to * 1e3).toISOString(),
      countBack: n.countBack
    });
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: i, quoteToken: l, chainId: h } = r;
      if (!i || !l || !h) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), s("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(h));
      const { from: d, to: m, countBack: b } = n;
      console.log(`[Datafeed]: Fetching prices for base token ${i} and quote token ${l}`), console.warn(`[Datafeed]: tv Resolution: ${o}, cmc Resolution: ${$[o]}`);
      const p = this.api.getBars(i, $[o], d, m, b), v = this.api.getBars(l, $[o], d, m, b);
      Promise.all([p, v]).then(([g, B]) => {
        if (!g || g.length === 0 || !B || B.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${d} to=${m}`), a([], { noData: !0 });
          return;
        }
        const w = [], I = /* @__PURE__ */ new Map();
        g.forEach((t) => {
          I.set(t.time, { base: t });
        }), B.forEach((t) => {
          const u = I.get(t.time);
          u ? u.quote = t : I.set(t.time, { quote: t });
        });
        let S = null, f = null;
        I.forEach((t, u) => {
          if (t.base && t.quote) {
            const D = t.base.open / t.quote.open, k = t.base.high / t.quote.high, N = t.base.low / t.quote.low, y = t.base.close / t.quote.close, _ = t.base.volume !== void 0 ? t.base.volume : 0, F = t.quote.volume !== void 0 ? t.quote.volume : 0, U = (_ + F) / 2, q = Math.max(D, y) * 5, W = Math.min(D, y) / 5;
            (k > q || N < W) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(u).toISOString()}:`, {
              symbol: e.name,
              time: u,
              timeUTC: new Date(u).toUTCString(),
              open: D,
              high: k,
              low: N,
              close: y,
              highToOpenRatio: k / D,
              highToCloseRatio: k / y,
              lowToOpenRatio: N / D,
              lowToCloseRatio: N / y,
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
            const E = {
              time: u,
              open: D,
              high: k,
              low: N,
              close: y,
              volume: U
            };
            if (S) {
              const O = Math.abs(S.close - E.open), M = O / S.close * 100;
              M > 1 && console.warn(
                `[Datafeed]: Significant gap between bars at ${new Date(S.time).toISOString()} and ${new Date(
                  u
                ).toISOString()}:`,
                {
                  prevClose: S.close,
                  currentOpen: E.open,
                  difference: O,
                  differencePercent: `${M.toFixed(2)}%`,
                  timeDiff: `${(u - S.time) / 1e3 / 60} minutes`,
                  resolution: o,
                  currentData: t,
                  prevData: f
                }
              );
            }
            w.push(E), S = E, f = t;
          }
        }), w.sort((t, u) => t.time - u.time), console.log(`[Datafeed]: Calculated ${w.length} bars for ${e.name}`, {
          firstBar: w.length > 0 ? w[0] : null,
          lastBar: w.length > 0 ? w[w.length - 1] : null
        }), a(w, { noData: w.length === 0 });
      }).catch((g) => {
        console.error("[Datafeed]: Error fetching bars from API:", g), s(`Failed to fetch bars: ${g instanceof Error ? g.message : String(g)}`);
      });
    } catch (r) {
      console.error("[Datafeed]: Error in getBars method:", r), s(`Error processing request: ${r instanceof Error ? r.message : String(r)}`);
    }
  }
  /**
   * 訂閱實時數據
   * 這個方法負責建立 WebSocket 連接並訂閱實時 K 線數據
   *
   * @param symbolInfo - 交易對信息對象，包含了在 resolveSymbol 中設置的所有信息
   * @param resolution - 時間週期，如 '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param onTick - 回調函數，用於接收實時 K 線數據
   * @param subscriberUID - 訂閱者唯一標識符
   * @param onResetCacheNeededCallback - 重置緩存回調函數
   */
  subscribeBars(e, o, n, a, s) {
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: i, quoteToken: l, chainId: h } = r;
      if (!i || !l || !h) {
        console.error("[Datafeed]: Missing token information in symbolInfo for WebSocket subscription", e);
        return;
      }
      this.subscriptions.set(a, {
        symbolInfo: e,
        resolution: o,
        onTick: n
      });
      const d = C(Number(h));
      if (!d) {
        console.error(`[Datafeed]: Chain ID ${h} not supported for WebSocket subscription`);
        return;
      }
      const m = d.id;
      this.initWebSocket();
      const b = $[o], p = `datahub@kline@${m}@${i.toLowerCase()}@${b}`, v = `datahub@kline@${m}@${l.toLowerCase()}@${b}`;
      this.ws && this.ws.readyState === WebSocket.OPEN ? (this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [p]
        })
      ), this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [v]
        })
      )) : console.warn("[Datafeed]: WebSocket not ready, will try to subscribe when connected");
    } catch (r) {
      console.error("[Datafeed]: Error in subscribeBars:", r);
    }
  }
  /**
   * 初始化 WebSocket 連接
   * 這個方法負責創建 WebSocket 連接並設置事件處理程序
   * 如果連接已經存在，則不會重複創建
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
   * 重新發送所有訂閱請求
   * 當 WebSocket 連接重新建立時，需要重新發送所有訂閱請求
   */
  resubscribeAll() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[Datafeed]: Cannot resubscribe, WebSocket not open");
      return;
    }
    console.log(`[Datafeed]: Resubscribing to ${this.subscriptions.size} symbols`), this.subscriptions.forEach((e, o) => {
      const { symbolInfo: n, resolution: a } = e;
      try {
        const s = JSON.parse(n.long_description || "{}"), { baseToken: r, quoteToken: i, chainId: l } = s;
        if (!r || !i || !l) {
          console.error(`[Datafeed]: Missing token information for ${o}`);
          return;
        }
        const h = C(Number(l));
        if (!h) {
          console.error(`[Datafeed]: Chain ID ${l} not supported for ${o}`);
          return;
        }
        const d = h.id, m = $[a], b = `datahub@kline@${d}@${r.toLowerCase()}@${m}`, p = `datahub@kline@${d}@${i.toLowerCase()}@${m}`;
        this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [b]
          })
        ), this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [p]
          })
        );
      } catch (s) {
        console.error(`[Datafeed]: Error resubscribing for ${o}:`, s);
      }
    });
  }
  /**
   * 非同步獲取 24 小時數據並更新圖表
   * @param baseToken - 基礎代幣地址
   * @param quoteToken - 計價代幣地址
   */
  async fetch24HrData(e, o) {
    try {
      console.log(`[Datafeed]: Fetching 24hr data for ${e}/${o}`);
      const [n, a] = await Promise.all([
        this.api.get24HrData(e),
        this.api.get24HrData(o)
      ]), s = n.c / a.c, r = Math.max(Math.abs(n.h / n.c - 1), Math.abs(a.l / a.c - 1)) * 100, i = Math.max(Math.abs(n.l / n.c - 1), Math.abs(a.h / a.c - 1)) * 100, l = s * (1 + r / 100), h = s * (1 - i / 100), d = n.changes - a.changes;
      console.log("[Datafeed]: 24hr data calculated:", { high: l, low: h, close: s, changes: d }), window.TradingView && typeof window.TradingView.on24HrDataReady == "function" ? (window.TradingView.on24HrDataReady(l, h, s, d), console.log("[Datafeed]: 24hr data callback executed")) : console.warn("[Datafeed]: 24hr data callback not available");
    } catch (n) {
      console.error("[Datafeed]: Error fetching 24hr data:", n);
    }
  }
  /**
   * 處理 WebSocket 接收到的消息
   * @param data - 接收到的消息數據
   */
  processWebSocketMessage(e) {
    if (typeof e == "string")
      try {
        e = JSON.parse(e);
      } catch (p) {
        console.error("[Datafeed]: Error parsing WebSocket message:", p);
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
    let n = "";
    const a = o.split("@");
    if (a.length >= 4)
      n = a[3].toLowerCase();
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${o}`);
      return;
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn("[Datafeed]: Invalid price data format:", e.d);
      return;
    }
    const s = e.d.u, r = parseFloat(s[0]), i = parseFloat(s[1]), l = parseFloat(s[2]), h = parseFloat(s[3]), d = parseFloat(s[4]);
    let m = parseFloat(s[5]);
    if (m < 1e10 && (m *= 1e3), isNaN(r) || isNaN(i) || isNaN(l) || isNaN(h) || isNaN(m)) {
      console.warn("[Datafeed]: Invalid price values after parsing:", {
        open: r,
        high: i,
        low: l,
        close: h,
        volume: d,
        timestamp: m
      });
      return;
    }
    const b = {
      o: r,
      h: i,
      l,
      c: h,
      v: d,
      t: m
    };
    try {
      this.subscriptions.forEach((p, v) => {
        const { symbolInfo: g, onTick: B } = p, w = JSON.parse(g.long_description || "{}"), { baseToken: I, quoteToken: S } = w;
        if ((n === I.toLowerCase() || n === S.toLowerCase()) && (n === I.toLowerCase() ? p.baseData = b : p.quoteData = b, p.baseData && p.quoteData)) {
          const f = p.baseData, t = p.quoteData;
          if (Math.abs(f.t - t.t) <= 1e3) {
            if (!isFinite(f.o) || f.o <= 0 || !isFinite(f.h) || f.h <= 0 || !isFinite(f.l) || f.l <= 0 || !isFinite(f.c) || f.c <= 0 || !isFinite(t.o) || t.o <= 0 || !isFinite(t.h) || t.h <= 0 || !isFinite(t.l) || t.l <= 0 || !isFinite(t.c) || t.c <= 0) {
              console.error(`[Datafeed]: Invalid price data for ${g.name}, skipping update`);
              return;
            }
            const u = f.o / t.o, D = f.h / t.h, k = f.l / t.l, N = f.c / t.c, y = (f.v + t.v) / 2;
            if (!isFinite(u) || !isFinite(D) || !isFinite(k) || !isFinite(N) || !isFinite(y)) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${g.name}:`, {
                open: u,
                high: D,
                low: k,
                close: N,
                volume: y
              });
              return;
            }
            const _ = {
              time: f.t,
              open: u,
              high: D,
              low: k,
              close: N,
              volume: y
            };
            p.lastBar = _, B(_);
          }
        }
      });
    } catch (p) {
      console.error("[Datafeed]: Error processing WebSocket kline data:", p);
    }
  }
  /**
   * 取消訂閱實時數據
   * 這個方法負責取消特定的 WebSocket 訂閱
   *
   * @param subscriberUID - 訂閱者唯一標識符
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
   * 搜索交易對
   * 這是一個佔位方法，後續會實現
   */
  searchSymbols() {
    console.log("[Datafeed]: searchSymbols() called");
  }
}
class H {
  constructor(e = {}) {
    T(this, "config");
    this.config = {
      baseUrl: "https://pcs.dquery.ai",
      platform: 14,
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 ID
      ...e
    };
  }
  /**
   * 設置平台/鏈ID
   * @param chainId - 區塊鏈的 chainId
   */
  setPlatform(e) {
    const o = C(e);
    o ? (this.config.platform = o.id, console.log(`set platform: ${o.name} (ID: ${o.id}, ChainId: ${e})`)) : (this.config.platform = 14, console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`));
  }
  /**
   * 獲取K線數據
   * @param params - K線參數
   */
  async getKLineData(e) {
    const o = new URL("/u-kline/v1/k-line/candles", this.config.baseUrl);
    o.searchParams.append("platform", this.config.platform.toString()), o.searchParams.append("address", e.address), o.searchParams.append("interval", e.interval), e.limit && o.searchParams.append("limit", e.limit.toString()), e.from && o.searchParams.append("from", e.from.toString()), e.to && o.searchParams.append("to", e.to.toString());
    try {
      const n = await fetch(o.toString());
      if (!n.ok)
        throw new Error(`API error: ${n.status}`);
      return await n.json();
    } catch (n) {
      throw console.error("Failed to fetch K-line data:", n), n;
    }
  }
  /**
   * 將API返回的K線數據轉換為TradingView Bar格式
   * @param data - API返回的K線數據
   */
  convertToTradingViewBars(e) {
    return e.map((o) => {
      const [n, a, s, r, i, l] = o;
      return {
        time: l,
        // 時間戳 (毫秒)
        open: n,
        high: a,
        low: s,
        close: r,
        volume: i
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
    const o = $[e];
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
  async getBars(e, o, n, a, s) {
    try {
      const r = this.convertResolution(o), i = await this.getKLineData({
        address: e,
        interval: r,
        from: n * 1e3,
        // 轉換為毫秒
        to: a * 1e3,
        // 轉換為毫秒
        limit: s
      });
      if (i.status.error_code !== "0")
        throw new Error(`API error: ${i.status.error_message}`);
      return this.convertToTradingViewBars(i.data);
    } catch (r) {
      throw console.error("Failed to get bars:", r), r;
    }
  }
  /**
   * 獲取代幣 24 小時數據
   * @param tokenAddress - 代幣地址
   * @returns 24小時數據，包含最高價、最低價、當前價格和價格變化百分比
   */
  async get24HrData(e) {
    try {
      const o = Math.floor(Date.now() / 1e3), n = o - 24 * 60 * 60, a = await this.getBars(e, "60", n, o);
      if (!a || a.length === 0)
        throw new Error(`No data available for token ${e}`);
      let s = -1 / 0, r = 1 / 0;
      a.forEach((d) => {
        d.high > s && (s = d.high), d.low < r && (r = d.low);
      });
      const i = a[a.length - 1].close, l = a[0].open, h = (i - l) / l * 100;
      return {
        h: s,
        l: r,
        c: i,
        changes: h
      };
    } catch (o) {
      throw console.error("Failed to get 24hr data:", o), o;
    }
  }
}
const V = (c) => new H(c);
function K(c, e) {
  const o = e || V();
  return new J(c, o);
}
function j(c, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.TradingView = window.TradingView || {}, window.TradingView.token0Address = window.TradingView.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.TradingView.token1Address = window.TradingView.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.TradingView.chainId = window.TradingView.chainId || 56;
  const o = window.TradingView.chainId, n = C(o);
  n ? console.log(`Using blockchain: ${n.name} (${n.displayName}), Chain ID: ${n.chainId}`) : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`);
  const a = V(), i = {
    ...{
      symbol: "WBNB/CAKE",
      // 顯示名稱，實際數據來自 window.TradingView 中的代幣地址
      interval: "15",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: K({}, a),
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
    container: typeof c == "string" ? c : c.id
  };
  return new window.TradingView.widget(i);
}
function G(c = "https://assets.pcswap.org/web/charts/charting_library/", e = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((o, n) => {
    const a = document.createElement("script");
    a.src = `${c}charting_library.standalone.js`, a.async = !0, a.onload = () => {
      const s = document.createElement("script");
      s.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, s.async = !0, s.onload = () => {
        o({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, s.onerror = () => n(new Error("Failed to load Datafeeds library")), document.head.appendChild(s);
    }, a.onerror = () => n(new Error("Failed to load TradingView library")), document.head.appendChild(a);
  });
}
function X() {
  return window.TradingView;
}
function Q() {
  return window.Datafeeds;
}
const Z = {
  createTradingViewWidget: j,
  loadTradingViewLibrary: G,
  getTradingView: X,
  getDatafeeds: Q,
  CHAIN_ID_MAP: P,
  getChainInfoByChainId: C
};
export {
  j as createTradingViewWidget,
  Z as default,
  Q as getDatafeeds,
  X as getTradingView,
  G as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
