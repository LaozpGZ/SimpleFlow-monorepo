import { useTranslation } from '@pancakeswap/localization'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import React from 'react'
import styled from 'styled-components'

export const RedeemHeader: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <Wrapper isMobile>
      <Content $isMobile={isMobile}>
        <TextContent>
          <Title $isMobile={isMobile}>{t('Redeem Staked SDX')}</Title>
          <SubText $isMobile={isMobile}>
            {t('You may now redeem previously locked SDX and claim remaining rewards.')}
          </SubText>
        </TextContent>
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ isMobile: boolean }>`
  padding: 40px 16px;
  margin-top: ${({ isMobile }) => (isMobile ? '0' : '40px')};
  margin-bottom: 24px;
  position: relative;
`

const Content = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  gap: 24px;
`

const TextContent = styled.div`
  flex: 1;
`

const Title = styled.h1<{ $isMobile: boolean }>`
  font-family: Kanit;
  font-size: 64px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  font-family: Kanit;
  font-size: ${({ $isMobile }) => ($isMobile ? '32px' : '64px')};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 16px;
`

const SubText = styled.p<{ $isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 400;
  font-size: 16px;
  line-height: 120%;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ $isMobile }) => ($isMobile ? '0' : '24px')};
`
