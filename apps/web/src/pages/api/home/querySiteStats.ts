import { SiteStats } from './types'

export async function querySiteStats() {
  return {
    allTimeLPFees: 16_000_000,
    allTimeTraders: 2_800_000_000,
    allTimeTv: 1_500_000_000,
    community: 2_000_000,
  } as SiteStats
}
