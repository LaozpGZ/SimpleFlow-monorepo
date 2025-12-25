import { POOL_TYPE } from "@simpleflow/infinity-sdk";
import { useTranslation } from "@simpleflow/l10n";
import { AutoColumn, Flex, FlexGap, LinkExternal, Modal, Text } from "@simpleflow/uikit";
import Miscellaneous from "@simpleflow/uikit/components/Svg/Icons/Miscellaneous";

type PoolTypeModalProps = {
  poolType: POOL_TYPE | undefined;
  onDismiss?: () => void;
};

const ModalTitle: React.FC<{ poolType: POOL_TYPE | undefined }> = ({ poolType }) => {
  const { t } = useTranslation();

  return (
    <>
      <FlexGap gap="8px" alignItems="center">
        <Miscellaneous color="textSubtle" width="24px" height="24px" />
        <Text fontSize={24} bold>
          {poolType === POOL_TYPE.CLAMM ? t("CLAMM Pool") : null}
          {poolType === POOL_TYPE.Bin ? t("Liquidity Book AMM") : null}
        </Text>
      </FlexGap>
    </>
  );
};

export const PoolTypeModal: React.FC<PoolTypeModalProps> = ({ poolType, onDismiss }) => {
  const { t } = useTranslation();
  return (
    <Modal title={<ModalTitle poolType={poolType} />} onDismiss={onDismiss}>
      <Flex minHeight="120px" flexDirection="column" width={["100%", "100%", "100%", "480px"]}>
        <AutoColumn gap="24px">
          <AutoColumn gap="sm">
            <Text fontSize={12} color="secondary" bold textTransform="uppercase">
              {t("Description")}
            </Text>
            <Text ellipsis style={{ whiteSpace: "pre-wrap" }}>
              {poolType === POOL_TYPE.CLAMM
                ? t(
                    "Concentrated Liquidity Automated Market Maker (CLAMM) pools focus liquidity within specific price ranges, maximizing capital efficiency and enabling tighter spreads."
                  )
                : null}
              {poolType === POOL_TYPE.Bin
                ? t(
                    "Liquidity Book AMM (Bin Pool) uses discrete price bins to segment liquidity, providing granular control over capital allocation and reducing slippage."
                  )
                : null}
            </Text>
          </AutoColumn>

          <LinkExternal href="https://docs.simpleflow.finance/trade/pancakeswap-infinity/pool-types" marginTop="auto">
            <Text fontSize={16} color="primary" bold>
              {t("View details in Docs")}
            </Text>
          </LinkExternal>
        </AutoColumn>
      </Flex>
    </Modal>
  );
};
