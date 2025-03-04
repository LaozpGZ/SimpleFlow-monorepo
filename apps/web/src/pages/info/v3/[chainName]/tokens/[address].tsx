import { Flex, Spinner } from '@pancakeswap/uikit'
import { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getTokenStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const Token = dynamic(() => import('views/V3Info/views/TokenPage'), { ssr: false })

const TokenPage = ({ address, chain }: { address?: string; chain?: string }) => {
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
      <Token address={String(address).toLowerCase()} chain={String(chain)} />
    </Suspense>
  )
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = [] // set all

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()

export const getStaticProps: GetStaticProps = getTokenStaticProps()

export default TokenPage
