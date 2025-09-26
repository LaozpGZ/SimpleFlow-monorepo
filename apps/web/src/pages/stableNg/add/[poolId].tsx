import { Box, Spinner } from '@pancakeswap/uikit'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useActiveChainId } from 'hooks/useActiveChainId'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import AddLiquidityV2FormProvider from 'views/AddLiquidity/AddLiquidityV2FormProvider'
import { AddLiquidityV3Layout, UniversalAddLiquidity } from 'views/AddLiquidityV3'
import { SELECTOR_TYPE } from 'views/AddLiquidityV3/types'
import { PageWithoutFAQ } from 'views/Page'

const AddStableNGLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()

  const { poolId } = router.query

  const { data: poolInfo } = usePoolKeyByPoolId(poolId as `0x${string}`, chainId)

  // TODO: should handle native token with returned Wrapped token
  const currencyIdA = poolInfo?.currency0
  const currencyIdB = poolInfo?.currency1

  if (!currencyIdA || !currencyIdB) {
    return (
      <PageWithoutFAQ>
        <AddLiquidityV3Layout>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner />
          </Box>
        </AddLiquidityV3Layout>
      </PageWithoutFAQ>
    )
  }

  return (
    <AddLiquidityV2FormProvider>
      <AddLiquidityV3Layout>
        <UniversalAddLiquidity
          preferredSelectType={SELECTOR_TYPE.STABLE}
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
        />
      </AddLiquidityV3Layout>
    </AddLiquidityV2FormProvider>
  )
}

const Page = dynamic(() => Promise.resolve(AddStableNGLiquidityPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = CHAIN_IDS

export default Page
