import React from 'react'
import { TransactionFeeInfo } from '@jup-ag/react-hook'
import { formatNumber } from 'src/misc/utils'
import Decimal from 'decimal.js'

const Deposits = ({
  hasSerumDeposit,
  hasAtaDeposit,
  feeInformation,
}: {
  hasSerumDeposit: boolean
  hasAtaDeposit: boolean
  feeInformation: TransactionFeeInfo | undefined
}) => {
  if (hasSerumDeposit || hasAtaDeposit) {
    return (
      <div className="flex items-start justify-between text-xs">
        <div className="flex w-[50%] pcs-info-label">
          <span>Deposit</span>
        </div>
        <div className="w-[50%] text-xs text-right pcs-info-content">
          {(() => {
            if (!feeInformation) {
              return 'Unable to determine fees'
            }

            const content = [
              hasAtaDeposit && (
                <p key="ata">
                  <span>
                    {formatNumber.format(
                      feeInformation?.ataDeposits
                        .reduce<Decimal>((s, deposit) => {
                          return s.add(deposit)
                        }, new Decimal(0))
                        .div(10 ** 9),
                    )}{' '}
                    SOL for {feeInformation?.ataDeposits?.length}{' '}
                    {(feeInformation?.ataDeposits?.length || 0) > 0 ? 'ATA account' : 'ATA accounts'}
                  </span>
                </p>
              ),
              hasSerumDeposit && (
                <p key="serum">
                  <span>
                    {formatNumber.format(
                      feeInformation?.openOrdersDeposits
                        .reduce((s, deposit) => {
                          return s.add(deposit)
                        }, new Decimal(9))
                        .div(10 ** 9),
                    )}{' '}
                    SOL for {feeInformation?.openOrdersDeposits.length}{' '}
                    {(feeInformation?.openOrdersDeposits?.length || 0) > 0
                      ? 'Serum OpenOrders account'
                      : 'Serum OpenOrders accounts'}
                  </span>
                </p>
              ),
            ].filter(Boolean)

            if (content.length) {
              return content
            }

            return '-'
          })()}
        </div>
      </div>
    )
  }

  return null
}

export default Deposits
