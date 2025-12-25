import { useTranslation } from "@simpleflow/l10n";
import { Text } from "@simpleflow/uikit";

export function LiquidityNotConnect() {
  const { t } = useTranslation();

  return (
    <Text color="textSubtle" textAlign="center">
      {t("Connect to a wallet to view your liquidity.")}
    </Text>
  );
}
