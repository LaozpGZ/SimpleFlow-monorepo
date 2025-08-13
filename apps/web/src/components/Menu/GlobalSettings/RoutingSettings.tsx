import { useTranslation } from '@pancakeswap/localization'
import {
  AtomBox,
  AutoColumn,
  AutoRow,
  Button,
  ButtonProps,
  Checkbox,
  Flex,
  Message,
  MessageText,
  Modal,
  ModalV2,
  NotificationDot,
  PancakeToggle,
  PreTitle,
  QuestionHelper,
  RowFixed,
  Text,
  Toggle,
} from '@pancakeswap/uikit'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { usePCSX, usePCSXFeatureEnabled } from 'hooks/usePCSX'
import { ReactNode, useCallback, useState } from 'react'
import {
  useOnlyOneAMMSourceEnabled,
  useRoutingSettingChanged,
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'

export function RoutingSettingsButton({
  children,
  showRedDot = true,
  buttonProps,
}: {
  children?: ReactNode
  showRedDot?: boolean
  buttonProps?: ButtonProps
}) {
  const [show, setShow] = useState(false)
  const { t } = useTranslation()
  const [isRoutingSettingChange] = useRoutingSettingChanged()
  const handleDismiss = useCallback(() => setShow(false), [])
  return (
    <>
      <AtomBox textAlign="center">
        <NotificationDot show={isRoutingSettingChange && showRedDot}>
          <Button variant="text" onClick={() => setShow(true)} scale="sm" {...buttonProps}>
            {children || t('Customize Routing')}
          </Button>
        </NotificationDot>
      </AtomBox>
      <ModalV2 isOpen={show} onDismiss={handleDismiss} closeOnOverlayClick>
        <RoutingSettings />
      </ModalV2>
    </>
  )
}

function RoutingSettings() {
  const { t } = useTranslation()

  const [isStableSwapByDefault, setIsStableSwapByDefault] = useUserStableSwapEnable()
  const [v2Enable, setV2Enable] = useUserV2SwapEnable()
  const [v3Enable, setV3Enable] = useUserV3SwapEnable()
  const [xEnable, setXEnable] = usePCSX()
  const xFeatureEnabled = usePCSXFeatureEnabled()
  const [split, setSplit] = useUserSplitRouteEnable()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const onlyOneAMMSourceEnabled = useOnlyOneAMMSourceEnabled()
  const [isRoutingSettingChange, reset] = useRoutingSettingChanged()

  return (
    <Modal
      title={t('Customize Routing')}
      headerRightSlot={
        isRoutingSettingChange && (
          <Button variant="text" scale="sm" onClick={reset}>
            {t('Reset')}
          </Button>
        )
      }
    >
      <AutoColumn
        width={{
          xs: '100%',
          md: 'screenSm',
        }}
        gap="16px"
      >
        {xFeatureEnabled ? (
          <Flex justifyContent="space-between" alignItems="flex-start" mb="24px">
            <Flex flexDirection="column">
              <Text>PancakeSwap X</Text>
              <Text fontSize="12px" color="textSubtle" maxWidth={360} mt={10}>
                When applicable, aggregates liquidity to provide better price, more token options, and gas free swaps.
              </Text>
            </Flex>
            <PancakeToggle
              id="stable-swap-toggle"
              scale="md"
              checked={xEnable}
              onChange={() => {
                setXEnable((s) => !s)
              }}
            />
          </Flex>
        ) : null}
        <AtomBox>
          <PreTitle mb="24px">{t('Liquidity source')}</PreTitle>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>PancakeSwap V3</Text>
              <QuestionHelper
                text={
                  <Flex>
                    <Text mr="5px">
                      {t(
                        'V3 offers concentrated liquidity to provide deeper liquidity for traders with the same amount of capital, offering lower slippage and more flexible trading fee tiers.',
                      )}
                    </Text>
                  </Flex>
                }
                placement="top"
                ml="4px"
              />
            </Flex>
            <Toggle
              disabled={v3Enable && onlyOneAMMSourceEnabled}
              scale="md"
              checked={v3Enable}
              onChange={() => setV3Enable((s) => !s)}
            />
          </Flex>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>PancakeSwap V2</Text>
              <QuestionHelper
                text={
                  <Flex flexDirection="column">
                    <Text mr="5px">
                      {t('The previous V2 exchange is where a number of iconic, popular assets are traded.')}
                    </Text>
                    <Text mr="5px" mt="1em">
                      {t('Recommend leaving this on to ensure backward compatibility.')}
                    </Text>
                  </Flex>
                }
                placement="top"
                ml="4px"
              />
            </Flex>
            <Toggle
              disabled={v2Enable && onlyOneAMMSourceEnabled}
              scale="md"
              checked={v2Enable}
              onChange={() => setV2Enable((s) => !s)}
            />
          </Flex>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>PancakeSwap {t('StableSwap')}</Text>
              <QuestionHelper
                text={
                  <Flex flexDirection="column">
                    <Text mr="5px">
                      {t(
                        'StableSwap provides higher efficiency for stable or pegged assets and lower fees for trades.',
                      )}
                    </Text>
                  </Flex>
                }
                placement="top"
                ml="4px"
              />
            </Flex>
            <Toggle
              disabled={isStableSwapByDefault && onlyOneAMMSourceEnabled}
              id="stable-swap-toggle"
              scale="md"
              checked={isStableSwapByDefault}
              onChange={() => {
                setIsStableSwapByDefault((s) => !s)
              }}
            />
          </Flex>
          {onlyOneAMMSourceEnabled && (
            <Message variant="warning">
              <MessageText>
                {t('At least one AMM liquidity source has to be enabled to support normal trading.')}
              </MessageText>
            </Message>
          )}
        </AtomBox>
        <AtomBox>
          <PreTitle mb="24px">{t('Routing preference')}</PreTitle>
          <AutoRow alignItems="center" mb="24px">
            <RowFixed as="label" gap="16px">
              <Checkbox
                id="toggle-disable-multihop-button"
                checked={!singleHopOnly}
                scale="sm"
                onChange={() => {
                  setSingleHopOnly((s) => !s)
                }}
              />
              <Text>{t('Allow Multihops')}</Text>
            </RowFixed>
            <QuestionHelper
              text={
                <Flex flexDirection="column">
                  <Text mr="5px">
                    {t(
                      'Multihops enables token swaps through multiple hops between several pools to achieve the best deal.',
                    )}
                  </Text>
                  <Text mr="5px" mt="1em">
                    {t(
                      'Turning this off will only allow direct swap, which may cause higher slippage or even fund loss.',
                    )}
                  </Text>
                </Flex>
              }
              placement="top"
              ml="4px"
            />
          </AutoRow>
          <AutoRow alignItems="center" mb="24px">
            <RowFixed alignItems="center" as="label" gap="16px">
              <Checkbox
                id="toggle-disable-multihop-button"
                checked={split}
                scale="sm"
                onChange={() => {
                  setSplit((s) => !s)
                }}
              />
              <Text>{t('Allow Split Routing')}</Text>
            </RowFixed>
            <QuestionHelper
              text={
                <Flex flexDirection="column">
                  <Text mr="5px">
                    {t('Split routing enables token swaps to be broken into multiple routes to achieve the best deal.')}
                  </Text>
                  <Text mr="5px" mt="1em">
                    {t(
                      'Turning this off will only allow a single route, which may result in low efficiency or higher slippage.',
                    )}
                  </Text>
                </Flex>
              }
              placement="top"
              ml="4px"
            />
          </AutoRow>
        </AtomBox>
      </AutoColumn>
    </Modal>
  )
}
