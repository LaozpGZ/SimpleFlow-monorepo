import { NextApiHandler } from 'next'

type TokenPrice = {
  id: string
  symbol: string
  price: number
}
interface HomePageFigures {
  supportedChains: []
  prices: TokenPrice[]
}

const tokens: TokenPrice[] = [
  {
    id: '56-0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    symbol: 'BTC',
    price: 0,
  },
  {
    id: '56-0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    symbol: 'ETH',
    price: 0,
  },
  {
    id: '56-0x55d398326f99059ff775485246999027b3197955',
    symbol: 'XRP',
    price: '',
  },
]

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')

  return res.status(200).json({
    ok: true,
  })
}

export default handler
