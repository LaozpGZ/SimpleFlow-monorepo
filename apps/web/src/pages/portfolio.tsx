import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { NonEVMChainId } from '@pancakeswap/chains'
import dynamic from 'next/dynamic'

const Portfolio = dynamic(() => import('views/Portfolio').then((mod) => mod.Portfolio), {
  ssr: false,
})

const PortfolioPage = () => {
  return <Portfolio />
}

PortfolioPage.chains = [...SUPPORT_FARMS, NonEVMChainId.SOLANA]

export default PortfolioPage
