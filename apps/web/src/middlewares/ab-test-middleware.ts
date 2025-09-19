import { getCookieKey } from 'config/experimentalFeatures'
import { NextFetchEvent, NextResponse } from 'next/server'
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import { getExperimentalFeatureAccessList } from '../flags'
import { ONE_YEAR_SECONDS } from './constants'
import { ExtendedNextReq, MiddlewareFactory, NextMiddleware } from './types'

export const withABTesting: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: ExtendedNextReq, _next: NextFetchEvent) => {
    const clientId = request?.clientId
    const response = (await next(request, _next)) || NextResponse.next()

    const cookies = new RequestCookies(request.headers)

    console.log('cookies', cookies)

    console.log('clientId', clientId)

    if (!clientId) return response

    console.log('request', request)

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
