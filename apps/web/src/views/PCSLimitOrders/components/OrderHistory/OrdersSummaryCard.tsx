import { FlexGap, TimerIcon, Text, ArrowForwardIcon, WaitIcon, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { LightCard } from '@pancakeswap/widgets-internal'
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

  const { isOpen, onOpen, onDismiss } = useModalV2()

  return (
    <>
      <StyledCard as="button" onClick={onOpen}>
        <FlexGap justifyContent="space-between" alignItems="center">
          <FlexGap gap="8px">
            <WaitIcon color="textSubtle" />
            <Text color="textSubtle" small bold>
              {t('%number% Open Limit Orders', { number: 4 })}
            </Text>
          </FlexGap>

          <ArrowForwardIcon mt="1px" color="textSubtle" width="24px" height="24px" />
        </FlexGap>
      </StyledCard>
      <OrdersModal isOpen={isOpen} onDismiss={onDismiss} />
    </>
  )
}
