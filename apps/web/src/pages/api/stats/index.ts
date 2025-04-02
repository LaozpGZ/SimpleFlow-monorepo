import { NextApiHandler } from 'next'
import {
  getCirculatingSupply,
  getNetMintCumulative,
  getNetMintWeekly,
  getWeeklyBurnBreakdown,
  getWeeklyTotalBurn,
} from 'utils/stats'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [netMintWeekly, netMintCumulative, circulatingSupply, weeklyTotalBurn, weeklyBurnBreakdown] =
      await Promise.all([
        getNetMintWeekly(),
        getNetMintCumulative(),
        getCirculatingSupply(),
        getWeeklyTotalBurn(),
        getWeeklyBurnBreakdown(),
      ])

    const result = {
      netMintWeekly,
      netMintCumulative,
      circulatingSupply,
      weeklyTotalBurn,
      weeklyBurnBreakdown,
    }

    // Data is updated every Week by Monday
    const CACHE_DURATION = 60 * 60 * 24 * 7 // 1 week
    const lastUpdatedAt = Object.values(result).reduce((prev, curr) => Math.max(prev, curr.timestamp), 0)

    // Seconds until the next monday
    const now = new Date()
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7))
    // TODO: Check with ButterBeer on when exactly we update
    nextMonday.setHours(0, 0, 0, 0)
    const secondsUntilNextMonday = Math.floor((nextMonday.getTime() - now.getTime()) / 1000)
    const secondsSinceLastUpdated = Math.floor((now.getTime() - lastUpdatedAt) / 1000)
    const secondsUntilNextUpdate = Math.max(0, secondsUntilNextMonday - secondsSinceLastUpdated)

    const resultCacheDuration = Math.min(CACHE_DURATION, secondsUntilNextUpdate)

    console.log('API Cache duration', resultCacheDuration)

    // Set cache to expire at the next Monday
    res.setHeader('Cache-Control', `s-maxage=${resultCacheDuration}`)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default handler
