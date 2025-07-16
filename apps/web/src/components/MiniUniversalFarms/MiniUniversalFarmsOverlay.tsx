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
  type?: any // TODO: Implement for Pool Detail, Add Liquidity, etc. (unified liquidity links)
}

export const MiniUniversalFarmsOverlay: React.FC<MiniUniversalFarmsOverlayProps> = ({ children }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const modalV2Props = useModalV2()

  const handleClick = useCallback(() => {
    if (isMobile) {
      modalV2Props.onOpen()
    }
  }, [isMobile, modalV2Props])

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
      {isMobile ? (
        <>
          <UnstyledButton onClick={handleClick}>{triggerButton}</UnstyledButton>
          <ModalV2 {...modalV2Props} closeOnOverlayClick>
            <MotionModal title={t('Search Pools')} onDismiss={modalV2Props.onDismiss}>
              <Suspense>
                <MiniUniversalFarms />
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
                  <MiniUniversalFarms />
                </Suspense>
              </CardBody>
            </Card>
          )}
        </BaseMenu>
      )}
    </Box>
  )
}
