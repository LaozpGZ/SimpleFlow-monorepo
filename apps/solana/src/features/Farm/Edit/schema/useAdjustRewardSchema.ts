import { useState, useEffect } from 'react'
import * as yup from 'yup'
import Decimal from 'decimal.js'
import { useTranslation, type TranslateFunction } from '@pancakeswap/localization'
import { MAX_DURATION_DAYS, MIN_DURATION_DAYS } from '@/store/configs/farm'
import { EditReward } from '../util'

interface Props {
  remainSeconds: Decimal
  isDecrease: boolean
  onlineCurrentDate: number
  oldReward: EditReward
  daysExtend?: string | number
  balance: string | number
  amount?: string | number
}

export const ADJUST_REWARD_ERROR = {
  BALANCE_INSUFFICIENT: 'Insufficient sub balance',
  DECREASE: 'Decrease Reward Rate',
  DECREASE_72h: 'Decrease reward within 72 hours',
  DAYS_EXTEND: 'Add reward days'
}

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const schema = (t: TranslateFunction) =>
  yup.object().shape({
    amount: yup
      .number()
      .min(0, t('Enter token amount') ?? '')
      .transform((value) => (Number.isNaN(value) ? 0 : value))
      .test('is-amount-valid', t('Invalid amount') ?? '', function () {
        // if (new Decimal(val || 0).gt(this.parent.balance))
        //   return this.createError({
        //     message: ADJUST_REWARD_ERROR.BALANCE_INSUFFICIENT
        //   })
        const isWithin72hrs = this.parent.remainSeconds.gte(0) && this.parent.remainSeconds.lte(3600 * 72)
        if (this.parent.isDecrease) {
          if (!isWithin72hrs)
            return this.createError({
              message: t(ADJUST_REWARD_ERROR.DECREASE_72h)
            })
          return this.createError({ message: t(ADJUST_REWARD_ERROR.DECREASE) })
        }

        return true
      }),
    daysExtend: numberTransform
      .moreThan(MIN_DURATION_DAYS - 1, ADJUST_REWARD_ERROR.DAYS_EXTEND)
      .lessThan(MAX_DURATION_DAYS + 1, ADJUST_REWARD_ERROR.DAYS_EXTEND)
  })

export default function useAdjustRewardSchema(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      schema(t).validateSync(props)
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props, t])

  return error
}
