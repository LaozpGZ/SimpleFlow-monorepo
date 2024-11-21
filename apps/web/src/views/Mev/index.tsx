import { useEffect } from 'react'
import { styled } from 'styled-components'
import { Hero } from './Hero'
import { InfoSection } from './InfoSection'
import { MevIntroSection } from './MevIntroSection'

export const Wrapper = styled.div``

const fetchRPCData = async (method: 'stat_txCount' | 'stat_walletCount') => {
  const url = 'https://bscrpc.pancakeswap.finance'
  const payload = {
    jsonrpc: '2.0',
    method,
    params: [],
    id: 83,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('RPC Response:', data)

    // Extract the result if needed
    const walletCount = data.result
    console.log('Wallet Count:', walletCount)
  } catch (error) {
    console.error('Error fetching RPC data:', error)
  }
}

export const MevLanding: React.FC = () => {
  useEffect(() => {
    fetchRPCData('stat_txCount')
  }, [])
  return (
    <Wrapper>
      <Hero />
      <MevIntroSection />
      <InfoSection />
    </Wrapper>
  )
}
