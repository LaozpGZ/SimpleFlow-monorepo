import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, Button, ButtonProps } from '@pancakeswap/uikit'
import NextLink from 'next/link'

export const AddLiquidityButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation()
  return (
    <Box width="100%">
      <NextLink href="/add">
        <Button endIcon={<AddIcon color="invertedContrast" />} {...props}>
          {t('Add Liquidity')}
        </Button>
      </NextLink>
    </Box>
  )
}
