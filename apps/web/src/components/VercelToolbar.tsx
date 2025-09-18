import { Suspense, lazy } from 'react'

import { useShouldInjectVercelToolbar, useVercelToolbarEnabled } from 'hooks/useVercelToolbar'

const VercelToolbarComp = lazy(() =>
  import('@vercel/toolbar/next').then((module) => ({ default: module.VercelToolbar })),
)

export function VercelToolbar() {
  const enabled = useVercelToolbarEnabled()
  const shouldInject = useShouldInjectVercelToolbar()

  return enabled ? (
    <Suspense>
      {shouldInject ? (
        <Suspense>
          <VercelToolbarComp />
        </Suspense>
      ) : null}
    </Suspense>
  ) : null
}
