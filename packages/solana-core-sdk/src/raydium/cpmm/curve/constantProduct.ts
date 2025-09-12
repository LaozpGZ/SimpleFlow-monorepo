import BN from "bn.js";
import { RoundDirection, SwapWithoutFeesResult, TradingTokenResult } from "./calculator";
import { BN_ONE, BN_ZERO } from "@/common";

function checkedRem(dividend: BN, divisor: BN): BN {
  if (divisor.isZero()) throw Error("divisor is zero");

  const result = dividend.mod(divisor);
  return result;
}

function checkedCeilDiv(dividend: BN, rhs: BN): BN[] {
  if (rhs.isZero()) throw Error("rhs is zero");

  let quotient = dividend.div(rhs);

  if (quotient.isZero()) throw Error("quotient is zero");

  let remainder = checkedRem(dividend, rhs);

  if (remainder.gt(BN_ZERO)) {
    quotient = quotient.add(BN_ONE);

    rhs = dividend.div(quotient);
    remainder = checkedRem(dividend, quotient);
    if (remainder.gt(BN_ZERO)) {
      rhs = rhs.add(BN_ONE);
    }
  }
  return [quotient, rhs];
}

export class ConstantProductCurve {
  static swapWithoutFees(sourceAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN): SwapWithoutFeesResult {
    const invariant = swapSourceAmount.mul(swapDestinationAmount);

    const newSwapSourceAmount = swapSourceAmount.add(sourceAmount);
    const [newSwapDestinationAmount] = checkedCeilDiv(invariant, newSwapSourceAmount);

    const destinationAmountSwapped = swapDestinationAmount.sub(newSwapDestinationAmount);
    if (destinationAmountSwapped.isZero()) throw Error("destinationAmountSwapped is zero");

    return {
      destinationAmountSwapped,
    };
  }

  static lpTokensToTradingTokens(
    lpTokenAmount: BN,
    lpTokenSupply: BN,
    swapTokenAmount0: BN,
    swapTokenAmount1: BN,
    roundDirection: RoundDirection,
  ): TradingTokenResult {
    let tokenAmount0 = lpTokenAmount.mul(swapTokenAmount0).div(lpTokenSupply);
    let tokenAmount1 = lpTokenAmount.mul(swapTokenAmount1).div(lpTokenSupply);

    if (roundDirection === RoundDirection.Floor) {
      return { tokenAmount0, tokenAmount1 };
    } else if (roundDirection === RoundDirection.Ceiling) {
      const tokenRemainder0 = checkedRem(lpTokenAmount.mul(swapTokenAmount0), lpTokenSupply);

      if (tokenRemainder0.gt(BN_ZERO) && tokenAmount0.gt(BN_ZERO)) {
        tokenAmount0 = tokenAmount0.add(BN_ONE);
      }

      const token1Remainder = checkedRem(lpTokenAmount.mul(swapTokenAmount1), lpTokenSupply);

      if (token1Remainder.gt(BN_ZERO) && tokenAmount1.gt(BN_ZERO)) {
        tokenAmount1 = tokenAmount1.add(BN_ONE);
      }

      return { tokenAmount0, tokenAmount1 };
    }
    throw Error("roundDirection value error");
  }
}
