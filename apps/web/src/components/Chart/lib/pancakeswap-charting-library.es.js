var A = Object.defineProperty;
var x = (c, e, o) => e in c ? A(c, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : c[e] = o;
var T = (c, e, o) => x(c, typeof e != "symbol" ? e + "" : e, o);
function R(c) {
  return c;
}
const O = {
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
Object.values(O).reduce((c, e) => (c[e.id] = e, c), {});
function C(c) {
  return O[c];
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
  resolveSymbol(e, o, t) {
    console.log("[Datafeed]: resolveSymbol() called with", e);
    try {
      const r = window.TradingView.token0Address, a = window.TradingView.token1Address, i = window.TradingView.chainId;
      if (!r || !a || !i) {
        console.error("Missing token addresses or chainId in window.TradingView"), t("Missing token information");
        return;
      }
      const s = C(Number(i));
      s ? console.log(`Using chain: ${s.name} (${s.displayName}), Chain ID: ${s.chainId}`) : console.warn(`Chain ID ${i} is not supported. Using default BNB Chain (56).`);
      const l = r.slice(-4), m = a.slice(-4), f = `${l}/${m}`, p = {
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
          baseToken: r,
          quoteToken: a,
          chainId: i,
          displayName: f,
          chainName: (s == null ? void 0 : s.name) || "BNB Smart Chain (BEP20)",
          chainDisplayName: (s == null ? void 0 : s.displayName) || "BSC"
        })
      };
      setTimeout(() => {
        o(p);
      }, 0);
    } catch (r) {
      console.error("Error in resolveSymbol:", r), t("Failed to resolve symbol");
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
  getBars(e, o, t, r, a) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: o,
      from: new Date(t.from * 1e3).toISOString(),
      to: new Date(t.to * 1e3).toISOString(),
      countBack: t.countBack
    });
    try {
      const i = JSON.parse(e.long_description || "{}"), { baseToken: s, quoteToken: l, chainId: m } = i;
      if (!s || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), a("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(m));
      const { from: f, to: p, countBack: b } = t;
      console.log(`[Datafeed]: Fetching prices for base token ${s} and quote token ${l}`), console.warn(`[Datafeed]: tv Resolution: ${o}, cmc Resolution: ${$[o]}`);
      const d = this.api.getBars(s, $[o], f, p, b), v = this.api.getBars(l, $[o], f, p, b);
      Promise.all([d, v]).then(([g, B]) => {
        if (!g || g.length === 0 || !B || B.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${f} to=${p}`), r([], { noData: !0 });
          return;
        }
        const w = [], I = /* @__PURE__ */ new Map();
        g.forEach((n) => {
          I.set(n.time, { base: n });
        }), B.forEach((n) => {
          const u = I.get(n.time);
          u ? u.quote = n : I.set(n.time, { quote: n });
        });
        let y = null, h = null;
        I.forEach((n, u) => {
          if (n.base && n.quote) {
            const S = n.base.open / n.quote.open, D = n.base.high / n.quote.high, N = n.base.low / n.quote.low, k = n.base.close / n.quote.close, _ = n.base.volume !== void 0 ? n.base.volume : 0, V = n.quote.volume !== void 0 ? n.quote.volume : 0, q = (_ + V) / 2, M = Math.max(S, k) * 5, W = Math.min(S, k) / 5;
            (D > M || N < W) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(u).toISOString()}:`, {
              symbol: e.name,
              time: u,
              timeUTC: new Date(u).toUTCString(),
              open: S,
              high: D,
              low: N,
              close: k,
              highToOpenRatio: D / S,
              highToCloseRatio: D / k,
              lowToOpenRatio: N / S,
              lowToCloseRatio: N / k,
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
              time: u,
              open: S,
              high: D,
              low: N,
              close: k,
              volume: q
            };
            if (y) {
              const P = Math.abs(y.close - E.open), U = P / y.close * 100;
              U > 1 && console.warn(
                `[Datafeed]: Significant gap between bars at ${new Date(y.time).toISOString()} and ${new Date(
                  u
                ).toISOString()}:`,
                {
                  prevClose: y.close,
                  currentOpen: E.open,
                  difference: P,
                  differencePercent: `${U.toFixed(2)}%`,
                  timeDiff: `${(u - y.time) / 1e3 / 60} minutes`,
                  resolution: o,
                  currentData: n,
                  prevData: h
                }
              );
            }
            w.push(E), y = E, h = n;
          }
        }), w.sort((n, u) => n.time - u.time), console.log(`[Datafeed]: Calculated ${w.length} bars for ${e.name}`, {
          firstBar: w.length > 0 ? w[0] : null,
          lastBar: w.length > 0 ? w[w.length - 1] : null
        }), r(w, { noData: w.length === 0 });
      }).catch((g) => {
        console.error("[Datafeed]: Error fetching bars from API:", g), a(`Failed to fetch bars: ${g instanceof Error ? g.message : String(g)}`);
      });
    } catch (i) {
      console.error("[Datafeed]: Error in getBars method:", i), a(`Error processing request: ${i instanceof Error ? i.message : String(i)}`);
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
  subscribeBars(e, o, t, r, a) {
    try {
      const i = JSON.parse(e.long_description || "{}"), { baseToken: s, quoteToken: l, chainId: m } = i;
      if (!s || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo for WebSocket subscription", e);
        return;
      }
      this.subscriptions.set(r, {
        symbolInfo: e,
        resolution: o,
        onTick: t
      });
      const f = C(Number(m));
      if (!f) {
        console.error(`[Datafeed]: Chain ID ${m} not supported for WebSocket subscription`);
        return;
      }
      const p = f.id;
      this.initWebSocket();
      const b = $[o], d = `datahub@kline@${p}@${s.toLowerCase()}@${b}`, v = `datahub@kline@${p}@${l.toLowerCase()}@${b}`;
      this.ws && this.ws.readyState === WebSocket.OPEN ? (this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [d]
        })
      ), this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [v]
        })
      )) : console.warn("[Datafeed]: WebSocket not ready, will try to subscribe when connected");
    } catch (i) {
      console.error("[Datafeed]: Error in subscribeBars:", i);
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
      const { symbolInfo: t, resolution: r } = e;
      try {
        const a = JSON.parse(t.long_description || "{}"), { baseToken: i, quoteToken: s, chainId: l } = a;
        if (!i || !s || !l) {
          console.error(`[Datafeed]: Missing token information for ${o}`);
          return;
        }
        const m = C(Number(l));
        if (!m) {
          console.error(`[Datafeed]: Chain ID ${l} not supported for ${o}`);
          return;
        }
        const f = m.id, p = $[r], b = `datahub@kline@${f}@${i.toLowerCase()}@${p}`, d = `datahub@kline@${f}@${s.toLowerCase()}@${p}`;
        this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [b]
          })
        ), this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [d]
          })
        );
      } catch (a) {
        console.error(`[Datafeed]: Error resubscribing for ${o}:`, a);
      }
    });
  }
  /**
   * 處理 WebSocket 接收到的消息
   * @param data - 接收到的消息數據
   */
  processWebSocketMessage(e) {
    if (typeof e == "string")
      try {
        e = JSON.parse(e);
      } catch (d) {
        console.error("[Datafeed]: Error parsing WebSocket message:", d);
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
    const r = o.split("@");
    if (r.length >= 4)
      t = r[3].toLowerCase();
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${o}`);
      return;
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn("[Datafeed]: Invalid price data format:", e.d);
      return;
    }
    const a = e.d.u, i = parseFloat(a[0]), s = parseFloat(a[1]), l = parseFloat(a[2]), m = parseFloat(a[3]), f = parseFloat(a[4]);
    let p = parseFloat(a[5]);
    if (p < 1e10 && (p *= 1e3), isNaN(i) || isNaN(s) || isNaN(l) || isNaN(m) || isNaN(p)) {
      console.warn("[Datafeed]: Invalid price values after parsing:", {
        open: i,
        high: s,
        low: l,
        close: m,
        volume: f,
        timestamp: p
      });
      return;
    }
    const b = {
      o: i,
      h: s,
      l,
      c: m,
      v: f,
      t: p
    };
    try {
      this.subscriptions.forEach((d, v) => {
        const { symbolInfo: g, onTick: B } = d, w = JSON.parse(g.long_description || "{}"), { baseToken: I, quoteToken: y } = w;
        if ((t === I.toLowerCase() || t === y.toLowerCase()) && (t === I.toLowerCase() ? d.baseData = b : d.quoteData = b, d.baseData && d.quoteData)) {
          const h = d.baseData, n = d.quoteData;
          if (Math.abs(h.t - n.t) <= 1e3) {
            if (!isFinite(h.o) || h.o <= 0 || !isFinite(h.h) || h.h <= 0 || !isFinite(h.l) || h.l <= 0 || !isFinite(h.c) || h.c <= 0 || !isFinite(n.o) || n.o <= 0 || !isFinite(n.h) || n.h <= 0 || !isFinite(n.l) || n.l <= 0 || !isFinite(n.c) || n.c <= 0) {
              console.error(`[Datafeed]: Invalid price data for ${g.name}, skipping update`);
              return;
            }
            const u = h.o / n.o, S = h.h / n.h, D = h.l / n.l, N = h.c / n.c, k = (h.v + n.v) / 2;
            if (!isFinite(u) || !isFinite(S) || !isFinite(D) || !isFinite(N) || !isFinite(k)) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${g.name}:`, {
                open: u,
                high: S,
                low: D,
                close: N,
                volume: k
              });
              return;
            }
            const _ = {
              time: h.t,
              open: u,
              high: S,
              low: D,
              close: N,
              volume: k
            };
            d.lastBar = _, B(_);
          }
        }
      });
    } catch (d) {
      console.error("[Datafeed]: Error processing WebSocket kline data:", d);
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
      const t = await fetch(o.toString());
      if (!t.ok)
        throw new Error(`API error: ${t.status}`);
      return await t.json();
    } catch (t) {
      throw console.error("Failed to fetch K-line data:", t), t;
    }
  }
  /**
   * 將API返回的K線數據轉換為TradingView Bar格式
   * @param data - API返回的K線數據
   */
  convertToTradingViewBars(e) {
    return e.map((o) => {
      const [t, r, a, i, s, l] = o;
      return {
        time: l,
        // 時間戳 (毫秒)
        open: t,
        high: r,
        low: a,
        close: i,
        volume: s
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
  async getBars(e, o, t, r, a) {
    try {
      const i = this.convertResolution(o), s = await this.getKLineData({
        address: e,
        interval: i,
        from: t * 1e3,
        // 轉換為毫秒
        to: r * 1e3,
        // 轉換為毫秒
        limit: a
      });
      if (s.status.error_code !== "0")
        throw new Error(`API error: ${s.status.error_message}`);
      return this.convertToTradingViewBars(s.data);
    } catch (i) {
      throw console.error("Failed to get bars:", i), i;
    }
  }
}
const F = (c) => new K(c);
function j(c, e) {
  const o = e || F();
  return new J(c, o);
}
function G(c, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.TradingView = window.TradingView || {}, window.TradingView.token0Address = window.TradingView.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.TradingView.token1Address = window.TradingView.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.TradingView.chainId = window.TradingView.chainId || 56;
  const o = window.TradingView.chainId, t = C(o);
  t ? console.log(`Using blockchain: ${t.name} (${t.displayName}), Chain ID: ${t.chainId}`) : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`);
  const r = F(), s = {
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
    container: typeof c == "string" ? c : c.id
  };
  return new window.TradingView.widget(s);
}
function H(c = "https://assets.pcswap.org/web/charts/charting_library/", e = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((o, t) => {
    const r = document.createElement("script");
    r.src = `${c}charting_library.standalone.js`, r.async = !0, r.onload = () => {
      const a = document.createElement("script");
      a.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, a.async = !0, a.onload = () => {
        o({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, a.onerror = () => t(new Error("Failed to load Datafeeds library")), document.head.appendChild(a);
    }, r.onerror = () => t(new Error("Failed to load TradingView library")), document.head.appendChild(r);
  });
}
function X() {
  return window.TradingView;
}
function Q() {
  return window.Datafeeds;
}
const Z = {
  createTradingViewWidget: G,
  loadTradingViewLibrary: H,
  getTradingView: X,
  getDatafeeds: Q,
  CHAIN_ID_MAP: O,
  getChainInfoByChainId: C
};
export {
  G as createTradingViewWidget,
  Z as default,
  Q as getDatafeeds,
  X as getTradingView,
  H as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
