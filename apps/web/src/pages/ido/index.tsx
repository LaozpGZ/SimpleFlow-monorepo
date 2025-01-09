import { ChainId } from '@pancakeswap/chains'
import { IdoPageLayout } from '../../views/Idos'
import IDo from '../../views/Idos/ido'

const IDO_SUPPORT_CHAINS = [ChainId.BSC]

const CurrentIfoPage = () => {
  return <IDo />
}

CurrentIfoPage.Layout = IdoPageLayout

CurrentIfoPage.chains = IDO_SUPPORT_CHAINS

export default CurrentIfoPage
