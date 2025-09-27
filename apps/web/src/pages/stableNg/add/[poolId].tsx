import { useTranslation } from '@pancakeswap/localization'
import { Box, Spinner, Text, Breadcrumbs, FlexGap, Container } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { LinkText } from 'components/Liquidity/LinkText'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useActiveChainId } from 'hooks/useActiveChainId'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import AddLiquidityV2FormProvider from 'views/AddLiquidity/AddLiquidityV2FormProvider'
import { InfinityPoolInfoHeader } from 'views/AddLiquidityInfinity/components/InfinityPoolInfoHeader'
import { AddLiquidityV3Layout, UniversalAddLiquidity } from 'views/AddLiquidityV3'
import { SELECTOR_TYPE } from 'views/AddLiquidityV3/types'
import { PageWithoutFAQ } from 'views/Page'

const AddStableNGLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const poolId = router.query.poolId as `0x${string}` | undefined

  const { t } = useTranslation()

  const { data: poolKey } = usePoolKeyByPoolId(poolId as `0x${string}`, chainId)

  // TODO: should handle native token with returned Wrapped token
  const currencyIdA = poolKey?.currency0
  const currencyIdB = poolKey?.currency1

  if (!currencyIdA || !currencyIdB || !poolId) {
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
      <Container mx="auto" my="24px" maxWidth="1200px">
        <Box mb="24px">
          <Breadcrumbs>
            <NextLinkFromReactRouter to="/liquidity/pools">
              <LinkText>{t('Farms')}</LinkText>
            </NextLinkFromReactRouter>
            {chainId && poolId && (
              <NextLinkFromReactRouter to={`/liquidity/pool/${CHAIN_QUERY_NAME[chainId]}/${poolId}`}>
                <LinkText>{t('Pool Detail')}</LinkText>
              </NextLinkFromReactRouter>
            )}
            <FlexGap alignItems="center" gap="4px">
              <Text>{t('Add Liquidity')}</Text>
            </FlexGap>
          </Breadcrumbs>
        </Box>
        <InfinityPoolInfoHeader poolId={poolId} chainId={chainId} />
        <UniversalAddLiquidity
          preferredSelectType={SELECTOR_TYPE.STABLE}
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
        />
      </Container>
    </AddLiquidityV2FormProvider>
  )
}

const Page = dynamic(() => Promise.resolve(AddStableNGLiquidityPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = CHAIN_IDS

export default Page
