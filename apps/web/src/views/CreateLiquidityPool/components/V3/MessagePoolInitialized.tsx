import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, InfoIcon, Message, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DISABLED_ADD_LIQUIDITY_CHAINS } from 'config/constants/liquidity'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { getPoolAddLiquidityLink } from 'utils/getPoolLink'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'

export const MessagePoolInitialized = () => {
  const { t } = useTranslation()
  const { isXs } = useMatchBreakpoints()

  const router = useRouter()

  const { chainId, protocol } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()

  const redirectToAddLiquidityPage = useCallback(() => {
    if (chainId && protocol && baseCurrency && quoteCurrency) {
      router.push(
        getPoolAddLiquidityLink({
          chainId,
          protocol: Protocol.V3,
          token0: baseCurrency,
          token1: quoteCurrency,
        } as PoolInfo),
      )
    }
  }, [chainId, protocol, baseCurrency, quoteCurrency, router])

  return (
    <Message
      variant="success"
      icon={<InfoIcon width="24px" color="#02919D" />}
      action={
        <Button
          mt="8px"
          width="100%"
          onClick={redirectToAddLiquidityPage}
          endIcon={isXs ? <AddIcon color="invertedContrast" width="24px" /> : null}
          disabled={Boolean(chainId && DISABLED_ADD_LIQUIDITY_CHAINS[chainId])}
        >
          {t('Add Liquidity')}
        </Button>
      }
    >
      <Text color="text">{t('A pool with the selected configuration already exists.')}</Text>
    </Message>
  )
}
