import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useMemo } from 'react'

dayjs.extend(duration)

export function EstimatedTime({ expectedFillTimeSec }: { expectedFillTimeSec?: number }) {
  const estimatedTimeDisplay = useMemo(() => {
    if (!expectedFillTimeSec) return '-'

    const currentTime = dayjs().unix()
    const secondsFromNow = expectedFillTimeSec - currentTime

    return dayjs.duration(secondsFromNow, 'seconds').humanize(true)
  }, [expectedFillTimeSec])

  return estimatedTimeDisplay
}
