import { useCallback, useMemo, useState } from 'react'
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
import { useCreateStableNGPool } from '../hooks/useCreateStableNGPool'
import { type PoolPreset, percentageToFee } from '../sdk'

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

      await createStableNGPool({
        tokenA: baseCurrency,
        tokenB: quoteCurrency,
        preset: selectedPreset,
        ...(customFee && { fee: customFee }), // Override fee if custom fee is provided
      })
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
        {attemptingTxn ? t('Creating Pool...') : t('Preview Pool')}
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
