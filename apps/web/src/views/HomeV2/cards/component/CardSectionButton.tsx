import { ArrowForwardIcon, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import { useRouter } from 'next/router'
import styled from 'styled-components'

export const CardSectionButton = ({
  link,
  text,
  alwaysShow = false,
}: {
  link: string
  text: string
  alwaysShow?: boolean
}) => {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const isHover = useHoverContext()

  return (
    <StyledButton
      show={isMobile || isHover || alwaysShow}
      isMobile={isMobile}
      onClick={() => {
        if (link.startsWith('http')) {
          window.open(link, '_blank')
          return
        }
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
  height: 40px;
  padding-right: 16px;
  padding-left: 16px;
  border-radius: 999px;
  border-width: 3px;

  color: ${({ theme, isMobile }) => (isMobile ? theme.colors.textSubtle : theme.colors.card)};
`
