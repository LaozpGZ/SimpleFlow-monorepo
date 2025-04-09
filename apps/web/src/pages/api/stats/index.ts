import { NextApiHandler } from 'next'
import { getDeflationTimeSeries } from 'utils/stats/deflationTimeSeries'
import { getTotalSupplyMintBurn } from 'utils/stats/totalSupplyMintBurn'
import { getTotalSupplyTimeSeries } from 'utils/stats/totalSupplyTimeSeries'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [totalSupplyMintBurn, totalSupplyTimeSeries, deflationTimeSeries] = await Promise.all([
      getTotalSupplyMintBurn(),
      getTotalSupplyTimeSeries(),
      getDeflationTimeSeries(),
    ])

    const result = {
      timestamp: totalSupplyMintBurn.timestamp,
      ...totalSupplyMintBurn.data,
      totalSupplyTimeSeries: totalSupplyTimeSeries.data,
      deflationTimeSeries: deflationTimeSeries.data,
    }

    // Data is updated every Week
    // const CACHE_DURATION = 60 * 60 * 24 * 7 // 1 week
    // const lastUpdatedAt = Object.values(result).reduce((prev, curr) => Math.max(prev, curr.timestamp), 0)

    // console.log('API Cache duration', resultCacheDuration)

    // // Set cache to expire at the next Monday
    // res.setHeader('Cache-Control', `s-maxage=${resultCacheDuration}`)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default handler
