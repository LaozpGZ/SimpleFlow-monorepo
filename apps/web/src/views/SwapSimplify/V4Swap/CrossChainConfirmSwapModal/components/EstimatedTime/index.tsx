import dayjs from 'dayjs'
import { useMemo } from 'react'

export function EstimatedTime({ expectedFillTimeSec }: { expectedFillTimeSec?: number }) {
  const estimatedTimeDisplay = useMemo(() => {
    if (!expectedFillTimeSec) return '-'

    const currentTime = dayjs().unix()
    const secondsFromNow = expectedFillTimeSec - currentTime

    return dayjs.duration(secondsFromNow, 'seconds').humanize(true)
  }, [expectedFillTimeSec])

  return estimatedTimeDisplay
}
