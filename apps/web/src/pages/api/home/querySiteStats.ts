import { SiteStats } from './types'

export async function querySiteStats() {
  return {
    allTimeLPFees: 176_370_000,
    allTimeTraders: 117_000_000,
    allTimeTv: 1_200_000_000_000,
    community: 2000000,
  } as SiteStats
}
