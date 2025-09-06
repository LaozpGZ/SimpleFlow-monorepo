import { atom } from 'jotai'
import currencyId from 'utils/currencyId'
import { inputCurrencyAtom, outputCurrencyAtom } from './currency/currencyAtoms'
import { supportedPoolsListAtom } from './poolsListAtom'

export const selectedPoolAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const idA = currencyId(inputCurrency)
  const idB = currencyId(outputCurrency)

  const pools = await get(supportedPoolsListAtom)
  const pool = pools.find(
    (pool) =>
      pool.chainId === inputCurrency.chainId &&
      ((pool.currency0 === idA && pool.currency1 === idB) || (pool.currency0 === idB && pool.currency1 === idA)),
  )

  return pool
})
