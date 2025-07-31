import { AtomBox } from "../../../components";

export type CakePriceProps = {
  cakePriceUsd?: number;
  chainId: number;
  showSkeleton?: boolean;
};

export const CakePrice: React.FC<CakePriceProps> = ({ cakePriceUsd, chainId, showSkeleton = true }) => {
  return (
    <AtomBox mr="12px" display={{ xs: "none", xxl: "block" }}>
      <CakePrice chainId={chainId} showSkeleton={showSkeleton} cakePriceUsd={cakePriceUsd} />
    </AtomBox>
  );
};
