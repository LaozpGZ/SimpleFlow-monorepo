import { useAccount } from '@simpleflow/awgmi'
import { useIsMounted } from '@simpleflow/hooks'

export default function HasAccount({ fallbackComp, children }) {
  const { account } = useAccount()
  const isMounted = useIsMounted()

  return isMounted && account ? <>{children}</> : fallbackComp
}
