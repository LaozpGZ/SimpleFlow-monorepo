import React, { useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import {
  Modal,
  ModalV2,
  Button,
  Checkbox,
  Text,
  Box,
  Flex,
  CloseIcon,
  IconButton,
  Card,
  CardBody,
} from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import DoubleCurrencyLogo from 'components/Logo/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { PRESET_CONFIGS, type PoolPreset, type CreateInfinityStablePoolOptions } from '../sdk'

const StyledModal = styled(Modal)`
  max-width: 408px;
  width: 100%;
`

const TokenRow = styled(Flex)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;

  &:first-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`

const ParameterRow = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
`

interface CreatePoolPreviewModalProps {
  isOpen: boolean
  onDismiss: () => void
  tokenA?: Currency
  tokenB?: Currency
  tokenAAmount?: string
  tokenBAmount?: string
  preset?: PoolPreset
  poolOptions?: Partial<CreateInfinityStablePoolOptions>
  onCreatePool: () => void
  isCreating?: boolean
}

export const CreatePoolPreviewModal: React.FC<CreatePoolPreviewModalProps> = ({
  isOpen,
  onDismiss,
  tokenA,
  tokenB,
  tokenAAmount = '1.25',
  tokenBAmount = '0.005',
  preset,
  poolOptions,
  onCreatePool,
  isCreating = false,
}) => {
  const { t } = useTranslation()
  const [confirmed, setConfirmed] = useState(false)

  const presetConfig = preset ? PRESET_CONFIGS[preset] : null

  // Convert bigint values to readable format
  const swapFee = presetConfig?.fee
    ? Number(presetConfig.fee) / 100000000
    : poolOptions?.fee
    ? Number(poolOptions.fee) / 100000000
    : 0.01
  const amplificationParam = presetConfig?.A ? Number(presetConfig.A) : poolOptions?.A ? Number(poolOptions.A) : 500
  const offpegMultiplier = presetConfig?.offpegFeeMultiplier
    ? Number(presetConfig.offpegFeeMultiplier) / 10000000000
    : poolOptions?.offpegFeeMultiplier
    ? Number(poolOptions.offpegFeeMultiplier) / 10000000000
    : 10
  const maExpTime = presetConfig?.maExpTime
    ? Number(presetConfig.maExpTime)
    : poolOptions?.maExpTime
    ? Number(poolOptions.maExpTime)
    : 600

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModal
        title=""
        onDismiss={onDismiss}
        headerBackground="gradientCardHeader"
        headerRightSlot={
          <IconButton variant="text" onClick={onDismiss} style={{ background: 'transparent' }}>
            <CloseIcon color="text" width="24px" />
          </IconButton>
        }
        hideCloseButton
      >
        {/* Token Pair Header */}
        <Flex flexDirection="column" alignItems="center" mb="16px">
          <Box mb="8px">
            {tokenA && tokenB ? (
              <DoubleCurrencyLogo currency0={tokenA} currency1={tokenB} size={32} margin />
            ) : (
              <Box width="64px" height="32px" />
            )}
          </Box>

          <Text fontSize="20px" bold color="text" textAlign="center" mb="8px">
            {tokenA?.symbol || 'Token 1'} / {tokenB?.symbol || 'Token 2'}
          </Text>

          <Box
            background="background"
            border="1px solid"
            borderColor="cardBorder"
            borderRadius="16px"
            px="16px"
            py="8px"
          >
            <Text fontSize="16px" bold color="text">
              StableSwap
            </Text>
          </Box>
        </Flex>

        {/* Token Amounts */}
        <Box mb="16px">
          <TokenRow>
            <Flex alignItems="center" style={{ gap: '8px' }}>
              {tokenA && <CurrencyLogo currency={tokenA} size="24px" />}
              <Text fontSize="16px" bold color="text">
                {tokenA?.symbol || 'Token1'}
              </Text>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-end">
              <Text fontSize="16px" bold color="text">
                {tokenAAmount}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                ~2.85 USD
              </Text>
            </Flex>
          </TokenRow>

          <TokenRow>
            <Flex alignItems="center" style={{ gap: '8px' }}>
              {tokenB && <CurrencyLogo currency={tokenB} size="24px" />}
              <Text fontSize="16px" bold color="text">
                {tokenB?.symbol || 'Token2'}
              </Text>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-end">
              <Text fontSize="16px" bold color="text">
                {tokenBAmount}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                ~2.85 USD
              </Text>
            </Flex>
          </TokenRow>
        </Box>

        {/* Pool Parameters */}
        <StyledCard mb="16px">
          <CardBody>
            <ParameterRow>
              <Text
                fontSize="14px"
                color="textSubtle"
                style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                {t('Swap fee')}
              </Text>
              <Text fontSize="14px" color="text">
                {swapFee.toFixed(3)}%
              </Text>
            </ParameterRow>

            <ParameterRow>
              <Text
                fontSize="14px"
                color="textSubtle"
                style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                A
              </Text>
              <Text fontSize="14px" color="text">
                {amplificationParam}
              </Text>
            </ParameterRow>

            <ParameterRow>
              <Text
                fontSize="14px"
                color="textSubtle"
                style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                {t('Offpeg fee multiplier')}
              </Text>
              <Text fontSize="14px" color="text">
                {offpegMultiplier}
              </Text>
            </ParameterRow>

            <ParameterRow>
              <Text
                fontSize="14px"
                color="textSubtle"
                style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                {t('Moving average time')}
              </Text>
              <Text fontSize="14px" color="text">
                {maExpTime}s
              </Text>
            </ParameterRow>
          </CardBody>
        </StyledCard>

        {/* Confirmation Checkbox */}
        <Flex alignItems="flex-start" style={{ gap: '8px' }} mb="16px">
          <Checkbox scale="sm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <Text fontSize="14px" color="text" style={{ lineHeight: '1.5' }}>
            {t('I confirm that I have reviewed the pool settings and understand the risks of setting it incorrectly.')}
          </Text>
        </Flex>

        {/* Create Pool Button */}
        <Button width="100%" onClick={onCreatePool} disabled={!confirmed || isCreating} isLoading={isCreating}>
          {isCreating ? t('Creating Pool...') : t('Create Pool')}
        </Button>
      </StyledModal>
    </ModalV2>
  )
}
