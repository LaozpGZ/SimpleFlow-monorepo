# PancakeGift SC Helper Doc

# Context

This document will explain how to use PancakeGift contract.

# Everything Need To Know

## 1. How To Query Gift Details

[gifts](https://www.notion.so/gifts-21eb1792f90281818a47c51027885a94?pvs=21)

```json
struct GiftInfo {
        address token;
        address creator;
        uint128 tokenAmount;
        uint128 nativeAmount;
        uint128 gasPayment;
        GiftStatus status;
        uint96 expiry;
    }

    enum GiftStatus {
    NotExist, // 0
    Pending,  // 1
    Claimed,  // 2
    Cancelled. // 3
}
mapping(bytes32 giftCodeHash => GiftInfo) public gifts;

function gifts(bytes32 giftCodeHash) external view returns(GiftInfo memeory);
```

[EXPIRY_TIME](https://www.notion.so/EXPIRY_TIME-21eb1792f9028145b860c65ee4365f59?pvs=21)
Default expiry is 7 days.

## 2. How To Calculate Code Hash

[calculateGiftCodeHash](https://www.notion.so/calculateGiftCodeHash-21eb1792f90281ef9689ecd941d97d01?pvs=21)

_Please be careful when using this function in blockchain explorer, it has a risk of leaking gift code._

_It is recommended to calculate the gift code hash in your local environment._

```json
bytes32 codeHash = keccak256(abi.encodePacked(code));
```

## 3. How To Create Gift

[createGift](https://www.notion.so/createGift-21eb1792f90281dda9e9eb70671bb41e?pvs=21)

Create a gift with a unique code hash

_The function requires the sender to pay a gas fee (GAS_PAYMENT) in native currency._

[GAS_PAYMENT](https://www.notion.so/GAS_PAYMENT-21eb1792f9028167bdaeff297b964712?pvs=21)

```solidity
function createGift(
bytes32 codeHash,
address token,
uint128 tokenAmount,
uint128 nativeAmount){}
```

**Parameters**

| Name           | Type      | Description                                                                        |
| -------------- | --------- | ---------------------------------------------------------------------------------- |
| `codeHash`     | `bytes32` | The unique code hash for the gift, created using keccak256(abi.encodePacked(code)) |
| `token`        | `address` | The address of the token to be gifted (0x0 if no ERC20 token)                      |
| `tokenAmount`  | `uint128` | The amount of the token to be gifted                                               |
| `nativeAmount` | `uint128` | The amount of native currency to be gifted (in wei)                                |

<aside>
💡

What if creator passed a wrong codeHash (or random bytes32) , creator can cancel gift by codeHash without real code string at any time, so it is fine.

[https://www.notion.so/pancakeswap/PancakeGiftV1-Contract-Doc-21eb1792f90281f6b12fdd5c18964785?source=copy_link#21eb1792f9028145b860c65ee4365f59](https://www.notion.so/PancakeGiftV1-Contract-Doc-21eb1792f90281f6b12fdd5c18964785?pvs=21)

</aside>

FE need to pass value when send transaction.

```solidity
import { account, walletClient } from './config'

const hash = await walletClient.sendTransaction({
  account,
  to: 'PCS_Gift_Contract',
  value: 1000000000000000000n // value = nativeAmount + *GAS_PAYMENT*
})
// '0x...'
```

SendTransaction Value Cases

1. Only native token in gift , 0.01 BNB in gift

   value = _GAS_PAYMENT +_ `nativeAmount`

   value = 0.01 + 0.000075 = 0.010075 BNB

2. Only ERC20 token in gift , 0 BNB in gift

   value = _GAS_PAYMENT +_ `nativeAmount`

   value = 0 + 0.000075 = 0.000075 BNB

3. Token + Native in gift , 0.02 BNB in gift

   value = _GAS_PAYMENT +_ `nativeAmount`

   value = 0.02 + 0.000075 = 0.020075 BNB

### Error List

1. InvalidGiftAmount

   tokenAmount == 0 && nativeAmount == 0

2. GiftAlreadyExists

   gift.status != GiftStatus.NotExist

3. InvalidNativeAmount

   msg.value != (nativeAmount + GAS_PAYMENT)

4. InvalidTokenAmount

   token == address(0) && tokenAmount > 0
   ||

   token != address(0) && tokenAmount == 0

5. InvalidTokenFeeOnTransfer

   If token is fee on transfer

6. ExceedTokenTransferGasLimit

   If ERC20 token transfer gas usage exceed TOKEN_TRANSFER_GAS_LIMIT

   [TOKEN_TRANSFER_GAS_LIMIT](https://www.notion.so/TOKEN_TRANSFER_GAS_LIMIT-21eb1792f9028130bb5dc15d39182adc?pvs=21)

## 4. How To Claim Gift

### 4.1 Claim Gift

[claimGift](https://www.notion.so/claimGift-21eb1792f90281b8bf4de66bbfce5bbb?pvs=21)

Admin function to claim a gift by code

_This function can only be called by the contract operator or current contract._

```solidity
function claimGift(string calldata code, address to) external;
```

**Parameters**

| Name   | Type      | Description                                |
| ------ | --------- | ------------------------------------------ |
| `code` | `string`  | The unique code for the gift               |
| `to`   | `address` | The address to which the gift will be sent |

FE should not need to use this, BE will use this.

### 4.2 Batch Claim Gift

Batch claim gifts by code

_This function can only be called by the contract operator._

_Each claim will be attempted, and if it fails, it will not revert the entire transaction._

```solidity
struct BatchClaimGiftParam {
    string code;
    address to;
}

function batchClaimGift(BatchClaimGiftParam[] calldata params) external  returns (bool[] memory);
```

**Parameters**

| Name     | Type                    | Description                                                                       |
| -------- | ----------------------- | --------------------------------------------------------------------------------- |
| `params` | `BatchClaimGiftParam[]` | An array of BatchClaimGiftParam containing the gift codes and recipient addresses |

**Returns**

| Name     | Type     | Description                                                                      |
| -------- | -------- | -------------------------------------------------------------------------------- |
| `<none>` | `bool[]` | results An array of booleans indicating whether each claim was successful or not |

FE should not need to use this, BE will use this.

### Error List

1. ZeroAddress

   to is address(0)

2. GiftNotExist

   gift.status == GiftStatus.NotExist

3. GiftAlreadyClaimed

   gift.status != GiftStatus.Pending

   If gift was cancelled , will still show this error, FE can check gift.status to know the status

4. AlreadyExpired

   if block.timestamp > gift.expiry , can not claim

5. InvalidTokenFeeOnTransfer

   If token is fee on transfer

6. ExceedTokenTransferGasLimit

   If ERC20 token transfer gas usage exceed TOKEN_TRANSFER_GAS_LIMIT

   [TOKEN_TRANSFER_GAS_LIMIT](https://www.notion.so/TOKEN_TRANSFER_GAS_LIMIT-21eb1792f9028130bb5dc15d39182adc?pvs=21)

7. NativeTransferFailed

   If native token transfer gas usage exceed NATIVE_TRANSFER_GAS_LIMIT

   [NATIVE_TRANSFER_GAS_LIMIT](https://www.notion.so/NATIVE_TRANSFER_GAS_LIMIT-21eb1792f90281efb73bfbd5e437afd2?pvs=21)

## 5. Cancel Gift

**FE need to check if caller is creator , Only creator can call this In FE.
Creator can cancel any time , no cancel time limit in SC.**

Cancel a gift and return the funds to the creator

_This function can only be called by the creator of the gift or an operator._

```solidity
function cancelGift(bytes32 codeHash) external nonReentrant;
```

**Parameters**

| Name       | Type      | Description                                                                        |
| ---------- | --------- | ---------------------------------------------------------------------------------- |
| `codeHash` | `bytes32` | The unique code hash for the gift, created using keccak256(abi.encodePacked(code)) |

<aside>
💡

If creator cancel gift , SC will return _GAS_PAYMENT back to creator._

If expired , operator cancel gift, SC will not refund _GAS_PAYMENT._

</aside>

### Error List

1. NotGiftCreatorOrOperator

   Not creator or operator

2. GiftNotExist

   gift.status == GiftStatus.NotExist

3. GiftAlreadyClaimed

   gift.status != GiftStatus.Pending

   If gift was cancelled , will still show this error, FE can check gift.status to know the status.

4. NotExpired

   This only apply for BE , if not expired , BE will get this error.
   In FE , only creator will call this , will not check this if caller is creator.

5. InvalidTokenFeeOnTransfer

   If token is fee on transfer

6. ExceedTokenTransferGasLimit

   If ERC20 token transfer gas usage exceed TOKEN_TRANSFER_GAS_LIMIT

   [TOKEN_TRANSFER_GAS_LIMIT](https://www.notion.so/TOKEN_TRANSFER_GAS_LIMIT-21eb1792f9028130bb5dc15d39182adc?pvs=21)

   This only apply for BE , if exceed , BE will get this error.
   In FE , only creator will call this , will not check this if caller is creator.

7. NativeTransferFailed

   [NATIVE_TRANSFER_GAS_LIMIT](https://www.notion.so/NATIVE_TRANSFER_GAS_LIMIT-21eb1792f90281efb73bfbd5e437afd2?pvs=21)

   This only apply for BE , if exceed , BE will get this error.
   In FE , only creator will call this , will not check this if caller is creator.
