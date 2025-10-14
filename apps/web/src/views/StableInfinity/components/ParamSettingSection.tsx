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
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { ApprovalState, useApproveCallbackFromAmount } from 'hooks/useApproveCallback'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { Percent, Currency } from '@pancakeswap/swap-sdk-core'
import { type ERC20Token } from '@pancakeswap/sdk'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { isEvm } from '@pancakeswap/chains'
import { type PoolPreset, percentageToFee, TokenType, type CreateInfinityStablePoolOptions } from '../sdk'
import { ADDRESS_ZERO, NULL_METHOD_ID } from '../sdk/constants'
import { useCreateInfinityStablePool } from '../hooks/useCreateInfinityStablePool'
import { useTokenConfig } from '../contexts/TokenConfigContext'
import { CreatePoolPreviewModal } from './CreatePoolPreviewModal'
import { InfinityStablePoolFactory } from '../sdk'

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
  const [depositAmountA, setDepositAmountA] = useState('')
  const [depositAmountB, setDepositAmountB] = useState('')
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { createInfinityStablePool, attemptingTxn } = useCreateInfinityStablePool()
  const { tokenAConfig, tokenBConfig } = useTokenConfig()

  const router = useRouter()
  const { account, chainId } = useAccountActiveChain()

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

  // Parse deposit amounts
  const parsedAmountA = useMemo(() => tryParseAmount(depositAmountA, baseCurrency), [depositAmountA, baseCurrency])
  const parsedAmountB = useMemo(() => tryParseAmount(depositAmountB, quoteCurrency), [depositAmountB, quoteCurrency])

  // Get user balances
  const [balanceA, balanceB] = useCurrencyBalances(account, [baseCurrency, quoteCurrency])

  // Calculate max amounts
  const maxAmountA = useMemo(() => maxAmountSpend(balanceA), [balanceA])
  const maxAmountB = useMemo(() => maxAmountSpend(balanceB), [balanceB])

  // Get factory address for approvals
  const factoryAddress = useMemo(() => {
    if (!chainId || !isEvm(chainId)) return undefined
    return InfinityStablePoolFactory.getFactoryAddress(chainId)
  }, [chainId])

  // Approval hooks for both tokens
  const { approvalState: approvalA, approveCallback: approveACallback } = useApproveCallbackFromAmount({
    token: (baseCurrency?.isToken && isEvm(baseCurrency.chainId) ? baseCurrency : undefined) as ERC20Token | undefined,
    minAmount: parsedAmountA?.quotient,
    spender: factoryAddress,
  })

  const { approvalState: approvalB, approveCallback: approveBCallback } = useApproveCallbackFromAmount({
    token: (quoteCurrency?.isToken && isEvm(quoteCurrency.chainId) ? quoteCurrency : undefined) as
      | ERC20Token
      | undefined,
    minAmount: parsedAmountB?.quotient,
    spender: factoryAddress,
  })

  // Determine if approvals are needed
  const showFieldAApproval = [ApprovalState.NOT_APPROVED, ApprovalState.PENDING].includes(approvalA) && !!parsedAmountA
  const showFieldBApproval = [ApprovalState.NOT_APPROVED, ApprovalState.PENDING].includes(approvalB) && !!parsedAmountB
  const shouldShowApprovalGroup = showFieldAApproval || showFieldBApproval

  // Validate deposit amounts
  const validateDepositAmounts = () => {
    if (!depositAmountA || !depositAmountB) {
      return t('Please enter both deposit amounts')
    }
    if (!parsedAmountA || !parsedAmountB) {
      return t('Invalid deposit amounts')
    }
    if (parsedAmountA.quotient === 0n || parsedAmountB.quotient === 0n) {
      return t('Deposit amounts must be greater than 0')
    }
    return null
  }

  const presetValidationError = validatePreset()
  const oracleValidationError = validateOracleConfig(tokenAConfig, 'A') || validateOracleConfig(tokenBConfig, 'B')
  const advancedValidationError = validateAdvancedParams()
  const depositAmountsValidationError = validateDepositAmounts()

  // Handle number-only input with optional decimal place limit
  const handleNumberInput = (value: string, allowDecimal = false, maxDecimals?: number) => {
    // Allow empty string
    if (value === '') return ''

    // Only allow numbers and optionally decimal point
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/
    if (!regex.test(value)) {
      return null // Invalid input, don't update
    }

    // Check decimal places if maxDecimals is specified
    if (allowDecimal && maxDecimals !== undefined && value.includes('.')) {
      const decimalPlaces = value.split('.')[1]?.length || 0
      if (decimalPlaces > maxDecimals) {
        return null // Too many decimal places, don't update
      }
    }

    return value
  }

  // Auto-correct value to min/max range on blur
  const handleRangeCorrection = (value: string, min: number, max: number, maxDecimals?: number): string => {
    if (value === '') {
      // Format min value to avoid scientific notation if maxDecimals is specified
      if (maxDecimals !== undefined) {
        return min.toFixed(maxDecimals).replace(/\.?0+$/, '')
      }
      return String(min)
    }

    const numValue = parseFloat(value)
    if (Number.isNaN(numValue)) {
      // Format min value to avoid scientific notation if maxDecimals is specified
      if (maxDecimals !== undefined) {
        return min.toFixed(maxDecimals).replace(/\.?0+$/, '')
      }
      return String(min)
    }

    let corrected = numValue
    if (corrected < min) corrected = min
    if (corrected > max) corrected = max

    // Round to maxDecimals if specified and format to avoid scientific notation
    if (maxDecimals !== undefined) {
      const factor = 10 ** maxDecimals
      corrected = Math.round(corrected * factor) / factor
      // Use toFixed to avoid scientific notation, then remove trailing zeros
      return corrected.toFixed(maxDecimals).replace(/\.?0+$/, '')
    }

    return String(corrected)
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

  // Handlers for swap fee (0% to 1%, max 8 decimal places)
  const handleSwapFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = handleNumberInput(e.target.value, true, 8) // Allow decimal, max 8 decimals

    if (newValue !== null) {
      setSwapFee(newValue)
    }
  }

  const handleSwapFeeBlur = () => {
    const corrected = handleRangeCorrection(swapFee, 0, 1, 8) // Max 8 decimal places
    setSwapFee(corrected)
  }

  // Calculate pool options for contract call
  const poolOptions = useMemo(() => {
    const options: Partial<CreateInfinityStablePoolOptions> = {}

    // Convert swap fee to the correct format if provided
    if (swapFee) {
      const swapFeeValue = parseFloat(swapFee)
      const clampedSwapFee = Math.max(0, Math.min(1, swapFeeValue))
      options.fee = percentageToFee(clampedSwapFee / 100)
    }

    // Convert advanced parameters if enabled
    if (isAdvancedEnabled) {
      if (amplificationParam) {
        options.A = BigInt(amplificationParam.replace(/,/g, ''))
      }
      if (offpegFeeMultiplier) {
        options.offpegFeeMultiplier = BigInt(Math.floor(parseFloat(offpegFeeMultiplier) * 1e10))
      }
      if (movingAverageTime) {
        options.maExpTime = BigInt(Math.floor(parseInt(movingAverageTime, 10) / Math.log(2)))
      }
    }

    return options
  }, [swapFee, isAdvancedEnabled, amplificationParam, offpegFeeMultiplier, movingAverageTime])

  const handlePreviewPool = () => {
    setIsPreviewModalOpen(true)
  }

  const handleCreatePool = async () => {
    if (!isEvm(baseCurrency?.chainId) || !isEvm(quoteCurrency?.chainId)) {
      console.error('Missing currencies for pool creation')
      return
    }

    if (!parsedAmountA || !parsedAmountB) {
      console.error('Missing deposit amounts')
      return
    }

    try {
      const hash = await createInfinityStablePool({
        // NOTE: already check isEvm above, safe to cast
        tokenA: baseCurrency as Currency,
        tokenB: quoteCurrency as Currency,
        preset: selectedPreset,
        assetTypes: [tokenAConfig.type, tokenBConfig.type],
        methodIds: [tokenAConfig.methodId, tokenBConfig.methodId],
        oracles: [tokenAConfig.oracleAddress, tokenBConfig.oracleAddress],
        amount0: parsedAmountA.quotient,
        amount1: parsedAmountB.quotient,
        ...poolOptions,
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
          {t('Fees (0% - 1%, max 8 decimals)')}
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

      {/* Deposit Amount Section */}
      <Box mb="24px">
        <CurrencyInputPanelSimplify
          title={<PreTitle>{t('Deposit Amount')}</PreTitle>}
          showUSDPrice
          maxAmount={maxAmountA}
          onMax={() => setDepositAmountA(maxAmountA?.toExact() ?? '')}
          onPercentInput={(percent) => {
            if (maxAmountA) {
              setDepositAmountA(maxAmountA?.multiply(new Percent(percent, 100)).toExact() ?? '')
            }
          }}
          disableCurrencySelect
          defaultValue={depositAmountA}
          onUserInput={setDepositAmountA}
          showQuickInputButton
          showMaxButton
          currency={baseCurrency}
          id="stable-create-pool-input-tokena"
        />
        <Box my="8px" />
        <CurrencyInputPanelSimplify
          title={<>&nbsp;</>}
          showUSDPrice
          disableCurrencySelect
          maxAmount={maxAmountB}
          onPercentInput={(percent) => {
            if (maxAmountB) {
              setDepositAmountB(maxAmountB?.multiply(new Percent(percent, 100)).toExact() ?? '')
            }
          }}
          onMax={() => setDepositAmountB(maxAmountB?.toExact() ?? '')}
          defaultValue={depositAmountB}
          onUserInput={setDepositAmountB}
          showQuickInputButton
          showMaxButton
          currency={quoteCurrency}
          id="stable-create-pool-input-tokenb"
        />
      </Box>

      {/* Approval Buttons */}
      {shouldShowApprovalGroup && (
        <Box mb="16px">
          {showFieldAApproval && (
            <Button
              width="100%"
              onClick={approveACallback}
              disabled={approvalA === ApprovalState.PENDING}
              mb={showFieldBApproval ? '8px' : '0px'}
            >
              {approvalA === ApprovalState.PENDING
                ? t('Enabling %symbol%', { symbol: baseCurrency?.symbol })
                : t('Enable %symbol%', { symbol: baseCurrency?.symbol })}
            </Button>
          )}
          {showFieldBApproval && (
            <Button width="100%" onClick={approveBCallback} disabled={approvalB === ApprovalState.PENDING}>
              {approvalB === ApprovalState.PENDING
                ? t('Enabling %symbol%', { symbol: quoteCurrency?.symbol })
                : t('Enable %symbol%', { symbol: quoteCurrency?.symbol })}
            </Button>
          )}
        </Box>
      )}

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
          !!advancedValidationError ||
          !!depositAmountsValidationError ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.PENDING ||
          showFieldAApproval ||
          showFieldBApproval
        }
        isLoading={attemptingTxn}
      >
        {attemptingTxn || isConfirming
          ? t('Creating Pool...')
          : presetValidationError ||
            oracleValidationError ||
            advancedValidationError ||
            depositAmountsValidationError ||
            t('Preview Pool')}
      </Button>

      {/* Preset Modal */}

      <PresetModal
        isOpen={isPresetModalOpen}
        onDismiss={() => setIsPresetModalOpen(false)}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
      />

      {/* Create Pool Preview Modal */}
      {isEvm(baseCurrency?.chainId) && isEvm(quoteCurrency?.chainId) && (
        <CreatePoolPreviewModal
          isOpen={isPreviewModalOpen}
          onDismiss={() => setIsPreviewModalOpen(false)}
          tokenA={baseCurrency as Currency}
          tokenB={quoteCurrency as Currency}
          preset={selectedPreset}
          swapFee={swapFee}
          amplificationParam={amplificationParam}
          offpegFeeMultiplier={offpegFeeMultiplier}
          movingAverageTime={movingAverageTime}
          depositAmountA={depositAmountA}
          depositAmountB={depositAmountB}
          onCreatePool={handleCreatePool}
          isCreating={attemptingTxn || isConfirming}
        />
      )}
    </Box>
  )
}
