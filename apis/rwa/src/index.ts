/* eslint-disable no-restricted-globals */
import { CORS_ALLOW, handleCors, wrapCorsHeader } from '@pancakeswap/worker-utils'
import { Router } from 'itty-router'
import { error, json, missing } from 'itty-router-extras'

const RWA_STATUS_URL = 'https://api.gm.ondo.finance/v1/status/assets'
const CACHE_CONTROL_HEADER = 'public, max-age=60, s-maxage=60, stale-while-revalidate=30'
const CORS_METHODS = 'GET, OPTIONS'
const CORS_HEADERS = 'origin, referer, content-type'

const router = Router()

function getOndoApiKey(): string | undefined {
  return (globalThis as unknown as { ONDO_API_KEY?: string }).ONDO_API_KEY
}

async function fetchStatusesFromUpstream(apiKey: string) {
  const upstreamResponse = await fetch(RWA_STATUS_URL, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-api-key': apiKey,
    },
  })

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text().catch(() => '')
    throw new Error(`Ondo status fetch failed (${upstreamResponse.status}): ${errorText}`)
  }

  return upstreamResponse.json()
}

router.get('/ondo/status', async (request: Request, event: FetchEvent) => {
  const cache = caches.default
  const cached = await cache.match(request)
  if (cached) {
    return cached
  }

  const apiKey = getOndoApiKey()
  if (!apiKey) {
    console.error('ONDO_API_KEY is not configured for RWA worker')
    return error(500, 'RWA status unavailable')
  }

  try {
    const data = await fetchStatusesFromUpstream(apiKey)
    const response = json(data as object, {
      headers: {
        'Cache-Control': CACHE_CONTROL_HEADER,
      },
    })

    event.waitUntil(cache.put(request, response.clone()))
    return response
  } catch (err) {
    console.error('Failed to retrieve RWA statuses', err)
    return error(502, 'Failed to retrieve RWA statuses')
  }
})

router.options('*', handleCors(CORS_ALLOW, CORS_METHODS, CORS_HEADERS))

router.all('*', () => missing('Not found'))

addEventListener('fetch', (event) =>
  event.respondWith(
    router
      .handle(event.request, event)
      .then((res) => wrapCorsHeader(event.request, res, { allowedOrigin: CORS_ALLOW })),
  ),
)
