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

// Map score to risk level based on the guide
const mapScoreToRiskLevel = (score: number): number => {
  if (score >= 86) return 1 // No Obvious Risk
  if (score >= 70) return 2 // Low Risk
  if (score >= 40) return 3 // Medium Risk
  if (score >= 16) return 4 // High Risk
  if (score >= 0) return 5 // Significant Risk
  return -1 // Unknown
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
    const score = parseInt(result.data.overall_score, 10)
    const riskLevel = mapScoreToRiskLevel(score)

    return {
      ...result,
      data: {
        address,
        chainId,
        isError: false,
        hasResult: true,
        riskLevel,
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
