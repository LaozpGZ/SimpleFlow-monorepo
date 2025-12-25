import { useTranslation } from '@simpleflow/l10n'
import { Box, BoxProps, PreTitle, RowBetween, ScanLink } from '@simpleflow/uikit'
import { Liquidity } from '@simpleflow/widgets-internal'
import React from 'react'
import { useLiquidityShapeQueryState } from 'state/infinity/shared'

export type FieldLiquidityShapeProps = BoxProps

export const FieldLiquidityShape: React.FC<FieldLiquidityShapeProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const [liquidityShape, setLiquidityShape] = useLiquidityShapeQueryState()

  return (
    <Box {...boxProps}>
      <RowBetween>
        <PreTitle>{t('Choose Liquidity Shape')}</PreTitle>
        <ScanLink
          href="https://docs.simpleflow.finance/trade/pancakeswap-infinity/pool-types"
          fontSize="12px"
          textTransform="uppercase"
          color="primary60"
        >
          {t('Learn More')}
        </ScanLink>
      </RowBetween>
      <Liquidity.LiquidityShapePicker mt="8px" value={liquidityShape} onChange={setLiquidityShape} />
    </Box>
  )
}
