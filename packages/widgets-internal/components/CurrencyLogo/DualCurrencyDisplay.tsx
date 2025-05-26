import { Currency } from "@pancakeswap/sdk";
import { ArrowForwardIcon, AtomBoxProps, AutoColumn, Row, RowFixed, Text } from "@pancakeswap/uikit";
import { CurrencyLogo } from "./CurrencyLogo";

interface DualCurrencyDisplayProps extends AtomBoxProps {
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: string;
  outputAmount?: string;
  inputTextColor?: string;
  outputTextColor?: string;
  inputChainName?: string;
  outputChainName?: string;
  overrideIcon?: React.ReactNode;
  textRightOpacity?: number;
}
export const DualCurrencyDisplay = ({
  inputAmount,
  outputAmount,
  inputTextColor,
  outputTextColor,
  inputCurrency,
  outputCurrency,
  inputChainName,
  outputChainName,
  overrideIcon,
  textRightOpacity,
  ...props
}: DualCurrencyDisplayProps) => {
  return (
    <Row justifyContent="space-around" {...props}>
      <AutoColumn justify="center">
        <CurrencyLogo currency={inputCurrency} size="40px" showChainLogo />

        <Text color={inputTextColor} bold ellipsis>
          {inputAmount}&nbsp;
          {inputCurrency?.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" bold>
          {inputChainName}
        </Text>
      </AutoColumn>
      <RowFixed my="auto">{overrideIcon || <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />}</RowFixed>
      <AutoColumn justify="center">
        <CurrencyLogo currency={outputCurrency} size="40px" showChainLogo />

        <Text bold ellipsis color={outputTextColor} style={{ opacity: textRightOpacity }}>
          {outputAmount}&nbsp;{outputCurrency?.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" style={{ opacity: textRightOpacity }} bold>
          {outputChainName}
        </Text>
      </AutoColumn>
    </Row>
  );
};
