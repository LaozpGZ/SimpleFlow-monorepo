import { useTranslation } from '@simpleflow/l10n'
import { AddIcon, Box, BoxProps, Button, ButtonProps } from '@simpleflow/uikit'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export const AddLiquidityButton: React.FC<ButtonProps & { wrapperProps?: BoxProps; to?: string }> = ({
  wrapperProps,
  to = '/liquidity/select',
  ...props
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const handleClick = useCallback(() => {
    if (to.startsWith('http')) {
      window.open(to, '_blank')
    } else {
      router.push(to)
    }
  }, [router, to])
  return (
    <Box width="100%" minWidth="max-content" {...wrapperProps}>
      <Button onClick={handleClick} endIcon={<AddIcon color="invertedContrast" />} {...props}>
        {t('Add Liquidity')}
      </Button>
    </Box>
  )
}
