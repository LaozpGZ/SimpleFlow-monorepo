import { useTranslation } from '@pancakeswap/localization'
import { Button, Text } from '@pancakeswap/uikit'

export const CommitButton = () => {
  const { t } = useTranslation()

  /** Look at existing commit buttons for states.
   * Such as: Connect Wallet, Switch Network, Approve Tokens (need an extra button on top), etc.
   * Actually, should approve button be in the main button or in the PREVIEW Modal? 🤔
   */
  return (
    <>
      <Button>{t('Place Limit Order')}</Button>
    </>
  )
}
