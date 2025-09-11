import { useTranslation, Trans } from '@pancakeswap/localization'

export const TestI18n = () => {
  const { t } = useTranslation()
  return (
    <p>
      {t('Hello World!')}
      <Trans i18nTemplate="Hello <0>World</0>!" components={[<strong key={0} />]} />
    </p>
  )
}
