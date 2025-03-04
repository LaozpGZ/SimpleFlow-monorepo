import { Flex, Spinner } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { Suspense, useEffect } from 'react'
import { invalidAddressCheck } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/Info'
import Token from 'views/Info/Tokens/TokenPage'

const TokenPage = () => {
  const router = useRouter()
  const { address } = router.query

  useEffect(() => {
    if (!address || invalidAddressCheck(address)) {
      router.replace('/')
    }
  }, [address, router])

  if (invalidAddressCheck(String(address))) {
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
      <Token routeAddress={String(address).toLowerCase()} />
    </Suspense>
  )
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = []

export default TokenPage
