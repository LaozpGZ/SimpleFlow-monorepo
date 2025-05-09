import dayjs from 'dayjs'
import { useMemo } from 'react'

export function EstimatedTime({ expectedFillTimeSec }: { expectedFillTimeSec?: number }) {
  const estimatedTimeDisplay = useMemo(() => {
    if (expectedFillTimeSec) {
      const time = dayjs.unix(expectedFillTimeSec / 1000).from(dayjs.unix(0), true)
      return time
    }
    return null
  }, [expectedFillTimeSec])

  if (!estimatedTimeDisplay) {
    return '-'
  }

  return estimatedTimeDisplay
}
