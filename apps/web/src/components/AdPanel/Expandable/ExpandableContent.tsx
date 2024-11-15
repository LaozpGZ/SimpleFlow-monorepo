import { Box, Text } from '@pancakeswap/uikit'
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

  extendedContentRef: React.RefObject<HTMLDivElement>

  expandableContent?: ReactNode
  defaultContent?: ReactNode
}

export const ExpandableContent = ({
  title,
  isExpanded,
  extendedContentRef,
  expandableContent,
  defaultContent,
}: ExpandableContentProps) => {
  return (
    <>
      {isExpanded ? (
        <Box ref={extendedContentRef} overflow="hidden">
          <Text bold as="h1" textAlign="center" p="16px">
            {title}
          </Text>
          <Divider />
          {/* <ScrollableBox p="16px">{expandableContent}</ScrollableBox> */}
          <Box p="16px">{expandableContent}</Box>
        </Box>
      ) : (
        defaultContent
      )}
    </>
  )
}
