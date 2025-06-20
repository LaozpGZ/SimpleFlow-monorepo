var R = Object.defineProperty;
var F = (o, e, n) => e in o ? R(o, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : o[e] = n;
var k = (o, e, n) => F(o, typeof e != "symbol" ? e + "" : e, n);
function L(o) {
  return o;
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
  }
};
Object.values(v).reduce((o, e) => (o[e.id] = e, o), {});
function _(o) {
  return v[o];
}
const z = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"], I = {
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
}, K = {
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
class W {
  constructor(e = {}, n) {
    k(this, "configuration");
    k(this, "api");
    this.configuration = {
      ...K,
      ...e
    }, this.api = n;
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
  resolveSymbol(e, n, t) {
    console.log("[Datafeed]: resolveSymbol() called with", e);
    try {
      const s = window.TradingView.token0Address, r = window.TradingView.token1Address, c = window.TradingView.chainId;
      if (!s || !r || !c) {
        console.error("Missing token addresses or chainId in window.TradingView"), t("Missing token information");
        return;
      }
      const i = _(Number(c));
      i ? console.log(`Using chain: ${i.name} (${i.displayName}), Chain ID: ${i.chainId}`) : console.warn(`Chain ID ${c} is not supported. Using default BNB Chain (56).`);
      const m = s.slice(-4), D = r.slice(-4), w = `${m}/${D}`, f = {
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
        pricescale: 100,
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
          baseToken: s,
          quoteToken: r,
          chainId: c,
          displayName: w,
          chainName: (i == null ? void 0 : i.name) || "BNB Smart Chain (BEP20)",
          chainDisplayName: (i == null ? void 0 : i.displayName) || "BSC"
        })
      };
      setTimeout(() => {
        n(f);
      }, 0);
    } catch (s) {
      console.error("Error in resolveSymbol:", s), t("Failed to resolve symbol");
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
  getBars(e, n, t, s, r) {
    console.log("[Datafeed]: getBars() called with", {
      symbol: e.name,
      resolution: n,
      from: new Date(t.from * 1e3).toISOString(),
      to: new Date(t.to * 1e3).toISOString(),
      countBack: t.countBack
    });
    try {
      const c = JSON.parse(e.long_description || "{}"), { baseToken: i, quoteToken: m, chainId: D } = c;
      if (!i || !m || !D) {
        console.error("[Datafeed]: Missing token information in symbolInfo", e), r("Missing token information in symbol");
        return;
      }
      this.api.setPlatform(Number(D));
      const { from: w, to: f, countBack: C } = t;
      console.log(`[Datafeed]: Fetching prices for base token ${i} and quote token ${m}`), console.warn(`[Datafeed]: tv Resolution: ${n}, cmc Resolution: ${I[n]}`);
      const P = this.api.getBars(i, I[n], w, f, C), E = this.api.getBars(m, I[n], w, f, C);
      Promise.all([P, E]).then(([h, B]) => {
        if (!h || h.length === 0 || !B || B.length === 0) {
          console.log(`[Datafeed]: No data for ${e.name} from=${w} to=${f}`), s([], { noData: !0 });
          return;
        }
        const d = [], S = /* @__PURE__ */ new Map();
        h.forEach((a) => {
          S.set(a.time, { base: a });
        }), B.forEach((a) => {
          const l = S.get(a.time);
          l ? l.quote = a : S.set(a.time, { quote: a });
        });
        let p = null, N = null;
        S.forEach((a, l) => {
          if (a.base && a.quote) {
            const u = a.base.open / a.quote.open, b = a.base.high / a.quote.high, y = a.base.low / a.quote.low, g = a.base.close / a.quote.close, O = a.base.volume !== void 0 ? a.base.volume : 0, A = a.quote.volume !== void 0 ? a.quote.volume : 0, q = (O + A) / 2, M = Math.max(u, g) * 5, x = Math.min(u, g) / 5;
            (b > M || y < x) && console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(l).toISOString()}:`, {
              symbol: e.name,
              time: l,
              timeUTC: new Date(l).toUTCString(),
              open: u,
              high: b,
              low: y,
              close: g,
              highToOpenRatio: b / u,
              highToCloseRatio: b / g,
              lowToOpenRatio: y / u,
              lowToCloseRatio: y / g,
              baseToken: {
                open: a.base.open,
                high: a.base.high,
                low: a.base.low,
                close: a.base.close
              },
              quoteToken: {
                open: a.quote.open,
                high: a.quote.high,
                low: a.quote.low,
                close: a.quote.close
              }
            });
            const T = {
              time: l,
              open: u,
              high: b,
              low: y,
              close: g,
              volume: q
            };
            if (p) {
              const $ = Math.abs(p.close - T.open), U = $ / p.close * 100;
              U > 1 && console.warn(
                `[Datafeed]: Significant gap between bars at ${new Date(p.time).toISOString()} and ${new Date(
                  l
                ).toISOString()}:`,
                {
                  prevClose: p.close,
                  currentOpen: T.open,
                  difference: $,
                  differencePercent: `${U.toFixed(2)}%`,
                  timeDiff: `${(l - p.time) / 1e3 / 60} minutes`,
                  resolution: n,
                  currentData: a,
                  prevData: N
                }
              );
            }
            d.push(T), p = T, N = a;
          }
        }), d.sort((a, l) => a.time - l.time), console.log(`[Datafeed]: Calculated ${d.length} bars for ${e.name}`, {
          firstBar: d.length > 0 ? d[0] : null,
          lastBar: d.length > 0 ? d[d.length - 1] : null
        }), s(d, { noData: d.length === 0 });
      }).catch((h) => {
        console.error("[Datafeed]: Error fetching bars from API:", h), r(`Failed to fetch bars: ${h instanceof Error ? h.message : String(h)}`);
      });
    } catch (c) {
      console.error("[Datafeed]: Error in getBars method:", c), r(`Error processing request: ${c instanceof Error ? c.message : String(c)}`);
    }
  }
  /**
   * 訂閱實時數據
   * 這是一個佔位方法，後續會實現
   */
  subscribeBars(e, n, t, s, r) {
    console.log("[Datafeed]: subscribeBars() called with", s);
  }
  /**
   * 取消訂閱實時數據
   * 這是一個佔位方法，後續會實現
   */
  unsubscribeBars(e) {
    console.log("[Datafeed]: unsubscribeBars() called with", e);
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
    k(this, "config");
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
    const n = _(e);
    n ? (this.config.platform = n.id, console.log(`set platform: ${n.name} (ID: ${n.id}, ChainId: ${e})`)) : (this.config.platform = 14, console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`));
  }
  /**
   * 獲取K線數據
   * @param params - K線參數
   */
  async getKLineData(e) {
    const n = new URL("/u-kline/v1/k-line/candles", this.config.baseUrl);
    n.searchParams.append("platform", this.config.platform.toString()), n.searchParams.append("address", e.address), n.searchParams.append("interval", e.interval), e.limit && n.searchParams.append("limit", e.limit.toString()), e.from && n.searchParams.append("from", e.from.toString()), e.to && n.searchParams.append("to", e.to.toString());
    try {
      const t = await fetch(n.toString());
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
    return e.map((n) => {
      const [t, s, r, c, i, m] = n;
      return {
        time: m,
        // 時間戳 (毫秒)
        open: t,
        high: s,
        low: r,
        close: c,
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
    const n = I[e];
    return n ? {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "30m": "30min",
      "1h": "1h",
      "4h": "4h",
      "1d": "1d",
      "1w": "1w",
      "1M": "1M"
    }[n] || "5min" : (console.warn(`未知的解析度: ${e}，使用默認值 5min`), "5min");
  }
  async getBars(e, n, t, s, r) {
    try {
      const c = this.convertResolution(n), i = await this.getKLineData({
        address: e,
        interval: c,
        from: t * 1e3,
        // 轉換為毫秒
        to: s * 1e3,
        // 轉換為毫秒
        limit: r
      });
      if (i.status.error_code !== "0")
        throw new Error(`API error: ${i.status.error_message}`);
      return this.convertToTradingViewBars(i.data);
    } catch (c) {
      throw console.error("Failed to get bars:", c), c;
    }
  }
}
const V = (o) => new j(o);
function G(o, e) {
  const n = e || V();
  return new W(o, n);
}
function J(o, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error(
      "TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."
    ), null;
  window.TradingView = window.TradingView || {}, window.TradingView.token0Address = window.TradingView.token0Address || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", window.TradingView.token1Address = window.TradingView.token1Address || "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", window.TradingView.chainId = window.TradingView.chainId || 56;
  const n = window.TradingView.chainId, t = _(n);
  t ? console.log(`Using blockchain: ${t.name} (${t.displayName}), Chain ID: ${t.chainId}`) : console.warn(`Chain ID ${n} is not supported. Using default BNB Chain (56).`);
  const s = V(), i = {
    ...{
      symbol: "WBNB/CAKE",
      // 顯示名稱，實際數據來自 window.TradingView 中的代幣地址
      interval: "15",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: G({}, s),
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
    container: typeof o == "string" ? o : o.id
  };
  return new window.TradingView.widget(i);
}
function H(o = "https://assets.pcswap.org/web/charts/charting_library/", e = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((n, t) => {
    const s = document.createElement("script");
    s.src = `${o}charting_library.standalone.js`, s.async = !0, s.onload = () => {
      const r = document.createElement("script");
      r.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, r.async = !0, r.onload = () => {
        n({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, r.onerror = () => t(new Error("Failed to load Datafeeds library")), document.head.appendChild(r);
    }, s.onerror = () => t(new Error("Failed to load TradingView library")), document.head.appendChild(s);
  });
}
function X() {
  return window.TradingView;
}
function Q() {
  return window.Datafeeds;
}
const Z = {
  createTradingViewWidget: J,
  loadTradingViewLibrary: H,
  getTradingView: X,
  getDatafeeds: Q,
  CHAIN_ID_MAP: v,
  getChainInfoByChainId: _
};
export {
  J as createTradingViewWidget,
  Z as default,
  Q as getDatafeeds,
  X as getTradingView,
  H as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
