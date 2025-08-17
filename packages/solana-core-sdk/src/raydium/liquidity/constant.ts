import { SerumVersion } from "../serum";
import { BN_10000, BN_25 } from "@/common";

export const LIQUIDITY_FEES_NUMERATOR = BN_25;
export const LIQUIDITY_FEES_DENOMINATOR = BN_10000;

// liquidity version => serum version
export const LIQUIDITY_VERSION_TO_SERUM_VERSION: {
  [key in 4 | 5]?: SerumVersion;
} = {
  4: 3,
  5: 3,
};
