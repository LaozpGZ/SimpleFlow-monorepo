import { ArrowForwardIcon, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import styled from 'styled-components'

export const CardSectionButton = ({ link, text, show }: { link: string; text: string; show: boolean }) => {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()

  return (
    <StyledButton
      show={show}
      isMobile={isMobile}
      onClick={() => {
        router.push(link)
      }}
      variant={isMobile ? 'light' : 'primary'}
    >
      {text}
      {!isMobile && <ArrowForwardIcon color="card" ml="8px" />}
    </StyledButton>
  )
}

const StyledButton = styled(Button)<{ isMobile: boolean; show: boolean }>`
  transition: opacity 1s;
  opacity: ${({ show }) => (show ? 1 : 0)};
  width: 66;
  height: 40;
  padding-right: 16px;
  padding-left: 16px;
  border-radius: 999px;
  border-width: 3px;

  color: ${({ theme, isMobile }) => (isMobile ? theme.colors.textSubtle : theme.colors.card)};
`
