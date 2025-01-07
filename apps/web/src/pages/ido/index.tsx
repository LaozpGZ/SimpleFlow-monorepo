import { ChainId } from '@pancakeswap/chains'
import IDo from '../../views/Idos/ido'
import { IfoPageLayout } from '../../views/Ifos'

const IDO_SUPPORT_CHAINS = [ChainId.BSC]

const CurrentIfoPage = () => {
  return <IDo />
}

CurrentIfoPage.Layout = IfoPageLayout

CurrentIfoPage.chains = IDO_SUPPORT_CHAINS

export default CurrentIfoPage
