import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GiftStatus, type GiftInfoResponse } from '../../types'

// Mock the constants module with a proper mock function
const mockConstants = {
  NEXT_PUBLIC_GIFT_API: 'https://api.example.com' as string | undefined,
  QUERY_KEY_GIFT_INFO: 'gift-info',
}

vi.mock('../../constants', () => mockConstants)

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import the function after mocking
const { fetchGiftInfo } = await import('../useGetGiftInfo')

describe('fetchGiftInfo', () => {
  const mockChainId = 56 // BSC
  const mockAccount = '0x1234567890123456789012345678901234567890'

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock constants to default values
    mockConstants.NEXT_PUBLIC_GIFT_API = 'https://api.example.com'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully fetch and merge gift data', async () => {
    const mockSentGifts: GiftInfoResponse[] = [
      {
        codeHash: 'hash1',
        token: '0xtoken1',
        tokenAmount: '1000000000000000000',
        nativeAmount: '100000000000000000',
        createTransactionHash: '0xtx1',
        status: GiftStatus.PENDING,
        claimerAddress: null,
        actionTransactionHash: null,
        timestamp: '2023-01-01T00:00:00Z',
        expiryTimestamp: '2023-12-31T23:59:59Z',
        creatorAddress: mockAccount,
      },
    ]

    const mockReceivedGifts: GiftInfoResponse[] = [
      {
        codeHash: 'hash2',
        token: '0xtoken2',
        tokenAmount: '2000000000000000000',
        nativeAmount: '200000000000000000',
        createTransactionHash: '0xtx2',
        status: GiftStatus.CLAIMED,
        claimerAddress: mockAccount,
        actionTransactionHash: '0xtx2claim',
        timestamp: '2023-02-01T00:00:00Z',
        expiryTimestamp: '2023-12-31T23:59:59Z',
        creatorAddress: '0xother',
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockSentGifts,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockReceivedGifts,
        }),
      })

    const result = await fetchGiftInfo({
      chainId: mockChainId,
      account: mockAccount,
    })

    expect(result).toHaveLength(2)
    expect(result).toEqual([...mockSentGifts, ...mockReceivedGifts])

    // Verify correct API calls were made
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.example.com/gift/list?chainId=${mockChainId}&address=${mockAccount}`,
    )
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.example.com/gift/list?chainId=${mockChainId}&claimerAddress=${mockAccount}`,
    )
  })

  it('should deduplicate gifts with same codeHash', async () => {
    const duplicateGift: GiftInfoResponse = {
      codeHash: 'duplicate-hash',
      token: '0xtoken1',
      tokenAmount: '1000000000000000000',
      nativeAmount: '100000000000000000',
      createTransactionHash: '0xtx1',
      status: GiftStatus.PENDING,
      claimerAddress: null,
      actionTransactionHash: null,
      timestamp: '2023-01-01T00:00:00Z',
      expiryTimestamp: '2023-12-31T23:59:59Z',
      creatorAddress: mockAccount,
    }

    const mockSentGifts: GiftInfoResponse[] = [duplicateGift]
    const mockReceivedGifts: GiftInfoResponse[] = [duplicateGift] // Same gift

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockSentGifts,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockReceivedGifts,
        }),
      })

    const result = await fetchGiftInfo({
      chainId: mockChainId,
      account: mockAccount,
    })

    // Should only have one gift, not two duplicates
    expect(result).toHaveLength(1)
    expect(result[0].codeHash).toBe('duplicate-hash')
  })

  it('should handle empty responses', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [],
        }),
      })

    const result = await fetchGiftInfo({
      chainId: mockChainId,
      account: mockAccount,
    })

    expect(result).toEqual([])
  })

  it('should handle responses without data field', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          // No data field
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          // No data field
        }),
      })

    const result = await fetchGiftInfo({
      chainId: mockChainId,
      account: mockAccount,
    })

    expect(result).toEqual([])
  })
})
