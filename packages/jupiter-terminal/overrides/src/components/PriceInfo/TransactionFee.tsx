import React, { useMemo } from 'react'
import { TransactionFeeInfo } from '@jup-ag/react-hook'
import { formatNumber } from 'src/misc/utils'
import Decimal from 'decimal.js'

const TransactionFee = ({ feeInformation }: { feeInformation: TransactionFeeInfo | undefined }) => {
  const feeText = useMemo(() => {
    if (feeInformation) {
      return formatNumber.format(new Decimal(feeInformation.signatureFee).div(10 ** 9))
    }
    return '-'
  }, [feeInformation])

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex w-[50%] pcs-info-label">
        <span>Transaction Fee</span>
      </div>
      <div className="pcs-info-content">{feeText} SOL</div>
    </div>
  )
}

export default TransactionFee
