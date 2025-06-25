var L = Object.defineProperty;
var R = (d, e, o) => e in d ? L(d, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : d[e] = o;
var B = (d, e, o) => R(d, typeof e != "symbol" ? e + "" : e, o);
function V(d) {
  return d;
}
const _ = {
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
Object.values(_).reduce((d, e) => (d[e.id] = e, d), {});
function y(d) {
  return _[d];
}
const z = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"], T = {
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
  supported_resolutions: z.map(V),
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
    B(this, "configuration");
    B(this, "api");
    B(this, "ws", null);
    B(this, "wsUrl", "wss://dws.coinmarketcap.com/ws");
    // "wss://pcs-ws.dquery.ai/ws";
    B(this, "subscriptions", /* @__PURE__ */ new Map());
    this.configuration = {
      ...J,
      ...e
    }, this.api = o, window.pcsExtraData ? (window.pcsExtraData.fetch24HrData = this.fetch24HrData.bind(this), console.log("[Datafeed]: Injected fetch24HrData method into window.pcsExtraData")) : console.warn("[Datafeed]: window.pcsExtraData is not defined, cannot inject fetch24HrData method");
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
      const n = window.pcsExtraData.token0Address, a = window.pcsExtraData.token1Address, s = window.pcsExtraData.fromChainId, c = window.pcsExtraData.toChainId;
      if (!n || !a || !s || !c) {
        console.error("Missing token addresses or chainId in window.pcsExtraData"), t("Missing token information");
        return;
      }
      const r = y(Number(s));
      r ? console.log(
        `Using chain: ${r.name} (${r.displayName}), Chain ID: ${r.chainId}`
      ) : console.warn(`Chain ID ${s} is not supported. Using default BNB Chain (56).`);
      const l = y(Number(c));
      l ? console.log(`Using chain: ${l.name} (${l.displayName}), Chain ID: ${l.chainId}`) : console.warn(`Chain ID ${c} is not supported. Using default BNB Chain (56).`);
      const m = n.slice(-4), f = a.slice(-4), b = `${m}/${f}`, p = {
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
          baseToken: n,
          quoteToken: a,
          fromChainId: s,
          toChainId: c,
          displayName: b,
          fromChainName: (r == null ? void 0 : r.name) || "BNB Smart Chain (BEP20)",
          fromChainDisplayName: (r == null ? void 0 : r.displayName.toLowerCase()) || "BSC",
          toChainName: (l == null ? void 0 : l.name) || "BNB Smart Chain (BEP20)",
          toChainDisplayName: (l == null ? void 0 : l.displayName.toLowerCase()) || "BSC"
        })
      };
      setTimeout(() => {
        o(p);
      }, 0);
    } catch (n) {
      console.error("Error in resolveSymbol:", n), t("Failed to resolve symbol");
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
  getBars(e, o, t, n, a) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: o,
      from: new Date(t.from * 1e3).toISOString(),
      to: new Date(t.to * 1e3).toISOString(),
      countBack: t.countBack
    });
    try {
      const s = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: r, fromChainId: l, toChainId: m } = s;
      if (!c || !r || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), a("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(l), "from"), this.api.setPlatform(Number(m), "to");
      const { from: f, to: b, countBack: p } = t;
      console.log(`[Datafeed]: Fetching prices for base token ${c} and quote token ${r}`), console.warn(`[Datafeed]: tv Resolution: ${o}, cmc Resolution: ${T[o]}`);
      const $ = this.api.getBars("from", c, T[o], f, b, p), S = this.api.getBars("to", r, T[o], f, b, p);
      Promise.all([$, S]).then(([g, E]) => {
        if (!g || g.length === 0 || !E || E.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${f} to=${b}`), n([], { noData: !0 });
          return;
        }
        const D = [], P = /* @__PURE__ */ new Map();
        g.forEach((i) => {
          P.set(i.time, { base: i });
        }), E.forEach((i) => {
          const w = P.get(i.time);
          w ? w.quote = i : P.set(i.time, { quote: i });
        });
        let h = null, u = null;
        P.forEach((i, w) => {
          if (i.base && i.quote) {
            const k = i.base.open / i.quote.open, C = i.base.high / i.quote.high, I = i.base.low / i.quote.low, N = i.base.close / i.quote.close, F = i.base.volume !== void 0 ? i.base.volume : 0, q = i.quote.volume !== void 0 ? i.quote.volume : 0, M = (F + q) / 2, A = Math.max(k, N) * 5, W = Math.min(k, N) / 5;
            (C > A || I < W) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(w).toISOString()}:`, {
              symbol: e.name,
              time: w,
              timeUTC: new Date(w).toUTCString(),
              open: k,
              high: C,
              low: I,
              close: N,
              highToOpenRatio: C / k,
              highToCloseRatio: C / N,
              lowToOpenRatio: I / k,
              lowToCloseRatio: I / N,
              baseToken: {
                open: i.base.open,
                high: i.base.high,
                low: i.base.low,
                close: i.base.close
              },
              quoteToken: {
                open: i.quote.open,
                high: i.quote.high,
                low: i.quote.low,
                close: i.quote.close
              }
            });
            const v = {
              time: w,
              open: k,
              high: C,
              low: I,
              close: N,
              volume: M
            };
            if (h) {
              const x = Math.abs(h.close - v.open), O = x / h.close * 100;
              O > 1 && console.warn(
                `[Datafeed]: Significant gap between bars at ${new Date(h.time).toISOString()} and ${new Date(
                  w
                ).toISOString()}:`,
                {
                  prevClose: h.close,
                  currentOpen: v.open,
                  difference: x,
                  differencePercent: `${O.toFixed(2)}%`,
                  timeDiff: `${(w - h.time) / 1e3 / 60} minutes`,
                  resolution: o,
                  currentData: i,
                  prevData: u
                }
              );
            }
            D.push(v), h = v, u = i;
          }
        }), D.sort((i, w) => i.time - w.time), console.log(`[Datafeed]: Calculated ${D.length} bars for ${e.name}`, {
          firstBar: D.length > 0 ? D[0] : null,
          lastBar: D.length > 0 ? D[D.length - 1] : null
        }), n(D, { noData: D.length === 0 });
      }).catch((g) => {
        console.error("[Datafeed]: Error fetching bars from API:", g), a(`Failed to fetch bars: ${g instanceof Error ? g.message : String(g)}`);
      });
    } catch (s) {
      console.error("[Datafeed]: Error in getBars method:", s), a(`Error processing request: ${s instanceof Error ? s.message : String(s)}`);
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
  subscribeBars(e, o, t, n, a) {
    try {
      const s = JSON.parse(e.long_description || "{}"), { baseToken: c, quoteToken: r, fromChainId: l, toChainId: m } = s;
      if (!c || !r || !l || !m) {
        console.error("[Datafeed]: Missing token information in symbolInfo for WebSocket subscription", e);
        return;
      }
      this.subscriptions.set(n, {
        symbolInfo: e,
        resolution: o,
        onTick: t
      });
      const f = y(Number(l));
      if (!f) {
        console.error(`[Datafeed]: Chain ID ${l} not supported for WebSocket subscription`);
        return;
      }
      const b = y(Number(m));
      if (!b) {
        console.error(`[Datafeed]: Chain ID ${m} not supported for WebSocket subscription`);
        return;
      }
      const p = f.id, $ = b.id;
      this.initWebSocket();
      const S = T[o], g = `datahub@kline@${p}@${c.toLowerCase()}@${S}`, E = `datahub@kline@${$}@${r.toLowerCase()}@${S}`;
      this.ws && this.ws.readyState === WebSocket.OPEN ? (this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [g]
        })
      ), this.ws.send(
        JSON.stringify({
          method: "SUBSCRIPTION",
          params: [E]
        })
      )) : console.warn("[Datafeed]: WebSocket not ready, will try to subscribe when connected");
    } catch (s) {
      console.error("[Datafeed]: Error in subscribeBars:", s);
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
      const { symbolInfo: t, resolution: n } = e;
      try {
        const a = JSON.parse(t.long_description || "{}"), { baseToken: s, quoteToken: c, fromChainId: r, toChainId: l } = a;
        if (!s || !c || !r || !l) {
          console.error(`[Datafeed]: Missing token information for ${o}`);
          return;
        }
        const m = y(Number(r));
        if (!m) {
          console.error(`[Datafeed]: Chain ID ${r} not supported for ${o}`);
          return;
        }
        const f = y(Number(l));
        if (!f) {
          console.error(`[Datafeed]: Chain ID ${l} not supported for ${o}`);
          return;
        }
        const b = m.id, p = f.id, $ = T[n], S = `datahub@kline@${b}@${s.toLowerCase()}@${$}`, g = `datahub@kline@${p}@${c.toLowerCase()}@${$}`;
        this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [S]
          })
        ), this.ws.send(
          JSON.stringify({
            method: "SUBSCRIPTION",
            params: [g]
          })
        );
      } catch (a) {
        console.error(`[Datafeed]: Error resubscribing for ${o}:`, a);
      }
    });
  }
  /**
   * 非同步獲取 24 小時數據並返回計算結果
   * 從 window.pcsExtraData 中獲取代幣地址和鏈 ID
   * @returns 返回計算後的 24 小時數據，包含 high、low、close 和 changes
   */
  async fetch24HrData() {
    try {
      const e = window.pcsExtraData.token0Address, o = window.pcsExtraData.token1Address, t = window.pcsExtraData.fromChainId, n = window.pcsExtraData.toChainId;
      if (!e || !o)
        return console.error("[fetch24HrData]: Missing token addresses"), null;
      console.log(`[Datafeed]: Fetching 24hr data for ${e}/${o}`), this.api.setPlatform(Number(t), "from"), this.api.setPlatform(Number(n), "to");
      const a = await this.api.get24HrData(e, "from"), s = await this.api.get24HrData(o, "to");
      if (!a || !s)
        return console.error("[Datafeed]: Failed to fetch 24hr data"), null;
      const c = a.h / s.h, r = a.l / s.l, l = a.c / s.c, m = a.changes - s.changes;
      return console.log("[Datafeed]: 24hr data calculated:", { high: c, low: r, close: l, changes: m }), { high: c, low: r, close: l, changes: m };
    } catch (e) {
      return console.error("[Datafeed]: Error fetching 24hr data:", e), null;
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
    let t = "";
    const n = o.split("@");
    if (n.length >= 4)
      t = n[3].toLowerCase();
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${o}`);
      return;
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn("[Datafeed]: Invalid price data format:", e.d);
      return;
    }
    const a = e.d.u, s = parseFloat(a[0]), c = parseFloat(a[1]), r = parseFloat(a[2]), l = parseFloat(a[3]), m = parseFloat(a[4]);
    let f = parseFloat(a[5]);
    if (f < 1e10 && (f *= 1e3), isNaN(s) || isNaN(c) || isNaN(r) || isNaN(l) || isNaN(f)) {
      console.warn("[Datafeed]: Invalid price values after parsing:", {
        open: s,
        high: c,
        low: r,
        close: l,
        volume: m,
        timestamp: f
      });
      return;
    }
    const b = {
      o: s,
      h: c,
      l: r,
      c: l,
      v: m,
      t: f
    };
    try {
      this.subscriptions.forEach((p, $) => {
        const { symbolInfo: S, onTick: g } = p, E = JSON.parse(S.long_description || "{}"), { baseToken: D, quoteToken: P } = E;
        if ((t === D.toLowerCase() || t === P.toLowerCase()) && (t === D.toLowerCase() ? p.baseData = b : p.quoteData = b, p.baseData && p.quoteData)) {
          const h = p.baseData, u = p.quoteData;
          if (Math.abs(h.t - u.t) <= 1e3) {
            if (!isFinite(h.o) || h.o <= 0 || !isFinite(h.h) || h.h <= 0 || !isFinite(h.l) || h.l <= 0 || !isFinite(h.c) || h.c <= 0 || !isFinite(u.o) || u.o <= 0 || !isFinite(u.h) || u.h <= 0 || !isFinite(u.l) || u.l <= 0 || !isFinite(u.c) || u.c <= 0) {
              console.error(`[Datafeed]: Invalid price data for ${S.name}, skipping update`);
              return;
            }
            const i = h.o / u.o, w = h.h / u.h, k = h.l / u.l, C = h.c / u.c, I = (h.v + u.v) / 2;
            if (!isFinite(i) || !isFinite(w) || !isFinite(k) || !isFinite(C) || !isFinite(I)) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${S.name}:`, {
                open: i,
                high: w,
                low: k,
                close: C,
                volume: I
              });
              return;
            }
            const N = {
              time: h.t,
              open: i,
              high: w,
              low: k,
              close: C,
              volume: I
            };
            p.lastBar = N, g(N);
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
class j {
  constructor(e = {}) {
    B(this, "config");
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
    const t = y(e);
    t ? (o === "from" ? this.config.fromPlatform = t.displayName.toLowerCase() : this.config.toPlatform = t.displayName.toLowerCase(), console.log(`set platform: ${t.name} (ID: ${t.id}, ChainId: ${e})`)) : (o === "from" ? this.config.fromPlatform = "bsc" : this.config.toPlatform = "bsc", console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`));
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
      const n = await fetch(t.toString());
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
      const [t, n, a, s, c, r] = o;
      return {
        time: r,
        // 時間戳 (毫秒)
        open: t,
        high: n,
        low: a,
        close: s,
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
    const o = T[e];
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
  async getBars(e, o, t, n, a, s) {
    try {
      const c = this.convertResolution(t), r = await this.getKLineData(
        {
          address: o,
          interval: c,
          from: n * 1e3,
          // 轉換為毫秒
          to: a * 1e3,
          // 轉換為毫秒
          limit: s
        },
        e
      );
      if (r.status.error_code !== "0")
        throw new Error(`API error: ${r.status.error_message}`);
      return this.convertToTradingViewBars(r.data);
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
      const t = Math.floor(Date.now() / 1e3), n = t - 24 * 60 * 60, a = await this.getBars(o, e, "60", n, t, 24);
      if (!a || a.length === 0)
        throw new Error(`No data available for token ${e}`);
      let s = -1 / 0, c = 1 / 0;
      a.forEach((f) => {
        f.high > s && (s = f.high), f.low < c && (c = f.low);
      });
      const r = a[a.length - 1].close, l = a[0].open, m = (r - l) / l * 100;
      return {
        h: s,
        l: c,
        c: r,
        changes: m
      };
    } catch (t) {
      throw console.error("Failed to get 24hr data:", t), t;
    }
  }
}
const U = (d) => new j(d);
function K(d, e) {
  const o = e || U();
  return new H(d, o);
}
function G(d, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.pcsExtraData = window.pcsExtraData || {}, window.pcsExtraData.token0Address = window.pcsExtraData.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.pcsExtraData.token1Address = window.pcsExtraData.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.pcsExtraData.fromChainId = window.pcsExtraData.fromChainId || 56, window.pcsExtraData.toChainId = window.pcsExtraData.toChainId || 56;
  const o = window.pcsExtraData.fromChainId, t = window.pcsExtraData.toChainId, n = y(o), a = y(t);
  n ? console.log(
    `Using blockchain: ${n.name} (${n.displayName}), Chain ID: ${n.chainId}`
  ) : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`), a ? console.log(`Using blockchain: ${a.name} (${a.displayName}), Chain ID: ${a.chainId}`) : console.warn(`Chain ID ${t} is not supported. Using default BNB Chain (56).`);
  const s = U(), l = {
    ...{
      symbol: "WBNB/CAKE",
      // 顯示名稱，實際數據來自 window.TradingView 中的代幣地址
      interval: "15",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: K({}, s),
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
    const n = document.createElement("script");
    n.src = `${d}charting_library.standalone.js`, n.async = !0, n.onload = () => {
      const a = document.createElement("script");
      a.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, a.async = !0, a.onload = () => {
        o({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, a.onerror = () => t(new Error("Failed to load Datafeeds library")), document.head.appendChild(a);
    }, n.onerror = () => t(new Error("Failed to load TradingView library")), document.head.appendChild(n);
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
  CHAIN_ID_MAP: _,
  getChainInfoByChainId: y
};
export {
  G as createTradingViewWidget,
  ee as default,
  Y as getDatafeeds,
  Q as getTradingView,
  X as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
