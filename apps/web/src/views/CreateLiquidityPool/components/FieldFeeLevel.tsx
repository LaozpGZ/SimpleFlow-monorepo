import { usePreviousValue } from '@pancakeswap/hooks'
import { POOL_TYPE, PoolType } from '@pancakeswap/infinity-sdk'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  BoxProps,
  ButtonMenu,
  ButtonMenuItem,
  ErrorIcon,
  FlexGap,
  Input,
  InputGroup,
  PreTitle,
  QuestionHelper,
  Text,
} from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { escapeRegExp } from 'utils'
import { useInfinityCreateFormQueryState } from '../hooks/useInfinityFormState/useInfinityFormQueryState'
import { PRESET_FEE_LEVELS_INFINITY } from '../constants'

export type FieldFeeLevelProps = {
  allowCustomFee?: boolean
} & BoxProps

const decimals = 4

const FEE_LIMIT = {
  [POOL_TYPE.Bin]: 10,
  [POOL_TYPE.CLAMM]: 100,
}

export const isFeeOutOfRange = (fee?: number | null, poolType?: PoolType) => {
  if (!fee || !poolType) {
    return false
  }
  return poolType === POOL_TYPE.CLAMM ? fee >= FEE_LIMIT[POOL_TYPE.CLAMM] : fee >= FEE_LIMIT[POOL_TYPE.Bin]
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const FieldFeeLevel: React.FC<FieldFeeLevelProps> = ({ allowCustomFee, ...boxProps }) => {
  const { t } = useTranslation()
  const [feeLevel, setFeeLevel] = useFeeLevelQueryState()
  const { poolType, feeTierSetting } = useInfinityCreateFormQueryState()
  const [inputValue, setInputValue] = useState<string | null>(null)

  const tips = useMemo(() => {
    if (!feeLevel || feeTierSetting === 'dynamic') return null
    if (isFeeOutOfRange(feeLevel, poolType)) {
      return (
        <FlexGap gap="6px" mt="8px">
          <ErrorIcon color="failure" />
          <Text color="failure">
            {t('The fee must be below %amount%%', {
              amount: poolType === POOL_TYPE.CLAMM ? FEE_LIMIT[POOL_TYPE.CLAMM] : FEE_LIMIT[POOL_TYPE.Bin],
            })}
          </Text>
        </FlexGap>
      )
    }
    if (feeLevel > 0.3) {
      return (
        <FlexGap gap="6px" mt="8px">
          <ErrorIcon color="yellow" />
          <Text color="yellow">{t('Consider lowering the fee')}</Text>
        </FlexGap>
      )
    }
    return null
  }, [feeTierSetting, poolType, feeLevel, t])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let { value: v } = e.target

    v = v.replace(/,/g, '.')

    if (inputRegex.test(escapeRegExp(v))) {
      const d = v.split('.')[1]?.length
      if (d && d > decimals) return
      setInputValue(v)
    }
  }, [])

  const handleInputBlur = useCallback(() => {
    if (inputValue === null) return
    if (inputValue === '') {
      setFeeLevel(null)
      return
    }
    const value = parseFloat(inputValue)
    setFeeLevel(value)
    setInputValue(value.toString())
  }, [inputValue, setFeeLevel])

  const handleQuickSelect = useCallback(
    (presetFeeLevel: number) => {
      setFeeLevel(presetFeeLevel)
      setInputValue(presetFeeLevel.toString())
    },
    [setFeeLevel],
  )

  const handleMenuItemClick = useCallback(
    (index: number) => {
      if (index < PRESET_FEE_LEVELS_INFINITY.length) {
        handleQuickSelect(PRESET_FEE_LEVELS_INFINITY[index])
      }
      // For custom fee input, we don't need to do anything here
      // as the input will be handled separately
    },
    [handleQuickSelect],
  )

  const activeIndex = useMemo(() => {
    const presetIndex = PRESET_FEE_LEVELS_INFINITY.findIndex((preset) => preset === feeLevel)
    if (presetIndex !== -1) {
      return presetIndex
    }
    // If custom fee is set and allowCustomFee is true, return the custom index
    if (allowCustomFee && feeLevel !== null && !PRESET_FEE_LEVELS_INFINITY.includes(feeLevel)) {
      return PRESET_FEE_LEVELS_INFINITY.length
    }
    return -1
  }, [feeLevel, allowCustomFee])

  const prevFeeLevel = usePreviousValue(feeLevel)

  useEffect(() => {
    if (inputValue === null && feeLevel !== null) {
      setInputValue(parseFloat(feeLevel.toFixed(decimals)).toString())
    }
  }, [feeLevel, inputValue])

  useEffect(() => {
    if (prevFeeLevel !== null && feeLevel === null) {
      setInputValue(null)
    }
  }, [feeLevel, prevFeeLevel])

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('Fee Level')}</PreTitle>
        <QuestionHelper
          placement="auto"
          mb="8px"
          color="secondary"
          text={t('Common range: 0.01% to 0.3%, Ideal range <1%')}
        />
      </FlexGap>

      <ButtonMenu activeIndex={activeIndex} onItemClick={handleMenuItemClick} variant="subtle" fullWidth>
        <ButtonMenuItem>{PRESET_FEE_LEVELS_INFINITY[0]}%</ButtonMenuItem>
        <ButtonMenuItem>{PRESET_FEE_LEVELS_INFINITY[1]}%</ButtonMenuItem>
        <ButtonMenuItem>{PRESET_FEE_LEVELS_INFINITY[2]}%</ButtonMenuItem>

        {allowCustomFee ? (
          <ButtonMenuItem minWidth="180px">
            <InputGroup endIcon={<>%</>}>
              <StyledInput
                pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
                inputMode="decimal"
                placeholder={t('Custom')}
                step="0.01"
                min="0"
                max="100"
                value={inputValue ?? ''}
                onBlur={handleInputBlur}
                onChange={handleInputChange}
              />
            </InputGroup>
          </ButtonMenuItem>
        ) : (
          <></>
        )}
      </ButtonMenu>

      {tips}
    </Box>
  )
}

const StyledInput = styled(Input)`
  border: none;
  width: 100%;
`
