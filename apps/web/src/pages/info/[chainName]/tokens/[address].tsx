import { Flex, Spinner } from '@pancakeswap/uikit'
import { GetStaticPaths, GetStaticProps } from 'next'
import { Suspense } from 'react'
import { getTokenStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/Info'
import Token from 'views/Info/Tokens/TokenPage'

const TokenPage = ({ address }: { address: string }) => {
  if (!address) {
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
      <Token routeAddress={address.toLowerCase()} />
    </Suspense>
  )
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = []

export default TokenPage

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()

export const getStaticProps: GetStaticProps = getTokenStaticProps()
