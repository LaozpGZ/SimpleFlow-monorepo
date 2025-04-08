import { Currency } from "@pancakeswap/sdk";
import { ArrowUpIcon, Box, ColumnCenter } from "@pancakeswap/uikit";
import { ReactNode } from "react";
import { ConfirmModalState } from "./ApproveModalContent";
import { FadePresence, PendingSwapConfirmationIcon } from "./Logos";

interface SwapPendingModalContentV3Props {
  title: string;
  showIcon?: boolean;
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  amountA: string;
  amountB: string;
  currentStep: ConfirmModalState;
  children?: ReactNode;
}

export const SwapPendingModalContentV3: React.FC<SwapPendingModalContentV3Props> = ({
  title,
  showIcon,
  currencyA,
  currencyB,
  amountA,
  amountB,
  currentStep,
  children,
}) => {
  const symbolA = currencyA?.symbol;
  const symbolB = currencyB?.symbol;

  return (
    <Box width="100%">
      {showIcon ? (
        <FadePresence $scale>
          <Box margin="auto auto 22px auto" width="fit-content">
            <ArrowUpIcon color="success" width={80} height={80} />
          </Box>
        </FadePresence>
      ) : (
        <Box mb="16px">
          <ColumnCenter>
            <PendingSwapConfirmationIcon />
          </ColumnCenter>
        </Box>
      )}
    </Box>
  );
};
