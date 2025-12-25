import { useTranslation } from "@simpleflow/l10n";
import { Text } from "../Text";
import { Dots } from "../Loader/Dots";

export function LoadingDot() {
  const { t } = useTranslation();

  return (
    <Text color="textSubtle" textAlign="center">
      <Dots>{t("Loading")}</Dots>
    </Text>
  );
}
