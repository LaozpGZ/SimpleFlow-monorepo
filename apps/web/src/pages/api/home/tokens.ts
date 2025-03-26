import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { queryTokens } from './queries/queryTokens'

async function _load() {
  return queryTokens()
}
export const loadHomePageData = cacheByLRU(_load, {
  ttl: 300 * 1000, // 5 minutes
  persist: {
    name: 'tokens',
    type: 'r2',
    version: 'v3',
  },
})

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')
  const data = await loadHomePageData()
  return res.status(200).json(data)
}

export default handler
