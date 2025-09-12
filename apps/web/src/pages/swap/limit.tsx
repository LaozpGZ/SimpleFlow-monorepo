import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import { useIsSmartAccount } from 'hooks/useIsSmartAccount'
import Page from 'views/Page'
import SwapLayout from 'views/Swap/SwapLayout'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { isTwapSupported } from 'views/Swap/utils'

const TwapAndLimitSwap = dynamic(() => import('views/Swap/Twap/TwapSwap'), { ssr: false })

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Page showExternalLink={false} showHelpLink={false}>
      {children}
    </Page>
  )
}

const View = () => {
  const router = useRouter()
  const isSmartAccount = useIsSmartAccount()
  const { chainId } = useActiveChainId()

  useEffect(() => {
    if (isSmartAccount || !isTwapSupported(chainId)) {
      router.replace('/swap')
    }
  }, [isSmartAccount, router, chainId])

  if (isSmartAccount || !isTwapSupported(chainId)) {
    return null
  }

  return (
    <SwapLayout>
      <TwapAndLimitSwap limit />
    </SwapLayout>
  )
}
const LimitPage = dynamic(() => Promise.resolve(View), {
  ssr: false,
}) as NextPageWithLayout

LimitPage.chains = CHAIN_IDS
LimitPage.screen = true
LimitPage.Layout = Layout

export default LimitPage
