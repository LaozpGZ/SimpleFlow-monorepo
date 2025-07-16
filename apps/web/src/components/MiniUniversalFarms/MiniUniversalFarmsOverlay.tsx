import { useTranslation } from '@pancakeswap/localization'
import {
  BaseMenu,
  Box,
  Card,
  CardBody,
  IconButton,
  Modal,
  ModalV2,
  SearchIcon,
  useMatchBreakpoints,
  useModalV2,
} from '@pancakeswap/uikit'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { MiniUniversalFarms } from '.'

const SearchButton = styled(IconButton).attrs({ variant: 'primary60' })`
  background-color: ${({ theme }) => theme.colors.input};
`

const UnstyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`

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
            <Modal title={t('Search Pools')} onDismiss={modalV2Props.onDismiss}>
              <MiniUniversalFarms />
            </Modal>
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
                <MiniUniversalFarms />
              </CardBody>
            </Card>
          )}
        </BaseMenu>
      )}
    </Box>
  )
}
