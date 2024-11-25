import { useTranslation } from '@pancakeswap/localization'
import { LinkExternal, Text, useModal } from '@pancakeswap/uikit'
import { ReactNode, useCallback, useEffect } from 'react'

import DisclaimerModal from 'components/DisclaimerModal'
import { useUserIsInAffiliateListData } from 'hooks/useAffiliateSunsetList'
import { useUserAcknowledgement } from 'hooks/useUserAcknowledgement'

const transRegex = /(%[^%]+%)/

function Trans({ text, data = {} }: { text: string; data?: { [key: string]: ReactNode } }) {
  const parts = text.split(transRegex)
  return parts.map((p) => {
    if (!transRegex.test(p)) {
      return p
    }
    const key = p.replace(/%/g, '')
    return data[key] || p
  })
}

export function AffiliateSunsetModal() {
  const { t } = useTranslation()
  const isInList = useUserIsInAffiliateListData()
  const [ack, setACK] = useUserAcknowledgement('affiliate-referral-sunset-v1')
  const onConfirm = useCallback(() => setACK(true), [setACK])

  const [onOptionsConfirmModalPresent] = useModal(
    <DisclaimerModal
      bodyMaxWidth={['100%', '100%', '100%', '740px']}
      bodyMaxHeight="80vh"
      modalHeader={t('Important Update: Closure of the PancakeSwap Affiliate Program')}
      header={
        <>
          <Text bold fontSize="1.25rem">
            {t('Important Update')}
          </Text>
          <Text mt="1.5rem">
            {t(`The PancakeSwap Affiliate Program will officially close on %time%`, {
              time: 'December 31, 2024',
            })}
          </Text>
          <Text mt="1.5rem">
            <Trans
              text={t(
                `Please %claim% any pending trading discounts before this date, as discount redemptions will no longer be available after that.`,
              )}
              data={{
                claim: (
                  <LinkExternal
                    bold
                    style={{ display: 'inline-flex' }}
                    showExternalIcon={false}
                    href="/affiliates-program/dashboard"
                  >
                    {t('claim')}
                  </LinkExternal>
                ),
              }}
            />
          </Text>
        </>
      }
      id="affiliate-sunset-modal"
      checks={[
        {
          key: 'checkbox',
          content: t(`I've read and understood the following update.`),
        },
      ]}
      onSuccess={onConfirm}
    />,
    false,
    false,
    'affiliateSunsetModal',
  )

  useEffect(() => {
    if (isInList && ack === false) {
      onOptionsConfirmModalPresent()
    }
  }, [isInList, ack, onOptionsConfirmModalPresent])

  return null
}
