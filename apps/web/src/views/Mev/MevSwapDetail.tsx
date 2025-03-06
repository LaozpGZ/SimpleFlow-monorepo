import { useTranslation } from '@pancakeswap/localization'
import { QuestionHelperV2, ShieldCheckIcon, Text } from '@pancakeswap/uikit'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { styled } from 'styled-components'
import { useIsMEVEnabled } from './hooks'

const Wrapper = styled.div`
  background-color: ${({ theme }) => (theme.isDark ? theme.colors.backgroundAlt : '#F7F7F7')};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 12px 16px;
  margin-top: 8px;
`

export const MevSwapDetail: React.FC = () => {
  const { t } = useTranslation()
  const { isMEVEnabled, isLoading } = useIsMEVEnabled()
  if (!isMEVEnabled || isLoading) {
    return null
  }
  return (
    <Wrapper>
      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={t('PancakeSwap MEV Guard protects you from frontrunning and sandwich attacks when Swapping.')}
            placement="top-start"
          >
            <ShieldCheckIcon width="15px" color="success" />
            <Text
              fontSize="14px"
              color="textSubtle"
              style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              ml="7px"
            >
              {t('MEV Protected')}
            </Text>
          </QuestionHelperV2>
        </RowFixed>
      </RowBetween>
    </Wrapper>
  )
}
