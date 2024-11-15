import { Box, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { PropsWithChildren, ReactNode } from 'react'
import { Divider } from './styles'

// TODO: check for mobile modal view as well
// export const ScrollableBox = styled(Box)`
//   max-height: 400px;
//   overflow-y: auto;
// `

interface ExpandableContentProps extends PropsWithChildren {
  title: string
  isExpanded: boolean
  expandableContent?: ReactNode
  extendedContentRef?: React.RefObject<HTMLDivElement>
  defaultContent?: ReactNode
}

export const ExpandableContent = ({
  title,
  isExpanded,
  expandableContent,
  defaultContent,
  extendedContentRef,
}: ExpandableContentProps) => {
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      {isExpanded ? (
        <Box overflow="hidden" maxHeight="calc(100% - 56px)">
          <Text bold as="h1" textAlign="center" p="16px">
            {title}
          </Text>
          <Divider />
          {/* <ScrollableBox p="16px">{expandableContent}</ScrollableBox> */}
          <Box ref={extendedContentRef} p="16px" height="100%" overflowY={isMobile ? 'hidden' : 'scroll'}>
            {expandableContent}
          </Box>
        </Box>
      ) : (
        defaultContent
      )}
    </>
  )
}
