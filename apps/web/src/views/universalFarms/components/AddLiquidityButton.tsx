import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, BoxProps, Button } from '@pancakeswap/uikit'

export const AddLiquidityButton: React.FC<{ wrapperProps?: BoxProps; to?: string }> = ({
  wrapperProps,
  to = '/add',
  ...props
}) => {
  const { t } = useTranslation()
  return (
    <Box width="100%" {...wrapperProps}>
      <Button as="a" href={to} endIcon={<AddIcon color="invertedContrast" />} {...props}>
        {t('Add Liquidity')}
      </Button>
    </Box>
  )
}
