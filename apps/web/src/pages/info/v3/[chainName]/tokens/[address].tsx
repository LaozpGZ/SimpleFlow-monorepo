import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Suspense } from 'react'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const Token = dynamic(() => import('views/V3Info/views/TokenPage'), { ssr: false })

const TokenPage = () => {
  const router = useRouter()
  const { address, chainName } = router.query

  if (!address || !chainName) {
    return null
  }

  return (
    <Suspense
      fallback={
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      }
    >
      <Token address={String(address).toLowerCase()} chain={String(chainName)} />
    </Suspense>
  )
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = [] // set all

export default TokenPage
