/**
 * Common APR data structure used across position tables
 */
export interface AprData {
  lpApr: number | string
  cakeApr: { value: number | string } | null
  merklApr: number
}

/**
 * Converts APR data to numbers for calculations
 * Used across InfinityCL, V3, and Bin position tables
 */
export const convertAprDataToNumbers = (aprData: {
  lpApr?: number | string
  cakeApr?: { value: number | string } | null
  merklApr?: number
}): AprData => {
  return {
    lpApr: parseFloat((aprData.lpApr || '0').toString()),
    cakeApr: aprData.cakeApr ? { value: parseFloat((aprData.cakeApr.value || '0').toString()) } : null,
    merklApr: aprData.merklApr || 0,
  }
}

/**
 * Calculates total APR from individual APR components
 * Common calculation used across all position tables
 */
export const calculateTotalApr = (aprData: AprData): number => {
  const lpApr = typeof aprData.lpApr === 'string' ? parseFloat(aprData.lpApr) : aprData.lpApr
  const cakeApr = aprData.cakeApr
    ? typeof aprData.cakeApr.value === 'string'
      ? parseFloat(aprData.cakeApr.value)
      : aprData.cakeApr.value
    : 0
  const merklApr = aprData.merklApr || 0

  return Number(lpApr || 0) + Number(cakeApr || 0) + Number(merklApr || 0)
}
