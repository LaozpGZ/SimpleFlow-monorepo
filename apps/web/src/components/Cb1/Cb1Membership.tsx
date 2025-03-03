import { getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Modal, ModalV2, Text } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useEffect } from 'react'
import styled from 'styled-components'

export const Cb1Membership = () => {
  const { chainId, account } = useAccountActiveChain()
  const chainName = getChainName(chainId)

  useEffect(() => {}, [chainId, account])
  const { t } = useTranslation()

  return (
    <ModalV2 isOpen>
      <Modal title={t('You are Eligible!')}>
        <Cb1Image src={`${ASSET_CDN}/web/promotion/cb1.webp`} />
        <Text>$8.453 {t('to be earned!')}</Text>
        <Text>
          <b>Coinbase One </b>
          {t('members who trade on PancakeSwap are eligible to earn $8,453 airdropped to their wallet 2x monthly!')}
        </Text>
      </Modal>
    </ModalV2>
  )
}

const Cb1Image = styled.img`
  width: 100%;
  height: auto;
  margin-top: 24px;
`
