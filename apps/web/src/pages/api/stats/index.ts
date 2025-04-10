import { NextApiHandler } from 'next'
import { getBurnTimeSeries } from 'utils/stats/burnTimeSeries'
import { getDeflationTimeSeries } from 'utils/stats/deflationTimeSeries'
import { getMintTimeSeries } from 'utils/stats/mintTimeSeries'
import { getTotalSupplyMintBurn } from 'utils/stats/totalSupplyMintBurn'
import { getTotalSupplyTimeSeries } from 'utils/stats/totalSupplyTimeSeries'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [totalSupplyMintBurn, totalSupplyTimeSeries, deflationTimeSeries, burnTimeSeries, mintTimeSeries] =
      await Promise.all([
        getTotalSupplyMintBurn(),
        getTotalSupplyTimeSeries(),
        getDeflationTimeSeries(),
        getBurnTimeSeries(),
        getMintTimeSeries(),
      ])

    const result = {
      timestamp: totalSupplyMintBurn.timestamp,
      ...totalSupplyMintBurn.data,
      totalSupplyTimeSeries: totalSupplyTimeSeries.data,
      deflationTimeSeries: deflationTimeSeries.data,
      burnTimeSeries: burnTimeSeries.data,
      mintTimeSeries: mintTimeSeries.data,
    }

    // Cache response for a day
    // res.setHeader('Cache-Control', 's-maxage=86400')

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default handler
