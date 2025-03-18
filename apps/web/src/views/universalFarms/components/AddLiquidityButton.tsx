import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, Button, ButtonProps } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

export const AddLiquidityButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation()
  return (
    <Box width="100%">
      <NextLinkFromReactRouter to="/add">
        <Button endIcon={<AddIcon color="invertedContrast" />} {...props}>
          {t('Add Liquidity')}
        </Button>
      </NextLinkFromReactRouter>
    </Box>
  )
}
