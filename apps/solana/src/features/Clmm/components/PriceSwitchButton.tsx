import { Button } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { SwapHorizIcon } from '@pancakeswap/uikit'

import { colors } from '@/theme/cssVariables/colors'

export default function PriceSwitchButton(props: { priceLabel: string; onClickSwitch: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      size="sm"
      variant="primary60"
      borderRadius="12px"
      fontWeight={400}
      fontSize="xs"
      px="8px"
      minWidth="auto"
      color={colors.textSubtle}
      onClick={props.onClickSwitch}
    >
      {props.priceLabel} {t('Price')}{' '}
      <SwapHorizIcon
        color={colors.primary60}
        style={{
          marginLeft: '2px'
        }}
      />
    </Button>
  )
}
