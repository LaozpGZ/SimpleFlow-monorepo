import { getChainName } from '@pancakeswap/chains'
import { LS_CB1 } from 'config/constants'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'

interface CB1State {
  expired: number
}

const BASE_URI = 'https://user-volume-api-dzb9r.ondigitalocean.app'
const EXPIRE = 1000 * 24 * 3600 * 7

async function getCb1Membership(chain: string, address: string) {
  const date = getLastUpdateDate()
  const chainForAttest = chain === 'bsc' ? 'base' : chain
  const resp = await fetch(`${BASE_URI}/api/attestation/${chainForAttest}?date=${date}&userAddress=${address}`)
  const json = await resp.json()
  const attested = Boolean(json?.qualified)
  return attested
}

function getLastUpdateDate(date?: Date) {
  const currentDate = date || new Date()

  const utcHour = currentDate.getUTCHours()

  if (utcHour >= 2) {
    currentDate.setUTCDate(currentDate.getUTCDate() - 1)
  } else {
    currentDate.setUTCDate(currentDate.getUTCDate() - 2)
  }

  const year = currentDate.getUTCFullYear()
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
      return true
    }
    return false
  }
  const attested = await getCb1Membership(chain, address)
  if (attested) {
    const cb1State: CB1State = {
      expired: Date.now() + EXPIRE,
    }
    localStorage.setItem(`${LS_CB1}-${address}`, JSON.stringify(cb1State))
  }
  return attested
}

const showCb1PopupAtom = atomFamily(
  (params: { chain?: string; address?: string }) => {
    return atom(async () => {
      return showCb1Popup(params.chain, params.address)
    })
  },
  (a, b) => a.address === b.address && a.chain === b.chain,
)

export const useShowCb1Popup = () => {
  const { account, chainId } = useAccountActiveChain()
  const chainName = getChainName(chainId)
  const showCb1 = useAtomValue(showCb1PopupAtom({ chain: chainName, address: account }))
  return showCb1
}
