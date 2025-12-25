import { HookData } from "@simpleflow/infinity-sdk";
import { useTranslation } from "@simpleflow/l10n";
import { AutoColumn, Flex, FlexGap, LinkExternal, Modal, Text } from "@simpleflow/uikit";
import Miscellaneous from "@simpleflow/uikit/components/Svg/Icons/Miscellaneous";
import { useMemo } from "react";

const ModalTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <>
      <FlexGap gap="8px" alignItems="center">
        <Miscellaneous color="textSubtle" width="24px" height="24px" />
        <Text fontSize={24} bold>
          {children}
        </Text>
      </FlexGap>
    </>
  );
};

export const HookModal: React.FC<{
  hookData?: HookData;
  onDismiss?: () => void;
}> = ({ hookData, onDismiss }) => {
  const { t } = useTranslation();

  if (!hookData) return null;

  return (
    <Modal title={<ModalTitle>{hookData?.name}</ModalTitle>} onDismiss={onDismiss}>
      <Flex minHeight="120px" flexDirection="column" width={["100%", "100%", "100%", "480px"]}>
        <AutoColumn gap="24px">
          <AutoColumn gap="sm">
            <Text fontSize={12} color="secondary" bold textTransform="uppercase">
              {t("Description")}
            </Text>
            <LinkifyText text={hookData.description} />
          </AutoColumn>

          <LinkExternal href={hookData.github} marginTop="auto">
            <Text fontSize={16} color="primary" bold>
              {t("View details in Docs")}
            </Text>
          </LinkExternal>
        </AutoColumn>
      </Flex>
    </Modal>
  );
};

const urlRegex = /(https?:\/\/[^\s()]+|www\.[^\s()]+)/gi;
export const LinkifyText: React.FC<{
  text?: string;
}> = ({ text }) => {
  const parts = useMemo(() => text?.split(urlRegex), [text]);
  return (
    <Text ellipsis style={{ whiteSpace: "pre-wrap" }}>
      {parts?.map((part, index) => {
        if (part.startsWith("http")) {
          return (
            <LinkExternal key={index} href={part} style={{ display: "inline-flex" }}>
              {part}
            </LinkExternal>
          );
        }
        return part;
      })}
    </Text>
  );
};
