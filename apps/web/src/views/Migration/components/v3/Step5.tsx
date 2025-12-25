import { useTranslation } from '@simpleflow/l10n'
import { Heading, AtomBox } from '@simpleflow/uikit'
import { useMemo } from 'react'
import { useCakePrice } from 'hooks/useCakePrice'
import { useFarmsV3WithPositionsAndBooster } from 'state/farmsV3/hooks'
import FarmTable from 'views/Farms/components/FarmTable/FarmTable'
import { useAccount } from 'wagmi'
import { V3FarmWithoutStakedValue } from 'state/farms/types'

export function Step5() {
  const { farmsWithPositions: farmsV3, userDataLoaded: v3UserDataLoaded } = useFarmsV3WithPositionsAndBooster()
  const { address: account } = useAccount()

  const farmsLP = useMemo(() => farmsV3.map((f) => ({ ...f, version: 3 } as V3FarmWithoutStakedValue)), [farmsV3])

  const userDataReady = !account || (!!account && v3UserDataLoaded)

  const cakePrice = useCakePrice()

  const { t } = useTranslation()

  return (
    <>
      <FarmTable
        header={
          <AtomBox borderTopRadius="32px" p="24px" bg="gradientCardHeader">
            <Heading>{t('Farms')}</Heading>
          </AtomBox>
        }
        farms={farmsLP}
        cakePrice={cakePrice}
        userDataReady={userDataReady}
      />
    </>
  )
}
