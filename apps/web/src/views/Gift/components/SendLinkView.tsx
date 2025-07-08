import { useTranslation } from '@pancakeswap/localization'
import { copyText, useToast } from '@pancakeswap/uikit'
import { NoteContainer } from 'components/NoteContainer'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { multiplyPriceByAmount } from 'utils/prices'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { generateClaimLink } from '../utils/generateClaimLink'

export function SendLinkView({
  tokenAmount,
  nativeAmount,
  code,
}: {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
  code: string
}) {
  const { t } = useTranslation()
  const claimLink = generateClaimLink({ code })
  const { toastSuccess } = useToast()

  const stablePrice = useStablecoinPrice(tokenAmount?.currency)
  const stableNativePrice = useStablecoinPrice(nativeAmount?.currency)

  const tokenUsd = multiplyPriceByAmount(stablePrice, parseFloat(tokenAmount.toExact()))
  const nativeUsd = multiplyPriceByAmount(stableNativePrice, parseFloat(nativeAmount?.toExact() || '0'))

  const totalUsd = tokenUsd + nativeUsd

  return (
    <>
      <NoteContainer mb="16px" p="8px">
        {t(`Just sent you ${formatDollarAmount(totalUsd)}! 🎉 Tap this link and to claim it: 👉 ${claimLink}`)}
        <br />
        <br />
        {t(`Please connect your wallet to claim it!`)}
        <br />
        <br />
        {t(`Alternatively, you can manually enter the code ${code} on PancakeSwap wallet to claim.`)}
      </NoteContainer>

      <ActionButton
        variant="danger"
        onClick={() => {
          copyText(claimLink)
          toastSuccess(t('Claim code'), t('Copied!'))
        }}
      >
        {t('Copy')}
      </ActionButton>
    </>
  )
}
