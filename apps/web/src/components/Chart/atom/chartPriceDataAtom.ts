import { atom } from 'jotai'

export interface ChartPriceData {
  price: number
  priceChangePercent: number
  high24h: number
  low24h: number
}

export const chartPriceDataAtom = atom<ChartPriceData>({
  price: 0,
  priceChangePercent: 0,
  high24h: 0,
  low24h: 0,
})
