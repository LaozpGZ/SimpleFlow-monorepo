import { describe, it, expect } from 'vitest'
import { CORS_ALLOW, isOriginAllowed } from './index'

describe('worker-utils', () => {
  it.each([
    ['https://simpleflow.finance', true],
    ['https://simpleflow.finance', true],
    ['https://aptossimpleflow.finance', false],
    ['https://aptos.simpleflow.finance', true],
    ['https://simpleflow.finance.com', false],
    ['http://simpleflow.finance', false],
    ['https://pancake.run', false],
    ['https://test.pancake.run', true],
    ['http://localhost:3000', true],
    ['http://localhost:3001', true],
  ])(`isOriginAllowed(%s)`, (origin, expected) => {
    expect(isOriginAllowed(origin, CORS_ALLOW)).toBe(expected)
  })
})
