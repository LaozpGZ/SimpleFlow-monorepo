import { Box, Text, TooltipText, useTooltip } from '@simpleflow/uikit'
import { PropsWithChildren, useCallback } from 'react'
import { logger } from 'utils/datadog'
import { useChainId } from 'wagmi'

const EventCaptureContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const chainId = useChainId()
  const log = useCallback(() => {
    logger.info('GiftTooltip', {
      chainId,
      path: window.location.pathname,
    })
  }, [chainId])
  return <Box onClickCapture={log}>{children}</Box>
}

export const GiftTooltip: React.FC<PropsWithChildren> = ({ children }) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(<EventCaptureContainer>{children}</EventCaptureContainer>, {
    placement: 'top',
  })

  return (
    <Box ml="6px" height="16px" style={{ alignSelf: 'center', cursor: 'pointer' }}>
      <TooltipText ref={targetRef}>
        <Text fontSize={14}>🎁</Text>
      </TooltipText>
      {tooltipVisible && tooltip}
    </Box>
  )
}
