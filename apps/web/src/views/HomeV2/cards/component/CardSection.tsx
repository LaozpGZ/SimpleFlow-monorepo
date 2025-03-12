import { Box, Card, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HoverProvider } from 'hooks/useHover'
import { ReactNode } from 'react'
import styled from 'styled-components'
import { CardSectionButton } from './CardSectionButton'

const StyledCard = styled(Card)<{ isMobile: boolean }>`
  border-radius: ${({ isMobile }) => (isMobile ? '24px' : '48px')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: ${({ theme }) => theme.colors.card};
  max-width: ${({ isMobile }) => (isMobile ? '100%' : '588px')};
  cursor: pointer;
  padding: ${({ isMobile }) => (isMobile ? '16px' : '0px 32px 20px 32px')};
  transition: transform 0.5s ease, box-shadow 0.5s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`

const FramelessCard = styled(Box)<{ isMobile: boolean }>`
  background: ${({ theme }) => theme.colors.card};
  max-width: ${({ isMobile }) => (isMobile ? '100%' : '588px')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`

interface CardSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  button?: {
    link: string
    text: string
  }
  isFrameLess?: boolean
}

const Title = styled(Text)<{ isMobile: boolean; isFrameless: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isFrameless }) => (isMobile ? (isFrameless ? '16px' : '20px') : '32px')};
  line-height: ${({ isMobile }) => (isMobile ? '30px' : '38.4px')};
  letter-spacing: -0.16px;
  color: ${({ theme }) => theme.colors.text};
`

const FramelessTitle = styled(Text)<{ isMobile: boolean; isFrameless: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Subtitle = styled(Text)<{ isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '16px' : '20px')};
  line-height: ${({ isMobile }) => (isMobile ? '24px' : '30px')};
  letter-spacing: -1%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

export const CardSection: React.FC<CardSectionProps> = ({ title, subtitle, children, button, isFrameLess }) => {
  const { isMobile } = useMatchBreakpoints()

  if (isFrameLess) {
    return (
      <FramelessCard isMobile={isMobile}>
        <Box style={{ padding: isMobile ? '16px 0' : '24px 0' }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <FramelessTitle isMobile={isMobile} isFrameless>
                {title}
              </FramelessTitle>
              {subtitle && <Subtitle isMobile={isMobile}>{subtitle}</Subtitle>}
            </Box>
            {button && <CardSectionButton link={button.link} text={button.text} />}
          </Flex>
        </Box>
        {children}
      </FramelessCard>
    )
  }
  return (
    <HoverProvider>
      {(ref) => {
        return (
          <StyledCard isMobile={isMobile}>
            <Box ref={ref}>
              <Box style={{ padding: isMobile ? '16px 0' : '24px 0' }}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    <Title isFrameless={Boolean(isFrameLess)} isMobile={isMobile}>
                      {title}
                    </Title>
                    {subtitle && <Subtitle isMobile={isMobile}>{subtitle}</Subtitle>}
                  </Box>
                  {button && <CardSectionButton link={button.link} text={button.text} />}
                </Flex>
              </Box>
              {children}
            </Box>
          </StyledCard>
        )
      }}
    </HoverProvider>
  )
}
