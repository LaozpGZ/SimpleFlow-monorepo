import { useQuery } from '@tanstack/react-query'

interface BurnStats {
  timestamp: number
  total_supply: number
  total_burn: number
  total_mint: number
  weekly_burn: number
  weekly_mint: number
  weekly_new_supply: number
  totalSupplyTimeSeries: {
    timestamp: number
    total_supply: number
  }[]
  deflationTimeSeries: {
    timestamp: number
    deflation: number
  }[]
  burnTimeSeries: {
    timestamp: number
    burn: number
    product: string
  }[]
}

export const useBurnStats = () => {
  return useQuery<BurnStats>({
    queryKey: ['burnStats'],
    queryFn: async () => {
      const response = await fetch('/api/stats')
      if (!response.ok) {
        throw new Error('Error while fetching burn statistics')
      }
      return response.json()
    },
  })
}
