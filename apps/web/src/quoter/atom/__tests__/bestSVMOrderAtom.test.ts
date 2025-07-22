import { describe, expect, it } from 'vitest'
import { bestSVMOrderAtom } from '../bestSVMOrderAtom'

describe('bestSVMOrderAtom', () => {
  it('should create an atom family function', () => {
    expect(typeof bestSVMOrderAtom).toBe('function')
  })

  it('should return an atom when called with a query', () => {
    const mockQuery = {
      baseCurrency: null,
      currency: null,
      amount: null,
      tradeType: undefined,
      enabled: false,
      infinitySwap: false,
      hash: 'test-hash',
      speedQuoteEnabled: false,
      xEnabled: false,
      blockNumber: 0,
      destinationBlockNumber: 0,
      gasLimitDestinationChain: undefined,
      nonce: 0,
      for: 'main' as const,
      gasLimit: undefined,
    } as any

    const atom = bestSVMOrderAtom(mockQuery)
    expect(atom).toBeDefined()
    expect(typeof atom).toBe('object')
    // Jotai atoms have specific properties
    expect(atom).toHaveProperty('read')
    expect(typeof atom.read).toBe('function')
  })
})
