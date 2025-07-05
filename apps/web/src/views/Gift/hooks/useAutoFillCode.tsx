/**
 * Auto fill code from url params
 *
 * /invite/[code]
 *
 * 1. open the WalletModal
 * 2. display ClaimGiftView
 *
 * Ensure it only shows on the first render
 */

import { ViewState } from 'components/WalletModalV2/type'
import { useWalletModalV2ViewState } from 'components/WalletModalV2/WalletModalV2ViewStateProvider'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { ClaimGiftContext } from '../providers/ClaimGiftProvider'

export const useAutoFillCode = ({ onAutoFillCode }: { onAutoFillCode: () => void }) => {
  const { setViewState } = useWalletModalV2ViewState()
  const { setCode } = useContext(ClaimGiftContext)

  const router = useRouter()

  const code = router.query.code as string

  useEffect(() => {
    // Check if the URL contains '/invite' and set view state to CLAIM_GIFT on first render
    if (router.asPath.includes('/invite')) {
      // validate code here
      if (!code) {
        return
      }

      setViewState(ViewState.CLAIM_GIFT)
      setCode(code)

      onAutoFillCode()
    }
  }, [code]) // Empty dependency array ensures this runs only on first render
}
