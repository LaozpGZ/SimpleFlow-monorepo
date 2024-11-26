import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, ShieldIcon, Text, Toggle } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { useShouldShowMEVToggle } from './hooks'

export const ToggleWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.tertiary};
  padding: 16px;
  display: flex;
  width: 100%;
  gap: 4px;
  border-radius: 16px;
  align-items: center;
  justify-content: space-between;
`

export const MevToggle: React.FC = () => {
  const { t } = useTranslation()
  const shouldShowMEVToggle = useShouldShowMEVToggle()
  if (!shouldShowMEVToggle) {
    return null
  }
  return (
    <ToggleWrapper>
      <FlexGap gap="4px">
        <ShieldIcon width="24px" />
        <Text>{t('Enable')}</Text>
        <Text style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}>
          {t('MEV Project')}
        </Text>
      </FlexGap>
      <Toggle scale="md" />
    </ToggleWrapper>
  )
}
