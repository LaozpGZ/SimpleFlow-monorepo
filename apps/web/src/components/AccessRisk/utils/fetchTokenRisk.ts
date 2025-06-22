/* eslint-disable camelcase */
import { ChainId } from '@pancakeswap/chains'
import { ACCESS_RISK_API, ACCESS_RISK_API_KEY } from 'config/constants/endpoints'

export interface RiskTokenInfo {
  address: string
  chainId: ChainId
  hasResult: boolean
  riskLevel: number
  requestId: string
  riskLevelDescription: string
  pollingInterval: number
  isError: boolean
}

const fetchRiskApi = async (address: string, chainId: number) => {
  const response = await fetch(`${ACCESS_RISK_API}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': ACCESS_RISK_API_KEY || '',
    },
    method: 'POST',
    body: JSON.stringify({
      chainId: chainId.toString(),
      address,
    }),
  })

  const result = await response.json()

  // Handle processing state
  if (result.status === 'in progress') {
    return {
      ...result,
      data: {
        address,
        chainId,
        isError: false,
        hasResult: false,
        riskLevel: -1,
        requestId: '',
        riskLevelDescription: '',
        pollingInterval: result.pollAfter,
      },
    }
  }

  // Handle final result
  if (result.code === '0' && result.status === 'ok' && result.data) {
    return {
      ...result,
      data: {
        address,
        chainId,
        isError: false,
        hasResult: true,
        riskLevel: result.data.threat_intelligence.risk_level,
        requestId: '',
        riskLevelDescription: result.data.overall_risk_level,
        pollingInterval: 0,
      },
    }
  }

  // Handle error
  return {
    ...result,
    data: {
      address,
      chainId,
      isError: true,
      hasResult: false,
      riskLevel: -1,
      requestId: '',
      riskLevelDescription: '',
      pollingInterval: 0,
    },
  }
}

export const fetchRiskToken = async (address: string, chainId: number): Promise<RiskTokenInfo> => {
  const riskApi = await fetchRiskApi(address, chainId)
  if (riskApi?.data && !riskApi?.data?.isError) {
    return riskApi.data
  }

  return {
    address,
    chainId,
    isError: true,
    hasResult: false,
    riskLevel: -1,
    requestId: '',
    riskLevelDescription: '',
    pollingInterval: 0,
  }
}
