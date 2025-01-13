import { bscTokens } from '@pancakeswap/tokens'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useFetchIfo } from 'state/pools/hooks'

import ComingSoonSection from './components/ComingSoonSection'
import IfoContainer from './components/IfoContainer'
import IfoSteps from './components/IfoSteps'

const SoonIfo = () => {
  useFetchIfo()
  const { chainId } = useActiveChainId()

  return (
    <IfoContainer
      ifoSection={<ComingSoonSection />}
      ifoSteps={
        <IfoSteps isLive={false} hasClaimed={false} isCommitted={false} ifoCurrencyAddress={bscTokens.cake.address} />
      }
    />
  )
}

export default SoonIfo
