import { getLogger } from './datadog'

const fetch_ = fetch

export const fetchWithLogging = async (url: RequestInfo | URL, init?: RequestInit) => {
  const start = Date.now()
  let urlString: string | undefined
  let size: number | undefined
  if (init && init.method === 'POST' && init.body) {
    urlString = url.toString()
    size = init.body.toString().length / 1024
  }

  const response = await fetch_(url, init)
  const end = Date.now()
  if (urlString && size) {
    if (!urlString.includes('datadoghq.com')) {
      try {
        const logger = getLogger('quote-rpc', { forwardErrorsToLogs: false })
        logger.info('Quote RPC', {
          rpc: {
            duration: end - start,
            url: urlString,
            size,
            status: response.status,
          },
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return response
}
