import { NextApiHandler } from 'next'
import { getBurnHistoryTable } from 'utils/stats/burnHistoryTable'
import { getBurnTimeSeries } from 'utils/stats/burnTimeSeries'
import { getDeflationTimeSeries } from 'utils/stats/deflationTimeSeries'
import { getMintTimeSeries } from 'utils/stats/mintTimeSeries'
import { getTotalSupplyMintBurn } from 'utils/stats/totalSupplyMintBurn'
import { getTotalSupplyTimeSeries } from 'utils/stats/totalSupplyTimeSeries'
import { BurnStats } from 'views/BurnDashboard/types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [
      totalSupplyMintBurn,
      totalSupplyTimeSeries,
      deflationTimeSeries,
      burnTimeSeries,
      mintTimeSeries,
      burnHistoryTable,
    ] = await Promise.all([
      getTotalSupplyMintBurn(),
      getTotalSupplyTimeSeries(),
      getDeflationTimeSeries(),
      getBurnTimeSeries(),
      getMintTimeSeries(),
      getBurnHistoryTable(),
    ])

    const result: Partial<BurnStats> = {
      // Use the earliest timestamp of all data
      timestamp: Math.min(
        totalSupplyMintBurn.timestamp,
        totalSupplyTimeSeries.timestamp,
        deflationTimeSeries.timestamp,
        burnTimeSeries.timestamp,
        mintTimeSeries.timestamp,
        burnHistoryTable.timestamp,
      ),
      ...totalSupplyMintBurn.data,
      totalSupplyTimeSeries: totalSupplyTimeSeries.data,
      deflationTimeSeries: deflationTimeSeries.data,
      burnTimeSeries: burnTimeSeries.data,
      mintTimeSeries: mintTimeSeries.data,
      burnHistoryTable: burnHistoryTable.data,
    }

    // Cache response for a day
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `An error occurred while fetching burn statistics ${error}` })
  }
}

export default handler
