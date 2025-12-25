import { useTranslation } from '@simpleflow/l10n'
import { Box, BoxProps, Button, ButtonProps } from '@simpleflow/uikit'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export const CreatePoolButton: React.FC<ButtonProps & { wrapperProps?: BoxProps; to?: string }> = ({
  wrapperProps,
  to = '/liquidity/create',
  ...props
}) => {
  const { t } = useTranslation()
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(to)
  }, [router, to])

  return (
    <Box width="100%" minWidth="max-content" {...wrapperProps}>
      <Button variant="primary60Outline" onClick={handleClick} {...props}>
        {t('Create Pool')}
      </Button>
    </Box>
  )
}
