import { useTranslation } from '@pancakeswap/localization'
import { Box, PreTitle, RowBetween, ScanLink } from '@pancakeswap/uikit'
import { Liquidity } from '@pancakeswap/widgets-internal'
import { useLiquidityShapeQueryState } from 'state/infinity/shared'

export const BinLiquidityShapeSelector = () => {
  const { t } = useTranslation()
  const [liquidityShape, setLiquidityShape] = useLiquidityShapeQueryState()

  return (
    <Box mt="24px">
      <RowBetween>
        <PreTitle>{t('Choose Liquidity Shape')}</PreTitle>
        <ScanLink
          href="https://docs.pancakeswap.finance/trade/pancakeswap-infinity/pool-types"
          fontSize="12px"
          textTransform="uppercase"
        >
          {t('Learn More')}
        </ScanLink>
      </RowBetween>

      <Liquidity.LiquidityShapePicker mt="8px" value={liquidityShape} onChange={setLiquidityShape} />
    </Box>
  )
}
