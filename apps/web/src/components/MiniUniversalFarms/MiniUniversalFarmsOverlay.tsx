import { useTranslation } from '@pancakeswap/localization'
import {
  BaseMenu,
  Box,
  Card,
  CardBody,
  IconButton,
  ModalV2,
  MotionModal,
  SearchIcon,
  useMatchBreakpoints,
  useModalV2,
} from '@pancakeswap/uikit'
import { Suspense, useCallback, useMemo } from 'react'
import styled from 'styled-components'

import dynamic from 'next/dynamic'
import { PoolInfo } from 'state/farmsV4/state/type'

const SearchButton = styled(IconButton).attrs({ variant: 'primary60' })`
  background-color: ${({ theme }) => theme.colors.input};
`

const UnstyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`

const MiniUniversalFarms = dynamic(() => import('./index').then((mod) => mod.MiniUniversalFarms), {
  ssr: false,
})

interface MiniUniversalFarmsOverlayProps {
  children?: React.ReactNode
  onPoolClick?: (pool: PoolInfo) => void
}

export const MiniUniversalFarmsOverlay: React.FC<MiniUniversalFarmsOverlayProps> = ({ children, onPoolClick }) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  const modalV2Props = useModalV2()

  const handleClick = useCallback(() => {
    if (isSmallScreen) {
      modalV2Props.onOpen()
    }
  }, [isSmallScreen, modalV2Props])

  const triggerButton = useMemo(() => {
    return (
      children || (
        <SearchButton>
          <SearchIcon color="textSubtle" width={24} />
        </SearchButton>
      )
    )
  }, [children])

  return (
    <Box>
      {isSmallScreen ? (
        <>
          <UnstyledButton onClick={handleClick}>{triggerButton}</UnstyledButton>
          <ModalV2 {...modalV2Props} closeOnOverlayClick>
            <MotionModal title={t('Search Pools')} onDismiss={modalV2Props.onDismiss}>
              <Suspense>
                <MiniUniversalFarms onPoolClick={onPoolClick} />
              </Suspense>
            </MotionModal>
          </ModalV2>
        </>
      ) : (
        <BaseMenu
          component={triggerButton}
          options={{
            placement: 'bottom-start',
            offset: [0, 8],
            padding: { left: 16, right: 16 },
          }}
        >
          {() => (
            <Card style={{ minWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
              <CardBody>
                <Suspense>
                  <MiniUniversalFarms onPoolClick={onPoolClick} />
                </Suspense>
              </CardBody>
            </Card>
          )}
        </BaseMenu>
      )}
    </Box>
  )
}
