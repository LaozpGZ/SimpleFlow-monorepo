import { LS_CB1 } from 'config/constants'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

interface CB1State {
  expired: number
}

const BASE_URI = 'https://user-volume-api-dzb9r.ondigitalocean.app'
const ONE_DAY = 86400000

async function getCb1Membership(chain: string, address: string) {
  const resp = await fetch(`${BASE_URI}/api/attestation/${chain}?date=2025-02-14&userAddress=${address}`)
  const json = await resp.json()
  const attested = Boolean(json?.qualified)

  return attested
}

async function showCb1Popup(chain?: string, address?: string) {
  if (!address || !chain) {
    return false
  }
  if (['base', 'bnb', 'arb'].includes(chain)) {
    return false
  }

  const lsItem = localStorage.getItem(`${LS_CB1}-${address}`)
  if (lsItem) {
    const cb1State: CB1State = JSON.parse(lsItem)
    if (cb1State.expired < Date.now()) {
      return false
    }
  }
  const attested = await getCb1Membership(chain, address)
  if (attested) {
    const cb1State: CB1State = {
      expired: Date.now() + ONE_DAY,
    }
    localStorage.setItem(`${LS_CB1}-${address}`, JSON.stringify(cb1State))
  }
  return attested
}

export const showCb1PopupAtom = atomFamily(
  (params: { chain?: string; address?: string }) => {
    return atom(async () => {
      return showCb1Popup(params.chain, params.address)
    })
  },
  (a, b) => a.address === b.address && a.chain === b.chain,
)
