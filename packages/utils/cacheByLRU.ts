import QuickLRU from 'quick-lru'
import { keccak256, stringify } from 'viem'

type AsyncFunction<T extends any[]> = (...args: T) => Promise<any>

// Type definitions for the cache.
type CacheOptions<T extends AsyncFunction<any>> = {
  maxCacheSize?: number
  ttl: number
  persist?: {
    name: string
    version: string
    type: 'r2'
  }
  key?: (params: Parameters<T>) => any
  isValid?: (result: any) => boolean
  autoRevalidate?: number
}

function calcCacheKey(args: any[], epoch: number) {
  const json = stringify(args)
  const r = keccak256(`0x${json}@${epoch}`)
  return r
}

const identity = (args: any) => args

export const cacheByLRU = <T extends AsyncFunction<any>>(
  fn: T,
  { ttl, key, maxCacheSize, persist, isValid, autoRevalidate }: CacheOptions<T>,
) => {
  const cache = new QuickLRU<string, Promise<any>>({
    maxAge: ttl,
    maxSize: maxCacheSize || 1000,
  })
  const fetchR2Cache = persist
    ? cacheByLRU(_fetchR2Cache, {
        ttl,
      })
    : undefined

  const keyFunction = key || identity

  function persistKey(cacheKey: string) {
    return `${persist?.name}-${persist?.version}-${cacheKey}`
  }

  async function ensurePersist(promise: Promise<any>, cacheKey: string) {
    if (fetchR2Cache && persist) {
      const r2Promise = fetchR2Cache(persistKey(cacheKey))
      const value = await Promise.race([r2Promise, promise])
      return value ?? promise
    }
    return promise
  }

  let revalidateTimer: NodeJS.Timeout | null = null
  let halfTTSTimer: NodeJS.Timeout | null = null
  let startTime = 0
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Start Time
    if (!startTime) {
      startTime = Date.now()
    }
    const epoch = (Date.now() - startTime) / ttl
    const halfTTS = epoch % 1 > 0.5
    const epochId = Math.floor(epoch)

    const cacheForEpoch = async (epochId: number) => {
      const cacheKey = calcCacheKey(keyFunction(args), epochId)
      if (cache.has(cacheKey)) {
        return ensurePersist(cache.get(cacheKey)!, cacheKey)
      }
      // @ts-ignore
      const promise = fn(...args)
      cache.set(cacheKey, promise)
      promise
        .then((result) => {
          if (!result) {
            cache.delete(cacheKey)
            return
          }
          if (isValid && !isValid(result)) {
            cache.delete(cacheKey)
            return
          }
          const jsonResult = stringify(result)
          if (persist && result && jsonResult !== '{}' && jsonResult !== '[]') {
            uploadR2(persistKey(cacheKey), result).catch((ex) => {
              console.error('Failed to persist cache', ex)
            })
          }
        })
        .catch((error) => {
          console.error('Cache promise failed', error)
          cache.delete(cacheKey)
        })

      return ensurePersist(promise, cacheKey)
    }

    if (autoRevalidate) {
      let max = 5
      const stop = () => {
        clearTimeout(halfTTSTimer!)
        clearInterval(revalidateTimer!)
      }
      stop()
      let onEpoch = epochId + 1
      halfTTSTimer = setTimeout(() => {
        revalidateTimer = setInterval(() => {
          cacheForEpoch(onEpoch++)
          if (--max === 0) {
            stop()
          }
        }, autoRevalidate)
      })
    }
    if (!autoRevalidate && halfTTS) {
      cacheForEpoch(epochId + 1)
    }

    return cacheForEpoch(epochId)
  }
}

async function uploadR2(key: string, value: any) {
  console.info('update cache', key)
  if (!process.env.OBJECT_CACHE_SECRET) {
    return
  }
  await fetch(`https://obj-cache.pancakeswap.com`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OBJECT_CACHE_SECRET}`,
    },
    body: JSON.stringify({ key, value }),
  })
}

async function _fetchR2Cache(key: string) {
  const resp = await fetch(`https://proofs.pancakeswap.com/cache/${key}`)
  if (resp.status === 200) {
    return resp.json()
  }
  console.warn(`Failed to fetch cache:https://proofs.pancakeswap.com/cache/${key}`)
  return undefined
}
