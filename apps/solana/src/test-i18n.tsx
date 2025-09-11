import { useTranslation, Trans } from '@pancakeswap/localization'

export const TestI18n = () => {
  const { t } = useTranslation()
  return <Trans>Test Trigger</Trans>
}
