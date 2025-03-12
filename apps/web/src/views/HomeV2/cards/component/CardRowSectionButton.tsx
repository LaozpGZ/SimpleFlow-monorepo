import { ArrowForwardIcon, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import { useRouter } from 'next/router'
import styled from 'styled-components'

export const CardRowSectionButton = ({
  link,
  text,
  alwaysShow = false,
  hoverText,
}: {
  link: string
  text: string
  hoverText: string
  alwaysShow?: boolean
}) => {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const isHover = useHoverContext()

  return (
    <StyledButton
      show={isHover || alwaysShow}
      isMobile={isMobile}
      onClick={() => {
        if (link.startsWith('http')) {
          window.open(link, '_blank')
          return
        }
        router.push(link)
      }}
      variant={isHover || isMobile ? 'primary' : 'light'}
    >
      {isHover ? hoverText : text}
      {!isMobile && isHover && <ArrowForwardIcon color="card" ml="8px" />}
    </StyledButton>
  )
}

const StyledButton = styled(Button)<{ isMobile: boolean; show: boolean }>`
  transition: all 1s ease;
  opacity: ${({ show }) => (show ? 1 : 0)};
  height: 40;
  padding-right: 16px;
  padding-left: 16px;
  border-radius: 999px;
  border-width: 3px;

  color: card;
`
