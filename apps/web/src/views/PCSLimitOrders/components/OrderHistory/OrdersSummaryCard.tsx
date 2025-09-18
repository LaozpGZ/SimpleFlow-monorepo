import { FlexGap, TimerIcon, Text, ArrowForwardIcon, WaitIcon, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { LightCard } from '@pancakeswap/widgets-internal'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { OrderStatus } from 'views/PCSLimitOrders/types/orders.types'
import { OrdersModal } from './OrdersModal'

const StyledCard = styled(LightCard)`
  padding: 16px;
  border-radius: 24px;
  width: 100%;

  cursor: pointer;

  &:focus {
    outline: 4px solid ${({ theme }) => theme.colors.secondary};
  }
`

export const OrdersSummaryCard = () => {
  const { t } = useTranslation()

  const { data } = useUserLimitOrders()

  const numOpenOrders = data?.filter((order) => order.status === OrderStatus.Open).length
  const totalOrders = data?.length

  const { isOpen, onOpen, onDismiss } = useModalV2()

  if (!totalOrders) return <>total: {JSON.stringify(data, null, 2)}</>

  return (
    <>
      <StyledCard as="button" onClick={onOpen}>
        <FlexGap justifyContent="space-between" alignItems="center">
          <FlexGap gap="8px">
            <WaitIcon color="textSubtle" />
            <Text color="textSubtle" small bold>
              {t('%number% Open Limit Orders', { number: numOpenOrders })}
            </Text>
          </FlexGap>

          <ArrowForwardIcon mt="1px" color="textSubtle" width="24px" height="24px" />
        </FlexGap>
      </StyledCard>
      <OrdersModal isOpen={isOpen} onDismiss={onDismiss} />
    </>
  )
}
