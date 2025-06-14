import createClient, { Middleware } from 'openapi-fetch'
import { paths } from './schema'

const endpoints = process.env.NEXT_PUBLIC_INDEXER_API_ENDPOINT

export const IndexerApiClient = createClient<paths>({
  baseUrl: endpoints,
})
