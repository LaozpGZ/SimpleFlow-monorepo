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
  InfoIcon,
  Input,
  Modal,
  ModalV2,
  PreTitle,
  Text,
  Toggle,
} from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { useRouter } from 'next/router'

import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { isEvm } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { type PoolPreset, percentageToFee, TokenType, type CreateInfinityStablePoolOptions } from '../sdk'
import { ADDRESS_ZERO, NULL_METHOD_ID } from '../sdk/constants'
import { useCreateInfinityStablePool } from '../hooks/useCreateInfinityStablePool'
import { useTokenConfig } from '../contexts/TokenConfigContext'
import { CreatePoolPreviewModal } from './CreatePoolPreviewModal'

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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetType>()
  const [swapFee, setSwapFee] = useState('0.01')
  const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(false)
  const [amplificationParam, setAmplificationParam] = useState('1000')
  const [offpegFeeMultiplier, setOffpegFeeMultiplier] = useState('10')
  const [movingAverageTime, setMovingAverageTime] = useState('60')
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { createInfinityStablePool, attemptingTxn } = useCreateInfinityStablePool()
  const { tokenAConfig, tokenBConfig } = useTokenConfig()

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
  }, [isConfirmed, receipt, chainId, router])

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

  // Validate preset is required
  const validatePreset = () => {
    if (!selectedPreset) {
      return t('Please select a pool parameters preset')
    }
    return null
  }

  // Validate oracle configurations
  const validateOracleConfig = (config: typeof tokenAConfig, tokenName: string) => {
    if (config.type === TokenType.ORACLE) {
      if (config.oracleAddress === ADDRESS_ZERO || !config.oracleAddress) {
        return t('Please provide oracle address for Token %token%', { token: tokenName })
      }
      if (config.methodId === NULL_METHOD_ID || !config.methodId) {
        return t('Please provide valid function name for Token %token%', { token: tokenName })
      }
    }
    return null
  }

  // Validate advanced parameters
  const validateAdvancedParams = () => {
    if (!isAdvancedEnabled) return null

    if (amplificationParam) {
      const a = parseInt(amplificationParam.replace(/,/g, ''), 10)
      if (Number.isNaN(a) || a < 1 || a > 20000) {
        return t('A parameter must be between 1 and 20000')
      }
    }

    if (offpegFeeMultiplier) {
      const multiplier = parseFloat(offpegFeeMultiplier)
      if (Number.isNaN(multiplier) || multiplier < 0 || multiplier > 50) {
        return t('Offpeg fee multiplier must be between 0 and 50')
      }
    }

    if (movingAverageTime) {
      const time = parseInt(movingAverageTime, 10)
      if (Number.isNaN(time) || time < 60 || time > 3600) {
        return t('Moving average time must be between 60 and 3600 seconds')
      }
    }

    return null
  }

  const presetValidationError = validatePreset()
  const oracleValidationError = validateOracleConfig(tokenAConfig, 'A') || validateOracleConfig(tokenBConfig, 'B')
  const advancedValidationError = validateAdvancedParams()

  // Handle number-only input
  const handleNumberInput = (value: string, allowDecimal = false) => {
    // Allow empty string
    if (value === '') return ''

    // Only allow numbers and optionally decimal point
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/
    if (regex.test(value)) {
      return value
    }
    return null // Invalid input, don't update
  }

  // Auto-correct value to min/max range on blur
  const handleRangeCorrection = (value: string, min: number, max: number): string => {
    if (value === '') return String(min)

    const numValue = parseFloat(value)
    if (Number.isNaN(numValue)) return String(min)

    if (numValue < min) return String(min)
    if (numValue > max) return String(max)

    return value
  }

  // Handlers for A parameter
  const handleAmplificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = handleNumberInput(e.target.value)
    if (newValue !== null) {
      setAmplificationParam(newValue)
    }
  }

  const handleAmplificationBlur = () => {
    const corrected = handleRangeCorrection(amplificationParam, 1, 20000)
    setAmplificationParam(corrected)
  }

  // Handlers for offpeg fee multiplier
  const handleOffpegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = handleNumberInput(e.target.value, true) // Allow decimal
    if (newValue !== null) {
      setOffpegFeeMultiplier(newValue)
    }
  }

  const handleOffpegBlur = () => {
    const corrected = handleRangeCorrection(offpegFeeMultiplier, 0, 50)
    setOffpegFeeMultiplier(corrected)
  }

  // Handlers for moving average time
  const handleMovingAverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = handleNumberInput(e.target.value)
    if (newValue !== null) {
      setMovingAverageTime(newValue)
    }
  }

  const handleMovingAverageBlur = () => {
    const corrected = handleRangeCorrection(movingAverageTime, 60, 3600)
    setMovingAverageTime(corrected)
  }

  // Handlers for swap fee (0% to 1%)
  const handleSwapFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = handleNumberInput(e.target.value, true) // Allow decimal
    if (newValue !== null) {
      setSwapFee(newValue)
    }
  }

  const handleSwapFeeBlur = () => {
    const corrected = handleRangeCorrection(swapFee, 0, 1)
    setSwapFee(corrected)
  }

  const handlePreviewPool = () => {
    setIsPreviewModalOpen(true)
  }

  const handleCreatePool = async () => {
    if (!isEvm(baseCurrency?.chainId) || !isEvm(quoteCurrency?.chainId)) {
      console.error('Missing currencies for pool creation')
      return
    }

    try {
      // Convert swap fee to the correct format if provided
      // Ensure swap fee is clamped to 0-1 range before conversion
      const swapFeeValue = parseFloat(swapFee)
      const clampedSwapFee = Math.max(0, Math.min(1, swapFeeValue))
      const customFee = swapFee ? percentageToFee(clampedSwapFee / 100) : undefined

      // Convert advanced parameters if provided
      const advancedOptions: Partial<CreateInfinityStablePoolOptions> = {}

      if (isAdvancedEnabled) {
        if (amplificationParam) {
          advancedOptions.A = BigInt(amplificationParam.replace(/,/g, ''))
        }
        if (offpegFeeMultiplier) {
          advancedOptions.offpegFeeMultiplier = BigInt(Math.floor(parseFloat(offpegFeeMultiplier) * 1e10))
        }
        if (movingAverageTime) {
          advancedOptions.maExpTime = BigInt(Math.floor(parseInt(movingAverageTime, 10) / Math.log(2)))
        }
      }

      const hash = await createInfinityStablePool({
        // NOTE: already check isEvm above, safe to cast
        tokenA: baseCurrency as Currency,
        tokenB: quoteCurrency as Currency,
        preset: selectedPreset,
        ...(customFee && { fee: customFee }), // Override fee if custom fee is provided
        ...advancedOptions, // Override advanced parameters if provided
      })

      if (!hash) {
        throw new Error('Failed to create pool')
      }

      setTxHash(hash)
      setIsPreviewModalOpen(false)
    } catch (error) {
      console.error('Failed to create pool:', error)
      // Error handling is already done in the hook
    }
  }

  return (
    <Box>
      {/* Pool Parameters Presets */}
      <Box mb="24px">
        <PreTitle textTransform="uppercase" mb="8px">
          {t('Pool Parameters Presets')}
        </PreTitle>
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
        <PreTitle textTransform="uppercase" mb="8px">
          {t('Fees (0% - 1%)')}
        </PreTitle>
        <Input type="text" value={swapFee} onChange={handleSwapFeeChange} onBlur={handleSwapFeeBlur} />
      </Box>

      {/* Advanced Settings */}
      <LightGreyCard mb="24px">
        <Flex justifyContent="space-between" alignItems="center" mb={isAdvancedEnabled ? '16px' : '0px'}>
          <Text bold fontSize="16px">
            {t('Advanced')}
          </Text>
          <Toggle checked={isAdvancedEnabled} onChange={() => setIsAdvancedEnabled(!isAdvancedEnabled)} scale="sm" />
        </Flex>

        {isAdvancedEnabled && (
          <AutoColumn gap="16px">
            {/* Amplification Parameter (A) */}
            <Box>
              <PreTitle textTransform="uppercase" mb="8px">
                {t('A (1-20000)')}
              </PreTitle>
              <Input
                type="text"
                value={amplificationParam}
                onChange={handleAmplificationChange}
                onBlur={handleAmplificationBlur}
              />
            </Box>

            {/* Offpeg Fee Multiplier */}
            <Box>
              <PreTitle textTransform="uppercase" mb="8px">
                {t('Offpeg fee multiplier (0-50)')}
              </PreTitle>
              <Input type="text" value={offpegFeeMultiplier} onChange={handleOffpegChange} onBlur={handleOffpegBlur} />
            </Box>

            {/* Moving Average Time */}
            <Box>
              <Flex alignItems="center" mb="8px">
                <PreTitle textTransform="uppercase" mr="4px">
                  {t('moving average time (60-3600) seconds')}
                </PreTitle>
                <Box style={{ cursor: 'pointer' }}>
                  <InfoIcon width="16px" color="textSubtle" />
                </Box>
              </Flex>
              <Input
                type="text"
                value={movingAverageTime}
                onChange={handleMovingAverageChange}
                onBlur={handleMovingAverageBlur}
              />
            </Box>
          </AutoColumn>
        )}
      </LightGreyCard>

      {/* Preview Pool Button */}
      <Button
        width="100%"
        onClick={handlePreviewPool}
        disabled={
          !baseCurrency ||
          !quoteCurrency ||
          attemptingTxn ||
          !!presetValidationError ||
          !!oracleValidationError ||
          !!advancedValidationError
        }
        isLoading={attemptingTxn}
      >
        {attemptingTxn || isConfirming
          ? t('Creating Pool...')
          : presetValidationError || oracleValidationError || advancedValidationError || t('Preview Pool')}
      </Button>

      {/* Preset Modal */}

      <PresetModal
        isOpen={isPresetModalOpen}
        onDismiss={() => setIsPresetModalOpen(false)}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
      />

      {/* Create Pool Preview Modal */}
      {isEvm(baseCurrency?.chainId) &&
        isEvm(quoteCurrency?.chainId) &&
        (() => {
          // Clamp swap fee to 0-1 range before passing to modal
          const swapFeeValue = parseFloat(swapFee)
          const clampedSwapFee = Math.max(0, Math.min(1, swapFeeValue))

          return (
            <CreatePoolPreviewModal
              isOpen={isPreviewModalOpen}
              onDismiss={() => setIsPreviewModalOpen(false)}
              tokenA={baseCurrency as Currency}
              tokenB={quoteCurrency as Currency}
              preset={selectedPreset}
              poolOptions={{
                ...(swapFee && { fee: percentageToFee(clampedSwapFee / 100) }),
                ...(isAdvancedEnabled && amplificationParam && { A: BigInt(amplificationParam.replace(/,/g, '')) }),
                ...(isAdvancedEnabled &&
                  offpegFeeMultiplier && {
                    offpegFeeMultiplier: BigInt(Math.floor(parseFloat(offpegFeeMultiplier) * 1e10)),
                  }),
                ...(isAdvancedEnabled &&
                  movingAverageTime && {
                    maExpTime: BigInt(Math.floor(parseInt(movingAverageTime, 10) / Math.log(2))),
                  }),
              }}
              onCreatePool={handleCreatePool}
              isCreating={attemptingTxn || isConfirming}
              tokenAConfig={tokenAConfig}
              tokenBConfig={tokenBConfig}
            />
          )
        })()}
    </Box>
  )
}
