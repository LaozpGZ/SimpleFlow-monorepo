import { CheckmarkCircleFillIcon, CircleLoader, ErrorIcon, FlexGap, Text } from "@pancakeswap/uikit";
import { PropsWithChildren, ReactNode } from "react";
import { styled } from "styled-components";

import { LightGreyCard } from "../Card";

export type TransactionListItemV2Props = PropsWithChildren<{
  status?: TransactionStatusV2;
  title?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}>;

export enum TransactionStatusV2 {
  Pending,
  Success,
  Failed,
  Expired,
}

export const TransactionListItemV2Title = styled(Text).attrs({
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
})`
  color: ${({ theme }) => theme.colors.textSubtle};
`;

export const TransactionListItemV2Desc = styled(Text).attrs({
  fontSize: "1rem",
  color: "text",
})``;

export function TransactionListItemV2({ status, onClick, children, action, title }: TransactionListItemV2Props) {
  return (
    <LightGreyCard padding="1rem">
      <FlexGap flexDirection="row" justifyContent="space-between" alignItems="center" gap="0.5rem">
        <FlexGap flexDirection="column" gap="0.5rem" alignItems="flex-start">
          {title}
          <FlexGap
            flexDirection="row"
            gap="0.5rem"
            alignItems="center"
            justifyContent="flex-start"
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "unset" }}
          >
            <StatusIndicator status={status} />
            {children}
          </FlexGap>
        </FlexGap>
        {action}
      </FlexGap>
    </LightGreyCard>
  );
}

function StatusIndicator({ status }: Pick<TransactionListItemV2Props, "status">) {
  if (status === TransactionStatusV2.Success) {
    return <CheckmarkCircleFillIcon color="positive60" />;
  }
  if (status === TransactionStatusV2.Pending) {
    return <CircleLoader size="20px" />;
  }
  if (status === TransactionStatusV2.Failed) {
    return <ErrorIcon color="failure" />;
  }
  return null;
}
