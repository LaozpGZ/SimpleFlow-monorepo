import { useTranslation } from "@simpleflow/l10n";
import { Text } from "@simpleflow/uikit";

export function NoLiquidity() {
  const { t } = useTranslation();

  return (
    <Text color="textSubtle" textAlign="center">
      {t("No liquidity found.")}
    </Text>
  );
}
