import { FlexGap, TextProps, Toggle, Text } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'
import { OrderStatus } from 'views/PCSLimitOrders/types/orders.types'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'

export const OpenOrdersToggle = (props: TextProps) => {
  const { t } = useTranslation()
  const { toggleOpenFilter, filterOrderStatus } = useUserLimitOrders()

  return (
    <FlexGap alignItems="center" gap="4px">
      <Text color="secondary" fontSize="12px" textTransform="uppercase" bold {...props}>
        {t('View Pending Only')}
      </Text>
      <Toggle checked={filterOrderStatus === OrderStatus.Open} onChange={toggleOpenFilter} scale="sm" />
    </FlexGap>
  )
}
