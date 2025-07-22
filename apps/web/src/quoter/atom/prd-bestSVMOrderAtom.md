# Untitled

### 1. High-level flow `bestSVMOrderAtom`

Implement `bestSVMOrderAtom` getting quote. Input will be `QuoteQuery` , Output will be **`InterfaceOrder`** 

Reference: 

 `apps/solana/src/features/Swap/useSwap.ts`  

`bestSameChainWithoutPlaceHolderAtom`

`bridgeOnlyQuoteAtom`

### 2. Implementation Details

### 2.1 Handle Input

- Translate `QuoteRequest` → `QuoteQuery` so callers can use either vocabulary.

| QuoteRequest  | QuoteQuery |
| --- | --- |
| `inputMint: string` | `baseCurrency: Currency` |
| `outputMint: string` | `currency: Currency` |
| `amount: string` | `amount: CurrencyAmount` |
| `slippageBps: string` | `slippage: number` |
| `swapType: 'exactIn' | 'exactOut'` | `tradeType: EXACT_INPUT | EXACT_OUTPUT` |

### 2.2 Handle Implementation

- **SVM:** Call `sol‑quoter‑service /api/quote`  like in `useSwap` but using `fetch` instead of useSWR

### 2.3 Handle Output

Return a **superset of `InterfaceOrder`** that both chains can fill:

- Add `SVMOrder` with `OrderType.PCS_SVM` for Solana quotes.

```jsx
type SVMOrder<tradeType extends TradeType = TradeType> = {
  type: OrderType.PCS_SVM
  trade: SVMTrade<tradeType>
}
```

- Extend `SmartRouterTrade` → `SVMOrderTrade`, keeping `routers: Route[]` but embedding `QuoteResponseData` for SVM specifics.

**Convert QuoteResponseData → SVMOrderTrade**

```jsx
type SVMOrderTrade<inputCurrency, outputCurrency> = {
  tradeType: TradeType
  inputAmount: CurrencyAmount<input>
  outputAmount: CurrencyAmount<output>
  priceImpact: null
  routes: SVMRoute[]
  routeStats: RouteStats
  quoteQueryHash?: string
}
```

- Normalize fields so UI components can still render:
    - Input / output amounts
    - Quote & route details
    - Price impact

### 3. SVM‑Specific Structures

- **`SVMRoute`:** Derived from `RoutePlanItem` plus `Pool` metadata; `routeIndex` groups pools that belong to the same path.

```jsx
type SVMRoute {
  type: RouteType.SVM
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  pools: SVMPool[]
  path: Currency[]
  percent: number
  amount: CurrencyAmount<Currency>
  routeIndex: number
}
```

```jsx
type SVMPool {
  type: PoolType.SVM
  id: string
  feeAmount: string
  feeRate: number
}
```

- **`RouteStats`:** Extra analytics returned only by SVM; downstream callers must tolerate its presence.

```jsx
type RouteStats = {
  numSubRoutes: number
  totalHops: number
  avgHopsPerRoute: number
}
```

---