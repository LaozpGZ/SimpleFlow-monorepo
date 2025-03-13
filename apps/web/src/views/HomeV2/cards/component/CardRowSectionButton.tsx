import { ArrowForwardIcon, Button, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import styled from 'styled-components'

interface CardRowSectionButtonProps {
  link: string
  text: string
  hover?: {
    text: string
    width: number
    originalWidth: number
  }
  alwaysShow?: boolean
}
export const CardRowSectionButton = ({ link, text, alwaysShow = false, hover }: CardRowSectionButtonProps) => {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const isHover = useHoverContext()

  const buttonRef = useRef<HTMLDivElement>(null)
  const displayText = hover ? (isHover ? hover.text : text) : text
  const width = !isMobile && hover ? (isHover ? `${hover.width}px` : `${hover.originalWidth}px`) : 'auto'

  return (
    <StyledButton
      show={isHover || alwaysShow}
      isMobile={isMobile}
      isHover={isHover}
      style={{ width }}
      onClick={() => {
        if (link.startsWith('http')) {
          window.open(link, '_blank')
          return
        }
        router.push(link)
      }}
      variant={isHover || isMobile ? 'primary' : 'light'}
    >
      <Flex flexDirection="row" ref={buttonRef}>
        {displayText}
        {!isMobile && isHover && <ArrowForwardIcon color="card" ml="8px" />}
      </Flex>
    </StyledButton>
  )
}

const StyledButton = styled(Button)<{
  show: boolean
  isMobile: boolean
}>`
  transition: width 0.2s ease;
  opacity: ${({ show }) => (show ? 1 : 0)};
  height: 40px;
  padding-right: 16px;
  padding-left: 16px;
  border-radius: 999px;
  border-width: 3px;
  color: ${({ theme, isHover, isMobile }) =>
    isHover ? theme.colors.card : isMobile ? theme.colors.card : theme.colors.textSubtle};
`
