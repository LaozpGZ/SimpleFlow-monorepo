var x = Object.defineProperty;
var R = (d, e, o) => e in d ? x(d, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : d[e] = o;
var $ = (d, e, o) => R(d, typeof e != "symbol" ? e + "" : e, o);
function L(d) {
  return d;
}
const V = {
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
Object.values(V).reduce((d, e) => (d[e.id] = e, d), {});
function I(d) {
  return V[d];
}
const z = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"], P = {
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
}, J = {
  supported_resolutions: z.map(L),
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
class H {
  constructor(e = {}, o) {
    $(this, "configuration");
    $(this, "api");
    $(this, "ws", null);
    $(this, "wsUrl", "wss://dws.coinmarketcap.com/ws");
    // "wss://pcs-ws.dquery.ai/ws";
    $(this, "subscriptions", /* @__PURE__ */ new Map());
    this.configuration = {
      ...J,
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
  resolveSymbol(e, o, t) {
    console.log("[Datafeed]: resolveSymbol() called with", e);
    try {
      const a = window.TradingView.token0Address, s = window.TradingView.token1Address, r = window.TradingView.fromChainId, c = window.TradingView.toChainId;
      if (!a || !s || !r || !c) {
        console.error("Missing token addresses or chainId in window.TradingView"), t("Missing token information");
        return;
      }
      const i = I(Number(r));
      i ? console.log(
        `Using chain: ${i.name} (${i.displayName}), Chain ID: ${i.chainId}`
      ) : console.warn(`Chain ID ${r} is not supported. Using default BNB Chain (56).`);
      const l = I(Number(c));
      l ? console.log(`Using chain: ${l.name} (${l.displayName}), Chain ID: ${l.chainId}`) : console.warn(`Chain ID ${c} is not supported. Using default BNB Chain (56).`);
      const m = a.slice(-4), h = s.slice(-4), u = `${m}/${h}`, f = {
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
          fromChainId: r,
          toChainId: c,
          displayName: u,
          fromChainName: (i == null ? void 0 : i.name) || "BNB Smart Chain (BEP20)",
          fromChainDisplayName: (i == null ? void 0 : i.displayName) || "BSC",
          toChainName: (l == null ? void 0 : l.name) || "BNB Smart Chain (BEP20)",
          toChainDisplayName: (l == null ? void 0 : l.displayName) || "BSC"
        })
      };
      setTimeout(() => {
        o(f), this.fetch24HrData(a, s);
      }, 0);
    } catch (a) {
      console.error("Error in resolveSymbol:", a), t("Failed to resolve symbol");
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
  getBars(e, o, t, a, s) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: o,
      from: new Date(t.from * 1e3).toISOString(),
      to: new Date(t.to * 1e3).toISOString(),
      countBack: t.countBack
    });
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: i, fromChainId: l, toChainId: m } = r;
      if (!c || !i || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), s("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(l), "from"), this.api.setPlatform(Number(m), "to");
      const { from: h, to: u, countBack: f } = t;
      console.log(`[Datafeed]: Fetching prices for base token ${c} and quote token ${i}`), console.warn(`[Datafeed]: tv Resolution: ${o}, cmc Resolution: ${P[o]}`);
      const _ = this.api.getBars("from", c, P[o], h, u, f), N = this.api.getBars("to", i, P[o], h, u, f);
      Promise.all([_, N]).then(([b, T]) => {
        if (!b || b.length === 0 || !T || T.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${h} to=${u}`), a([], { noData: !0 });
          return;
        }
        const w = [], B = /* @__PURE__ */ new Map();
        b.forEach((n) => {
          B.set(n.time, { base: n });
        }), T.forEach((n) => {
          const g = B.get(n.time);
          g ? g.quote = n : B.set(n.time, { quote: n });
        });
        let D = null, p = null;
        B.forEach((n, g) => {
          if (n.base && n.quote) {
            const y = n.base.open / n.quote.open, k = n.base.high / n.quote.high, C = n.base.low / n.quote.low, S = n.base.close / n.quote.close, v = n.base.volume !== void 0 ? n.base.volume : 0, U = n.quote.volume !== void 0 ? n.quote.volume : 0, q = (v + U) / 2, W = Math.max(y, S) * 5, A = Math.min(y, S) / 5;
            (k > W || C < A) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(g).toISOString()}:`, {
              symbol: e.name,
              time: g,
              timeUTC: new Date(g).toUTCString(),
              open: y,
              high: k,
              low: C,
              close: S,
              highToOpenRatio: k / y,
              highToCloseRatio: k / S,
              lowToOpenRatio: C / y,
              lowToCloseRatio: C / S,
              baseToken: {
                open: n.base.open,
                high: n.base.high,
                low: n.base.low,
                close: n.base.close
              },
              quoteToken: {
                open: n.quote.open,
                high: n.quote.high,
                low: n.quote.low,
                close: n.quote.close
              }
            });
            const E = {
              time: g,
              open: y,
              high: k,
              low: C,
              close: S,
              volume: q
            };
            if (D) {
              const O = Math.abs(D.close - E.open), M = O / D.close * 100;
              M > 1 && console.warn(
                `[Datafeed]: Significant gap between bars at ${new Date(D.time).toISOString()} and ${new Date(
                  g
                ).toISOString()}:`,
                {
                  prevClose: D.close,
                  currentOpen: E.open,
                  difference: O,
                  differencePercent: `${M.toFixed(2)}%`,
                  timeDiff: `${(g - D.time) / 1e3 / 60} minutes`,
                  resolution: o,
                  currentData: n,
                  prevData: p
                }
              );
            }
            w.push(E), D = E, p = n;
          }
        }), w.sort((n, g) => n.time - g.time), console.log(`[Datafeed]: Calculated ${w.length} bars for ${e.name}`, {
          firstBar: w.length > 0 ? w[0] : null,
          lastBar: w.length > 0 ? w[w.length - 1] : null
        }), a(w, { noData: w.length === 0 });
      }).catch((b) => {
        console.error("[Datafeed]: Error fetching bars from API:", b), s(`Failed to fetch bars: ${b instanceof Error ? b.message : String(b)}`);
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
  subscribeBars(e, o, t, a, s) {
    try {
      const r = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: i, fromChainId: l, toChainId: m } = r;
      if (!c || !i || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo for WebSocket subscription", e);
        return;
      }
      this.subscriptions.set(a, {
        symbolInfo: e,
        resolution: o,
        onTick: t
      });
      const h = I(Number(l));
      if (!h) {
        console.error(`[Datafeed]: Chain ID ${l} not supported for WebSocket subscription`);
        return;
      }
      const u = I(Number(m));
      if (!u) {
        console.error(`[Datafeed]: Chain ID ${m} not supported for WebSocket subscription`);
        return;
      }
      const f = h.id, _ = u.id;
      this.initWebSocket();
      const N = P[o], b = `datahub@kline@${f}@${c.toLowerCase()}@${N}`, T = `datahub@kline@${_}@${i.toLowerCase()}@${N}`;
      this.ws && this.ws.readyState === WebSocket.OPEN ? (this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [b]
        })
      ), this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [T]
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
      const { symbolInfo: t, resolution: a } = e;
      try {
        const s = JSON.parse(t.long_description || "{}"), { baseToken: r, quoteToken: c, chainId: i } = s;
        if (!r || !c || !i) {
          console.error(`[Datafeed]: Missing token information for ${o}`);
          return;
        }
        const l = I(Number(i));
        if (!l) {
          console.error(`[Datafeed]: Chain ID ${i} not supported for ${o}`);
          return;
        }
        const m = l.id, h = P[a], u = `datahub@kline@${m}@${r.toLowerCase()}@${h}`, f = `datahub@kline@${m}@${c.toLowerCase()}@${h}`;
        this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [u]
          })
        ), this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [f]
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
      const [t, a] = await Promise.all([
        this.api.get24HrData(e, "from"),
        this.api.get24HrData(o, "to")
      ]), s = t.c / a.c, r = Math.max(Math.abs(t.h / t.c - 1), Math.abs(a.l / a.c - 1)) * 100, c = Math.max(Math.abs(t.l / t.c - 1), Math.abs(a.h / a.c - 1)) * 100, i = s * (1 + r / 100), l = s * (1 - c / 100), m = t.changes - a.changes;
      console.log("[Datafeed]: 24hr data calculated:", { high: i, low: l, close: s, changes: m }), window.TradingView && typeof window.TradingView.on24HrDataReady == "function" ? (window.TradingView.on24HrDataReady(i, l, s, m), console.log("[Datafeed]: 24hr data callback executed")) : console.warn("[Datafeed]: 24hr data callback not available");
    } catch (t) {
      console.error("[Datafeed]: Error fetching 24hr data:", t);
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
      } catch (f) {
        console.error("[Datafeed]: Error parsing WebSocket message:", f);
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
    let t = "";
    const a = o.split("@");
    if (a.length >= 4)
      t = a[3].toLowerCase();
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${o}`);
      return;
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn("[Datafeed]: Invalid price data format:", e.d);
      return;
    }
    const s = e.d.u, r = parseFloat(s[0]), c = parseFloat(s[1]), i = parseFloat(s[2]), l = parseFloat(s[3]), m = parseFloat(s[4]);
    let h = parseFloat(s[5]);
    if (h < 1e10 && (h *= 1e3), isNaN(r) || isNaN(c) || isNaN(i) || isNaN(l) || isNaN(h)) {
      console.warn("[Datafeed]: Invalid price values after parsing:", {
        open: r,
        high: c,
        low: i,
        close: l,
        volume: m,
        timestamp: h
      });
      return;
    }
    const u = {
      o: r,
      h: c,
      l: i,
      c: l,
      v: m,
      t: h
    };
    try {
      this.subscriptions.forEach((f, _) => {
        var D;
        const { symbolInfo: N, onTick: b } = f, T = JSON.parse(N.long_description || "{}"), { baseToken: w, quoteToken: B } = T;
        if ((t === w.toLowerCase() || t === B.toLowerCase()) && (t === w.toLowerCase() ? f.baseData = u : f.quoteData = u, f.baseData && f.quoteData)) {
          const p = f.baseData, n = f.quoteData;
          if (Math.abs(p.t - n.t) <= 1e3) {
            if (!isFinite(p.o) || p.o <= 0 || !isFinite(p.h) || p.h <= 0 || !isFinite(p.l) || p.l <= 0 || !isFinite(p.c) || p.c <= 0 || !isFinite(n.o) || n.o <= 0 || !isFinite(n.h) || n.h <= 0 || !isFinite(n.l) || n.l <= 0 || !isFinite(n.c) || n.c <= 0) {
              console.error(`[Datafeed]: Invalid price data for ${N.name}, skipping update`);
              return;
            }
            const g = p.o / n.o, y = p.h / n.h, k = p.l / n.l, C = p.c / n.c, S = (p.v + n.v) / 2;
            if (!isFinite(g) || !isFinite(y) || !isFinite(k) || !isFinite(C) || !isFinite(S)) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${N.name}:`, {
                open: g,
                high: y,
                low: k,
                close: C,
                volume: S
              });
              return;
            }
            const v = {
              time: p.t,
              open: g,
              high: y,
              low: k,
              close: C,
              volume: S
            };
            f.lastBar = v, b(v);
            try {
              (D = window.TradingView) == null || D.onCurrentPriceUpdate(v.close);
            } catch (U) {
              console.error("[Datafeed]: Error onCurrentPriceUpdate:", U);
            }
          }
        }
      });
    } catch (f) {
      console.error("[Datafeed]: Error processing WebSocket kline data:", f);
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
class K {
  constructor(e = {}) {
    $(this, "config");
    this.config = {
      baseUrl: "https://pcs.dquery.ai",
      fromPlatform: 14,
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 ID
      toPlatform: 14,
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 ID
      ...e
    };
  }
  /**
   * 設置平台/鏈ID
   * @param chainId - 區塊鏈的 chainId
   */
  setPlatform(e, o) {
    const t = I(e);
    t ? (o === "from" ? this.config.fromPlatform = t.id : this.config.toPlatform = t.id, console.log(`set platform: ${t.name} (ID: ${t.id}, ChainId: ${e})`)) : (o === "from" ? this.config.fromPlatform = 14 : this.config.toPlatform = 14, console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`));
  }
  /**
   * 獲取K線數據
   * @param params - K線參數
   */
  async getKLineData(e, o) {
    const t = new URL("/u-kline/v1/k-line/candles", this.config.baseUrl);
    t.searchParams.append(
      "platform",
      o === "from" ? this.config.fromPlatform.toString() : this.config.toPlatform.toString()
    ), t.searchParams.append("address", e.address), t.searchParams.append("interval", e.interval), e.limit && t.searchParams.append("limit", e.limit.toString()), e.from && t.searchParams.append("from", e.from.toString()), e.to && t.searchParams.append("to", e.to.toString());
    try {
      const a = await fetch(t.toString());
      if (!a.ok)
        throw new Error(`API error: ${a.status}`);
      return await a.json();
    } catch (a) {
      throw console.error("Failed to fetch K-line data:", a), a;
    }
  }
  /**
   * 將API返回的K線數據轉換為TradingView Bar格式
   * @param data - API返回的K線數據
   */
  convertToTradingViewBars(e) {
    return e.map((o) => {
      const [t, a, s, r, c, i] = o;
      return {
        time: i,
        // 時間戳 (毫秒)
        open: t,
        high: a,
        low: s,
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
  async getBars(e, o, t, a, s, r) {
    try {
      const c = this.convertResolution(t), i = await this.getKLineData(
        {
          address: o,
          interval: c,
          from: a * 1e3,
          // 轉換為毫秒
          to: s * 1e3,
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
      const t = Math.floor(Date.now() / 1e3), a = t - 24 * 60 * 60, s = await this.getBars(o, e, "60", a, t);
      if (!s || s.length === 0)
        throw new Error(`No data available for token ${e}`);
      let r = -1 / 0, c = 1 / 0;
      s.forEach((h) => {
        h.high > r && (r = h.high), h.low < c && (c = h.low);
      });
      const i = s[s.length - 1].close, l = s[0].open, m = (i - l) / l * 100;
      return {
        h: r,
        l: c,
        c: i,
        changes: m
      };
    } catch (t) {
      throw console.error("Failed to get 24hr data:", t), t;
    }
  }
}
const F = (d) => new K(d);
function j(d, e) {
  const o = e || F();
  return new H(d, o);
}
function G(d, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.TradingView = window.TradingView || {}, window.TradingView.token0Address = window.TradingView.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.TradingView.token1Address = window.TradingView.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.TradingView.fromChainId = window.TradingView.fromChainId || 56, window.TradingView.toChainId = window.TradingView.toChainId || 56;
  const o = window.TradingView.fromChainId, t = window.TradingView.toChainId, a = I(o), s = I(t);
  a ? console.log(
    `Using blockchain: ${a.name} (${a.displayName}), Chain ID: ${a.chainId}`
  ) : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`), s ? console.log(`Using blockchain: ${s.name} (${s.displayName}), Chain ID: ${s.chainId}`) : console.warn(`Chain ID ${t} is not supported. Using default BNB Chain (56).`);
  const r = F(), l = {
    ...{
      symbol: "WBNB/CAKE",
      // 顯示名稱，實際數據來自 window.TradingView 中的代幣地址
      interval: "15",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: j({}, r),
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
function X(d = "https://assets.pcswap.org/web/charts/charting_library/", e = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((o, t) => {
    const a = document.createElement("script");
    a.src = `${d}charting_library.standalone.js`, a.async = !0, a.onload = () => {
      const s = document.createElement("script");
      s.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, s.async = !0, s.onload = () => {
        o({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, s.onerror = () => t(new Error("Failed to load Datafeeds library")), document.head.appendChild(s);
    }, a.onerror = () => t(new Error("Failed to load TradingView library")), document.head.appendChild(a);
  });
}
function Q() {
  return window.TradingView;
}
function Y() {
  return window.Datafeeds;
}
const ee = {
  createTradingViewWidget: G,
  loadTradingViewLibrary: X,
  getTradingView: Q,
  getDatafeeds: Y,
  CHAIN_ID_MAP: V,
  getChainInfoByChainId: I
};
export {
  G as createTradingViewWidget,
  ee as default,
  Y as getDatafeeds,
  Q as getTradingView,
  X as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
