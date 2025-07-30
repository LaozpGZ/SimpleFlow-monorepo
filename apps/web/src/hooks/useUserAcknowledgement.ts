import { useAtom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'

const userAckAtomFamily = atomFamily((key: string) =>
  atomWithStorage<boolean>(`pcs_user_ack_${key}`, false, undefined, { getOnInit: true }),
)

export function useUserAcknowledgement(id: string) {
  const { address } = useAccount()

  const key = useMemo(() => (address ? `${id}_${address}` : ''), [id, address])
  const [userACK, setUserACK] = useAtom(userAckAtomFamily(key))

  const ack = useMemo(() => address && userACK, [address, userACK])
  const setAck = useCallback((value: boolean) => address && setUserACK(value), [address, setUserACK])

  return [ack, setAck] as const
}
