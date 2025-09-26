import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowDropDownIcon,
  AutoColumn,
  Box,
  Button,
  Checkbox,
  DropDownContainer,
  DropDownHeader,
  Flex,
  Input,
  Modal,
  ModalV2,
  PreTitle,
  Text,
} from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { useRouter } from 'next/router'

import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { type PoolPreset, percentageToFee } from '../sdk'
import { useCreateStableNGPool } from '../hooks/useCreateStableNGPool'

type PresetType = PoolPreset

interface PresetModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedPreset?: PresetType
  onSelectPreset: (preset: PresetType) => void
}

const PresetModal: React.FC<PresetModalProps> = ({ isOpen, onDismiss, selectedPreset, onSelectPreset }) => {
  const { t } = useTranslation()

  const presets = useMemo(
    () => [
      {
        id: t('fiat') as PresetType,
        title: t('Fiat redeemable stablecoins'),
        description: t('Suitable for stablecoins that are fiat redeemable'),
      },
      {
        id: t('crypto') as PresetType,
        title: t('Crypto collateralized stablecoins'),
        description: t('Suitable for stablecoins that are crypto-backed'),
      },
      {
        id: t('lrt') as PresetType,
        title: t('Liquid restaking tokens'),
        description: t('Suitable for LRTS'),
      },
    ],
    [t],
  )

  const handleSelectPreset = useCallback(
    (preset: PresetType) => {
      onSelectPreset(preset)
      onDismiss()
    },
    [onSelectPreset, onDismiss],
  )

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <Modal title="Select Preset" onDismiss={onDismiss} maxWidth="480px">
        <AutoColumn gap="16px">
          {presets.map((preset) => (
            <LightGreyCard
              key={preset.id}
              style={{ cursor: 'pointer', minWidth: '438px' }}
              onClick={() => handleSelectPreset(preset.id)}
            >
              <Flex alignItems="center">
                <Box style={{ flex: 1 }}>
                  <PreTitle fontSize="16px" textTransform="capitalize">
                    {preset.title}
                  </PreTitle>
                  <Text fontSize="14px">{preset.description}</Text>
                </Box>
                {selectedPreset === preset.id ? (
                  <Checkbox checked scale="sm" style={{ flex: 'none' }} readOnly />
                ) : (
                  <Checkbox checked={false} scale="sm" style={{ flex: 'none' }} readOnly />
                )}
              </Flex>
            </LightGreyCard>
          ))}
        </AutoColumn>
      </Modal>
    </ModalV2>
  )
}

export const ParamSettingSection = () => {
  const { t } = useTranslation()
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetType>()
  const [swapFee, setSwapFee] = useState('')
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { createStableNGPool, attemptingTxn } = useCreateStableNGPool()

  const router = useRouter()
  const { chainId } = useAccountActiveChain()

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
  })

  useEffect(() => {
    if (isConfirmed) {
      // NOTE: spefic last log is the PoolCreated event, contain poolId in topics[2]
      // if not, return undefined. Don't use arbitary index here.
      const lastLog = receipt?.logs?.length && receipt.logs.length === 4 ? receipt.logs[3] : undefined
      const poolId = lastLog?.topics[2]

      if (!poolId) {
        console.error('Pool ID not found')
        return
      }

      // router to pool detail page
      router.push(`/liquidity/pool/${chainIdToExplorerInfoChainName[chainId]}/${poolId}`)
    }
  }, [isConfirmed, receipt])

  const getPresetLabel = (preset: PresetType | undefined) => {
    switch (preset) {
      case 'fiat':
        return t('Fiat redeemable stablecoins')
      case 'crypto':
        return t('Crypto collateralized stablecoins')
      case 'lrt':
        return t('Liquid restaking tokens')
      default:
        return t('Select preset')
    }
  }

  const handlePreviewPool = async () => {
    if (!baseCurrency || !quoteCurrency) {
      console.error('Missing currencies for pool creation')
      return
    }

    try {
      // Convert swap fee to the correct format if provided
      const customFee = swapFee ? percentageToFee(parseFloat(swapFee) / 100) : undefined

      const hash = await createStableNGPool({
        tokenA: baseCurrency,
        tokenB: quoteCurrency,
        preset: selectedPreset,
        ...(customFee && { fee: customFee }), // Override fee if custom fee is provided
      })

      if (!hash) {
        throw new Error('Failed to create pool')
      }

      setTxHash(hash)
    } catch (error) {
      console.error('Failed to create pool:', error)
      // Error handling is already done in the hook
    }
  }

  return (
    <Box>
      {/* Pool Parameters Presets */}
      <Box mb="24px">
        <PreTitle textTransform="uppercase">{t('Pool Parameters Presets')}</PreTitle>
        <DropDownContainer p={0} onClick={() => setIsPresetModalOpen(true)}>
          <DropDownHeader justifyContent="space-between">
            <Text id="preset" color={selectedPreset ? 'text' : 'textSubtle'}>
              {getPresetLabel(selectedPreset)}
            </Text>
            <ArrowDropDownIcon color="text" className="down-icon" />
          </DropDownHeader>
        </DropDownContainer>
      </Box>

      {/* Fees */}
      <Box mb="24px">
        <PreTitle textTransform="uppercase">{t('Fees')}</PreTitle>
        <Input
          type="text"
          placeholder="Swap fee (0% - 1%)"
          value={swapFee}
          onChange={(e) => setSwapFee(e.target.value)}
        />
      </Box>

      {/* Preview Pool Button */}
      <Button
        width="100%"
        onClick={handlePreviewPool}
        disabled={!baseCurrency || !quoteCurrency || attemptingTxn}
        isLoading={attemptingTxn}
      >
        {attemptingTxn || isConfirming ? t('Creating Pool...') : t('Preview Pool')}
      </Button>

      {/* Preset Modal */}

      <PresetModal
        isOpen={isPresetModalOpen}
        onDismiss={() => setIsPresetModalOpen(false)}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
      />
    </Box>
  )
}
