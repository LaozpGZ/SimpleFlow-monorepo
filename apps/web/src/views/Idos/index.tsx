import { useTranslation } from '@pancakeswap/localization'
import { useModal } from '@pancakeswap/uikit'
import USCitizenConfirmModal from 'components/Modal/USCitizenConfirmModal'
import { IdType, useUserNotUsCitizenAcknowledgement } from 'hooks/useUserIsUsCitizenAcknowledgement'
import { useEffect } from 'react'
import { styled } from 'styled-components'
import Hero from './components/Hero'
import IfoProvider from './contexts/IfoContext'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 16px;
`

export const IdoPageLayout = ({ children }) => {
  const { t } = useTranslation()

  const [userNotUsCitizenAcknowledgement] = useUserNotUsCitizenAcknowledgement(IdType.IFO)
  const [onUSCitizenModalPresent] = useModal(
    <USCitizenConfirmModal
      title={t('PancakeSwap IDOs')}
      id={IdType.IFO}
      checks={[
        {
          key: 'checkbox',
          content: t('I confirm that I am eligible to participate in IDOs on this platform.'),
        },
      ]}
    />,
    false,
    false,
    'usCitizenConfirmModalIDO',
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userNotUsCitizenAcknowledgement) {
        onUSCitizenModalPresent()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [userNotUsCitizenAcknowledgement, onUSCitizenModalPresent])

  return (
    <IfoProvider>
      <Wrapper>
        <Hero />
        {children}
      </Wrapper>
    </IfoProvider>
  )
}
