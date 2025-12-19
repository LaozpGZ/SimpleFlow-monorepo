import { CAKE, USDC } from '@pancakeswap/tokens'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { isAddressEqual } from 'utils'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import IncreaseLiquidityV3 from 'views/AddLiquidityV3/IncreaseLiquidityV3'
import LiquidityFormProvider from 'views/AddLiquidityV3/formViews/V3FormView/form/LiquidityFormProvider'

const IncreaseLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()

  const native = useNativeCurrency()

  const [currencyIdA, currencyIdB] =
    !router.isReady || !chainId
      ? [undefined, undefined]
      : router.query.currency || [native.symbol, CAKE[chainId]?.address ?? USDC[chainId]?.address]

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  if (!router || !router.isReady) return null

  const currency = (router.query.currency as string[]) || []
  const [curA, curB, feeAmountFromUrl, tokenId] = currency
  const match = curA?.match(OLD_PATH_STRUCTURE)

  if (match?.length) {
    router.replace(`/add/${match[1]}/${match[2]}`)
    return null
  }

  if (curA && curB && isAddressEqual(curA, curB)) {
    router.replace(`/add/${curA}`)
    return null
  }

  if (!(feeAmountFromUrl as string)?.match(IS_NUMBER_REG) || !(tokenId as string)?.match(IS_NUMBER_REG)) {
    router.replace('/add')
    return null
  }

  return (
    <LiquidityFormProvider>
      <IncreaseLiquidityV3 currencyA={currencyA} currencyB={currencyB} />
    </LiquidityFormProvider>
  )
}
const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|BNB)-(0x[a-fA-F0-9]{40}|BNB)$/
const IS_NUMBER_REG = /^\d+$/

const Page = dynamic(() => Promise.resolve(IncreaseLiquidityPage), { ssr: false }) as NextPageWithLayout

Page.chains = CHAIN_IDS
Page.screen = true

export default Page
