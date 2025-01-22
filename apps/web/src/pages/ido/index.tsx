import { ChainId } from '@pancakeswap/chains'
import { IdoPageLayout } from '../../views/Idos'
import IDo from '../../views/Idos/ido'

const IDO_SUPPORT_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET]

const CurrentIdoPage = () => {
  return <IDo />
}

CurrentIdoPage.Layout = IdoPageLayout

CurrentIdoPage.chains = IDO_SUPPORT_CHAINS

CurrentIdoPage.mp = true

export default CurrentIdoPage
