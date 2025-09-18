import { EXPERIMENTAL_FEATURES, getCookieKey } from 'config/experimentalFeatures'
import { NextFetchEvent, NextResponse } from 'next/server'
import flags from '../pages/api/flags'
import { ONE_YEAR_SECONDS } from './constants'
import { ExtendedNextReq, MiddlewareFactory, NextMiddleware } from './types'

// Helper to create a compatible request object for flags
const createFlagRequest = (request: ExtendedNextReq) => {
  return {
    cookies: request.cookies,
    headers: request.headers,
    clientId: request.clientId,
    url: request.url,
    method: request.method,
  }
}

// Get experimental feature access using the new flags SDK
export const getExperimentalFeatureAccessList = async (
  request: ExtendedNextReq,
): Promise<Array<{ feature: EXPERIMENTAL_FEATURES; hasAccess: boolean }>> => {
  const flagRequest = createFlagRequest(request)

  const flagEvaluations = await Promise.all(
    Object.entries(flags).map(async ([feature, flagFunction]) => {
      console.log('feature', feature)
      console.log('flagFunction', flagFunction)
      try {
        // Pass the adapted request object to the flag function
        const hasAccess = await flagFunction(flagRequest as any)
        console.log('hasAccess', hasAccess)
        return { feature: feature as EXPERIMENTAL_FEATURES, hasAccess }
      } catch (error) {
        console.error(`Error evaluating flag ${feature}:`, error)
        return { feature: feature as EXPERIMENTAL_FEATURES, hasAccess: false }
      }
    }),
  )
  return flagEvaluations
}

export const withABTesting: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: ExtendedNextReq, _next: NextFetchEvent) => {
    const clientId = request?.clientId
    const response = (await next(request, _next)) || NextResponse.next()
    if (!clientId) return response

    const accessList = await getExperimentalFeatureAccessList(request)

    console.log('accessList', accessList)

    for (const { feature, hasAccess } of accessList) {
      response.cookies.set(getCookieKey(feature), hasAccess.toString(), {
        secure: true,
        maxAge: hasAccess ? ONE_YEAR_SECONDS : 0,
      })
    }
    return response
  }
}
