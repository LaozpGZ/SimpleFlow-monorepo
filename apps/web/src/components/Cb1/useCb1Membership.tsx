import { getChainName } from '@pancakeswap/chains'
import { LS_CB1 } from 'config/constants'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useEffect, useState } from 'react'

interface CB1State {
  expired: number
}

const BASE_URI = 'https://user-volume-api-dzb9r.ondigitalocean.app'
const EXPIRE = 1000 * 24 * 3600 * 7

async function getCb1Membership(chain: string, address: string) {
  const date = getLastUpdateDate()
  const resp = await fetch(`${BASE_URI}/api/attestation/base?userAddress=${address}`)
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

export const useShowCb1Popup = () => {
  const { account, chainId } = useAccountActiveChain()
  const [showCb1, setShowCb1] = useState(false)

  const chainName = getChainName(chainId)
  const load = async () => {
    const show = await showCb1Popup(chainName, account)
    requestAnimationFrame(() => {
      setShowCb1(show)
    })
  }
  useEffect(() => {
    load()
  }, [account, chainId])

  return showCb1
}
