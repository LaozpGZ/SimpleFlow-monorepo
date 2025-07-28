import {
  Commitment,
  Connection,
  Keypair,
  NonceAccount,
  PublicKey,
  sendAndConfirmTransaction,
  SignatureResult,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";

import { Api } from "../../api";
import { ComputeBudgetConfig, SignAllTransactions, TxTipConfig } from "../../raydium/type";
import { Cluster } from "../../solana";
import { Owner } from "../owner";
import { CacheLTA, getMultipleLookupTableInfo, LOOKUP_TABLE_CACHE } from "./lookupTable";
import { InstructionType, TxVersion } from "./txType";
import {
  addComputeBudget,
  checkLegacyTxSize,
  checkV0TxSize,
  confirmTransaction,
  getRecentBlockHash,
  printSimulate,
} from "./txUtils";

interface SolanaFeeInfo {
  min: number;
  max: number;
  avg: number;
  priorityTx: number;
  nonVotes: number;
  priorityRatio: number;
  avgCuPerBlock: number;
  blockspaceUsageRatio: number;
}
type SolanaFeeInfoJson = {
  "1": SolanaFeeInfo;
  "5": SolanaFeeInfo;
  "15": SolanaFeeInfo;
};

interface ExecuteParams {
  skipPreflight?: boolean;
  recentBlockHash?: string;
  sendAndConfirm?: boolean;
  notSendToRpc?: boolean;
  /**
   * Use durable nonce for transaction signing instead of recent blockhash.
   * When enabled, the transaction will be valid indefinitely until submitted.
   * Requires a nonce account to be created beforehand.
   */
  useDurableNonce?: boolean;
  /**
   * Custom nonce account address to use for durable nonce.
   * If not provided, a nonce account will be automatically created and cached.
   */
  customNonceAccount?: string;
}

interface TxBuilderInit {
  connection: Connection;
  feePayer: PublicKey;
  cluster: Cluster;
  owner?: Owner;
  blockhashCommitment?: Commitment;
  loopMultiTxStatus?: boolean;
  api?: Api;
  signAllTransactions?: SignAllTransactions;
}

export interface AddInstructionParam {
  addresses?: Record<string, PublicKey>;
  instructions?: TransactionInstruction[];
  endInstructions?: TransactionInstruction[];
  lookupTableAddress?: string[];
  signers?: Signer[];
  instructionTypes?: string[];
  endInstructionTypes?: string[];
}

export interface TxBuildData<T = Record<string, any>> {
  builder: TxBuilder;
  transaction: Transaction;
  instructionTypes: string[];
  signers: Signer[];
  execute: (params?: ExecuteParams) => Promise<{ txId: string; signedTx: Transaction }>;
  extInfo: T;
}

export interface TxV0BuildData<T = Record<string, any>> extends Omit<TxBuildData<T>, "transaction" | "execute"> {
  builder: TxBuilder;
  transaction: VersionedTransaction;
  buildProps?: {
    lookupTableCache?: CacheLTA;
    lookupTableAddress?: string[];
  };
  execute: (params?: ExecuteParams) => Promise<{ txId: string; signedTx: VersionedTransaction }>;
}

type TxUpdateParams = {
  txId: string;
  status: "success" | "error" | "sent";
  signedTx: Transaction | VersionedTransaction;
};
export interface MultiTxExecuteParam extends ExecuteParams {
  sequentially: boolean;
  skipTxCount?: number;
  onTxUpdate?: (completeTxs: TxUpdateParams[]) => void;
}
export interface MultiTxBuildData<T = Record<string, any>> {
  builder: TxBuilder;
  transactions: Transaction[];
  instructionTypes: string[];
  signers: Signer[][];
  execute: (executeParams?: MultiTxExecuteParam) => Promise<{ txIds: string[]; signedTxs: Transaction[] }>;
  extInfo: T;
}

export interface MultiTxV0BuildData<T = Record<string, any>>
  extends Omit<MultiTxBuildData<T>, "transactions" | "execute"> {
  builder: TxBuilder;
  transactions: VersionedTransaction[];
  buildProps?: {
    lookupTableCache?: CacheLTA;
    lookupTableAddress?: string[];
  };
  execute: (executeParams?: MultiTxExecuteParam) => Promise<{ txIds: string[]; signedTxs: VersionedTransaction[] }>;
}

export type MakeMultiTxData<T = TxVersion.LEGACY, O = Record<string, any>> = T extends TxVersion.LEGACY
  ? MultiTxBuildData<O>
  : MultiTxV0BuildData<O>;

export type MakeTxData<T = TxVersion.LEGACY, O = Record<string, any>> = T extends TxVersion.LEGACY
  ? TxBuildData<O>
  : TxV0BuildData<O>;

const LOOP_INTERVAL = 2000;

class NonceAccountCache {
  private cache: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      this.cache = new Map(JSON.parse(localStorage.getItem("_r_nonce_account") || "[]"));
    }
  }

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: string) {
    this.cache.set(key, value);
    if (typeof window !== "undefined") {
      localStorage.setItem("_r_nonce_account", JSON.stringify(Array.from(this.cache.entries())));
    }
  }
}

export class TxBuilder {
  private connection: Connection;
  private owner?: Owner;
  private instructions: TransactionInstruction[] = [];
  private endInstructions: TransactionInstruction[] = [];
  private lookupTableAddress: string[] = [];
  private signers: Signer[] = [];
  private instructionTypes: string[] = [];
  private endInstructionTypes: string[] = [];
  private feePayer: PublicKey;
  private cluster: Cluster;
  private signAllTransactions?: SignAllTransactions;
  private blockhashCommitment?: Commitment;
  private loopMultiTxStatus: boolean;
  private nonceAccountCache: NonceAccountCache;

  constructor(params: TxBuilderInit) {
    this.connection = params.connection;
    this.feePayer = params.feePayer;
    this.signAllTransactions = params.signAllTransactions;
    this.owner = params.owner;
    this.cluster = params.cluster;
    this.blockhashCommitment = params.blockhashCommitment;
    this.loopMultiTxStatus = !!params.loopMultiTxStatus;

    this.nonceAccountCache = new NonceAccountCache();
  }

  private async getOrCreateNonceAccountAddress(): Promise<PublicKey | null> {
    if (!this.owner?.publicKey) return null;

    const cacheKey = `${this.cluster}_${this.owner?.publicKey.toBase58()}`;
    if (this.nonceAccountCache.get(cacheKey)) {
      return new PublicKey(this.nonceAccountCache.get(cacheKey)!);
    }

    const nonceAccount = Keypair.generate();
    const nonceAccountAddress = nonceAccount.publicKey;

    const tx = new Transaction();
    tx.feePayer = this.owner.publicKey;
    tx.recentBlockhash = await getRecentBlockHash(this.connection);

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: this.owner.publicKey,
        newAccountPubkey: nonceAccountAddress,
        lamports: await this.connection.getMinimumBalanceForRentExemption(80),
        space: 80,
        programId: SystemProgram.programId,
      }),
      SystemProgram.nonceInitialize({
        noncePubkey: nonceAccountAddress,
        authorizedPubkey: this.owner.publicKey,
      }),
    );

    if (this.owner.signer) {
      tx.sign(...this.signers, nonceAccount);
      const txId = await this.connection.sendRawTransaction(tx.serialize());
      await confirmTransaction(this.connection, txId);
      this.nonceAccountCache.set(cacheKey, nonceAccountAddress.toBase58());
      return nonceAccountAddress;
    }

    if (this.signAllTransactions) {
      tx.partialSign(nonceAccount);
      const signedTxs = await this.signAllTransactions([tx]);
      // signedTxs[0].sign(nonceAccount);
      const txId = await this.connection.sendRawTransaction(signedTxs[0].serialize());
      await confirmTransaction(this.connection, txId);
      this.nonceAccountCache.set(cacheKey, nonceAccountAddress.toBase58());
      return nonceAccountAddress;
    }

    return null;
  }

  get AllTxData(): {
    instructions: TransactionInstruction[];
    endInstructions: TransactionInstruction[];
    signers: Signer[];
    instructionTypes: string[];
    endInstructionTypes: string[];
    lookupTableAddress: string[];
  } {
    return {
      instructions: this.instructions,
      endInstructions: this.endInstructions,
      signers: this.signers,
      instructionTypes: this.instructionTypes,
      endInstructionTypes: this.endInstructionTypes,
      lookupTableAddress: this.lookupTableAddress,
    };
  }

  get allInstructions(): TransactionInstruction[] {
    return [...this.instructions, ...this.endInstructions];
  }

  public async getComputeBudgetConfig(): Promise<ComputeBudgetConfig | undefined> {
    const json = (
      await axios.get<SolanaFeeInfoJson>(`https://solanacompass.com/api/fees?cacheFreshTime=${5 * 60 * 1000}`)
    ).data;
    const { avg } = json?.[15] ?? {};
    if (!avg) return undefined;
    return {
      units: 600000,
      microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000),
    };
  }

  public addCustomComputeBudget(config?: ComputeBudgetConfig): boolean {
    if (config) {
      const { instructions, instructionTypes } = addComputeBudget(config);
      this.instructions.unshift(...instructions);
      this.instructionTypes.unshift(...instructionTypes);
      return true;
    }
    return false;
  }

  public addTipInstruction(tipConfig?: TxTipConfig): boolean {
    if (tipConfig) {
      this.endInstructions.push(
        SystemProgram.transfer({
          fromPubkey: tipConfig.feePayer ?? this.feePayer,
          toPubkey: new PublicKey(tipConfig.address),
          lamports: BigInt(tipConfig.amount.toString()),
        }),
      );
      this.endInstructionTypes.push(InstructionType.TransferTip);
      return true;
    }
    return false;
  }

  // Helper method to handle durable nonce setup
  private async setupDurableNonce(customNonceAccount?: string) {
    if (!this.owner?.publicKey) {
      throw new Error("Owner public key is required for durable nonce setup");
    }

    let nonceAccountAddress: PublicKey;

    if (customNonceAccount) {
      // Use custom nonce account address
      try {
        nonceAccountAddress = new PublicKey(customNonceAccount);
      } catch (error) {
        throw new Error(`Invalid custom nonce account address: ${customNonceAccount}`);
      }
    } else {
      // Auto-create or use cached nonce account
      const autoNonceAccount = await this.getOrCreateNonceAccountAddress();
      if (!autoNonceAccount) {
        throw new Error("Nonce account not found");
      }
      nonceAccountAddress = autoNonceAccount;
    }

    const info = await this.connection.getAccountInfo(nonceAccountAddress, {
      commitment: "processed",
    });
    if (!info) {
      throw new Error("Nonce account not found");
    }
    const nonceAccountInfo = NonceAccount.fromAccountData(info.data);

    const advanceInstruction = SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountAddress,
      authorizedPubkey: this.owner.publicKey,
    });

    return {
      nonceAccount: nonceAccountAddress,
      nonce: nonceAccountInfo.nonce,
      advanceInstruction,
    };
  }

  public async calComputeBudget({
    config: propConfig,
    defaultIns,
  }: {
    config?: ComputeBudgetConfig;
    defaultIns?: TransactionInstruction[];
  }): Promise<void> {
    try {
      const config = propConfig || (await this.getComputeBudgetConfig());
      if (this.addCustomComputeBudget(config)) return;
      defaultIns && this.instructions.unshift(...defaultIns);
    } catch {
      defaultIns && this.instructions.unshift(...defaultIns);
    }
  }

  public addInstruction({
    instructions = [],
    endInstructions = [],
    signers = [],
    instructionTypes = [],
    endInstructionTypes = [],
    lookupTableAddress = [],
  }: AddInstructionParam): TxBuilder {
    this.instructions.push(...instructions);
    this.endInstructions.push(...endInstructions);
    this.signers.push(...signers);
    this.instructionTypes.push(...instructionTypes);
    this.endInstructionTypes.push(...endInstructionTypes);
    this.lookupTableAddress.push(...lookupTableAddress.filter((address) => address !== PublicKey.default.toString()));
    return this;
  }

  public async versionBuild<O = Record<string, any>>({
    txVersion,
    extInfo,
  }: {
    txVersion?: TxVersion;
    extInfo?: O;
  }): Promise<MakeTxData<TxVersion.LEGACY, O> | MakeTxData<TxVersion.V0, O>> {
    if (txVersion === TxVersion.V0) return (await this.buildV0({ ...(extInfo || {}) })) as MakeTxData<TxVersion.V0, O>;
    return this.build<O>(extInfo) as MakeTxData<TxVersion.LEGACY, O>;
  }

  public build<O = Record<string, any>>(extInfo?: O): MakeTxData<TxVersion.LEGACY, O> {
    const transaction = new Transaction();
    if (this.allInstructions.length) transaction.add(...this.allInstructions);
    transaction.feePayer = this.feePayer;
    if (this.owner?.signer && !this.signers.some((s) => s.publicKey.equals(this.owner!.publicKey)))
      this.signers.push(this.owner.signer);

    return {
      builder: this,
      transaction,
      signers: this.signers,
      instructionTypes: [...this.instructionTypes, ...this.endInstructionTypes],
      execute: async (params) => {
        const {
          recentBlockHash: propBlockHash,
          skipPreflight = true,
          sendAndConfirm,
          notSendToRpc,
          useDurableNonce,
          customNonceAccount,
        } = params || {};

        if (useDurableNonce) {
          console.log("Using durable nonce for transaction signing");
          // Use durable nonce
          const { nonce, advanceInstruction } = await this.setupDurableNonce(customNonceAccount);

          // Add advance nonce instruction as the first instruction
          transaction.instructions.unshift(advanceInstruction);
          this.instructionTypes.unshift(InstructionType.AdvanceNonce);

          // Use nonce as recent blockhash
          transaction.recentBlockhash = nonce;
        } else {
          // Use regular recent blockhash
          const recentBlockHash =
            propBlockHash ?? (await getRecentBlockHash(this.connection, this.blockhashCommitment));
          transaction.recentBlockhash = recentBlockHash;
        }

        if (this.signers.length) transaction.sign(...this.signers);

        printSimulate([transaction]);
        if (this.owner?.isKeyPair) {
          const txId = sendAndConfirm
            ? await sendAndConfirmTransaction(
                this.connection,
                transaction,
                this.signers.find((s) => s.publicKey.equals(this.owner!.publicKey))
                  ? this.signers
                  : [...this.signers, this.owner.signer!],
                { skipPreflight },
              )
            : await this.connection.sendRawTransaction(transaction.serialize(), { skipPreflight });

          return {
            txId,
            signedTx: transaction,
          };
        }
        if (this.signAllTransactions) {
          const txs = await this.signAllTransactions([transaction]);
          if (this.signers.length) {
            for (const item of txs) {
              try {
                item.sign(...this.signers);
              } catch (e) {
                //
              }
            }
          }
          return {
            txId: notSendToRpc ? "" : await this.connection.sendRawTransaction(txs[0].serialize(), { skipPreflight }),
            signedTx: txs[0],
          };
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: extInfo || ({} as O),
    };
  }

  public buildMultiTx<T = Record<string, any>>(params: {
    extraPreBuildData?: MakeTxData<TxVersion.LEGACY>[];
    extInfo?: T;
  }): MultiTxBuildData {
    const { extraPreBuildData = [], extInfo } = params;
    const { transaction } = this.build(extInfo);

    const filterExtraBuildData = extraPreBuildData.filter((data) => data.transaction.instructions.length > 0);

    const allTransactions: Transaction[] = [transaction, ...filterExtraBuildData.map((data) => data.transaction)];
    const allSigners: Signer[][] = [this.signers, ...filterExtraBuildData.map((data) => data.signers)];
    const allInstructionTypes: string[] = [
      ...this.instructionTypes,
      ...filterExtraBuildData.map((data) => data.instructionTypes).flat(),
    ];

    if (this.owner?.signer) {
      allSigners.forEach((signers) => {
        if (!signers.some((s) => s.publicKey.equals(this.owner!.publicKey))) this.signers.push(this.owner!.signer!);
      });
    }

    return {
      builder: this,
      transactions: allTransactions,
      signers: allSigners,
      instructionTypes: allInstructionTypes,
      execute: async (executeParams?: MultiTxExecuteParam) => {
        const {
          sequentially,
          onTxUpdate,
          skipTxCount = 0,
          recentBlockHash: propBlockHash,
          skipPreflight = true,
        } = executeParams || {};
        const recentBlockHash = propBlockHash ?? (await getRecentBlockHash(this.connection, this.blockhashCommitment));
        if (this.owner?.isKeyPair) {
          if (sequentially) {
            const txIds: string[] = [];
            let i = 0;
            for (const tx of allTransactions) {
              ++i;
              if (i <= skipTxCount) continue;
              const txId = await sendAndConfirmTransaction(
                this.connection,
                tx,
                this.signers.find((s) => s.publicKey.equals(this.owner!.publicKey))
                  ? this.signers
                  : [...this.signers, this.owner.signer!],
                { skipPreflight },
              );
              txIds.push(txId);
            }

            return {
              txIds,
              signedTxs: allTransactions,
            };
          }
          return {
            txIds: await await Promise.all(
              allTransactions.map(async (tx) => {
                tx.recentBlockhash = recentBlockHash;
                return await this.connection.sendRawTransaction(tx.serialize(), { skipPreflight });
              }),
            ),
            signedTxs: allTransactions,
          };
        }

        if (this.signAllTransactions) {
          const partialSignedTxs = allTransactions.map((tx, idx) => {
            tx.recentBlockhash = recentBlockHash;
            if (allSigners[idx].length) tx.sign(...allSigners[idx]);
            return tx;
          });
          printSimulate(partialSignedTxs);
          const signedTxs = await this.signAllTransactions(partialSignedTxs);
          if (sequentially) {
            let i = 0;
            const processedTxs: TxUpdateParams[] = [];
            const checkSendTx = async (): Promise<void> => {
              if (!signedTxs[i]) return;
              const txId = await this.connection.sendRawTransaction(signedTxs[i].serialize(), { skipPreflight });
              processedTxs.push({ txId, status: "sent", signedTx: signedTxs[i] });
              onTxUpdate?.([...processedTxs]);
              i++;
              let confirmed = false;
              // eslint-disable-next-line
              let intervalId: NodeJS.Timer | null = null,
                subSignatureId: number | null = null;
              const cbk = (signatureResult: SignatureResult): void => {
                intervalId !== null && clearInterval(intervalId);
                subSignatureId !== null && this.connection.removeSignatureListener(subSignatureId);
                const targetTxIdx = processedTxs.findIndex((tx) => tx.txId === txId);
                if (targetTxIdx > -1) {
                  if (processedTxs[targetTxIdx].status === "error" || processedTxs[targetTxIdx].status === "success")
                    return;
                  processedTxs[targetTxIdx].status = signatureResult.err ? "error" : "success";
                }
                onTxUpdate?.([...processedTxs]);
                if (!signatureResult.err) checkSendTx();
              };

              if (this.loopMultiTxStatus)
                intervalId = setInterval(async () => {
                  if (confirmed) {
                    clearInterval(intervalId!);
                    return;
                  }
                  try {
                    const r = await this.connection.getTransaction(txId, {
                      commitment: "confirmed",
                      maxSupportedTransactionVersion: TxVersion.V0,
                    });
                    if (r) {
                      confirmed = true;
                      clearInterval(intervalId!);
                      cbk({ err: r.meta?.err || null });
                      console.log("tx status from getTransaction:", txId);
                    }
                  } catch (e) {
                    confirmed = true;
                    clearInterval(intervalId!);
                    console.error("getTransaction timeout:", e, txId);
                  }
                }, LOOP_INTERVAL);

              subSignatureId = this.connection.onSignature(
                txId,
                (result) => {
                  if (confirmed) {
                    this.connection.removeSignatureListener(subSignatureId!);
                    return;
                  }
                  confirmed = true;
                  cbk(result);
                },
                "confirmed",
              );
              this.connection.getSignatureStatus(txId);
            };
            await checkSendTx();
            return {
              txIds: processedTxs.map((d) => d.txId),
              signedTxs,
            };
          } else {
            const txIds: string[] = [];
            for (let i = 0; i < signedTxs.length; i += 1) {
              const txId = await this.connection.sendRawTransaction(signedTxs[i].serialize(), { skipPreflight });
              txIds.push(txId);
            }
            return {
              txIds,
              signedTxs,
            };
          }
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: extInfo || {},
    };
  }

  public async versionMultiBuild<T extends TxVersion, O = Record<string, any>>({
    extraPreBuildData,
    txVersion,
    extInfo,
  }: {
    extraPreBuildData?: MakeTxData<TxVersion.V0>[] | MakeTxData<TxVersion.LEGACY>[];
    txVersion?: T;
    extInfo?: O;
  }): Promise<MakeMultiTxData<T, O>> {
    if (txVersion === TxVersion.V0)
      return (await this.buildV0MultiTx({
        extraPreBuildData: extraPreBuildData as MakeTxData<TxVersion.V0>[],
        buildProps: extInfo || {},
      })) as MakeMultiTxData<T, O>;
    return this.buildMultiTx<O>({
      extraPreBuildData: extraPreBuildData as MakeTxData<TxVersion.LEGACY>[],
      extInfo,
    }) as MakeMultiTxData<T, O>;
  }

  public async buildV0<O = Record<string, any>>(
    props?: O & {
      lookupTableCache?: CacheLTA;
      lookupTableAddress?: string[];
      forerunCreate?: boolean;
      recentBlockhash?: string;
    },
  ): Promise<MakeTxData<TxVersion.V0, O>> {
    const {
      lookupTableCache = {},
      lookupTableAddress = [],
      forerunCreate,
      recentBlockhash: propRecentBlockhash,
      ...extInfo
    } = props || {};
    const lookupTableAddressAccount = {
      ...(this.cluster === "devnet" ? {} : LOOKUP_TABLE_CACHE),
      ...lookupTableCache,
    };
    const allLTA = Array.from(new Set<string>([...lookupTableAddress, ...this.lookupTableAddress]));
    const needCacheLTA: PublicKey[] = [];
    for (const item of allLTA) {
      if (lookupTableAddressAccount[item] === undefined) needCacheLTA.push(new PublicKey(item));
    }
    const newCacheLTA = await getMultipleLookupTableInfo({ connection: this.connection, address: needCacheLTA });
    for (const [key, value] of Object.entries(newCacheLTA)) lookupTableAddressAccount[key] = value;

    const recentBlockhash = forerunCreate
      ? PublicKey.default.toBase58()
      : propRecentBlockhash ?? (await getRecentBlockHash(this.connection, this.blockhashCommitment));
    const messageV0 = new TransactionMessage({
      payerKey: this.feePayer,
      recentBlockhash,
      instructions: [...this.allInstructions],
    }).compileToV0Message(Object.values(lookupTableAddressAccount));
    if (this.owner?.signer && !this.signers.some((s) => s.publicKey.equals(this.owner!.publicKey)))
      this.signers.push(this.owner.signer);
    const transaction = new VersionedTransaction(messageV0);

    transaction.sign(this.signers);

    return {
      builder: this,
      transaction,
      signers: this.signers,
      instructionTypes: [...this.instructionTypes, ...this.endInstructionTypes],
      execute: async (params) => {
        const {
          skipPreflight = true,
          sendAndConfirm,
          notSendToRpc,
          useDurableNonce,
          customNonceAccount,
        } = params || {};

        let finalTransaction = transaction;

        if (useDurableNonce) {
          // Use durable nonce for V0 transaction
          const { nonceAccount, nonce, advanceInstruction } = await this.setupDurableNonce(customNonceAccount);

          // Create new transaction with nonce
          const instructions = [advanceInstruction, ...this.allInstructions];
          const messageV0 = new TransactionMessage({
            payerKey: this.feePayer,
            recentBlockhash: nonce,
            instructions,
          }).compileToV0Message(Object.values(lookupTableAddressAccount));

          finalTransaction = new VersionedTransaction(messageV0);
          finalTransaction.sign(this.signers);
        }

        printSimulate([finalTransaction]);
        if (this.owner?.isKeyPair) {
          const txId = await this.connection.sendTransaction(finalTransaction, { skipPreflight });
          if (sendAndConfirm) {
            await confirmTransaction(this.connection, txId);
          }

          return {
            txId,
            signedTx: finalTransaction,
          };
        }
        if (this.signAllTransactions) {
          const txs = await this.signAllTransactions<VersionedTransaction>([finalTransaction]);
          if (this.signers.length) {
            for (const item of txs) {
              try {
                item.sign(this.signers);
              } catch (e) {
                //
              }
            }
          }
          return {
            txId: notSendToRpc ? "" : await this.connection.sendTransaction(txs[0], { skipPreflight }),
            signedTx: txs[0],
          };
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: (extInfo || {}) as O,
    };
  }

  public async buildV0MultiTx<T = Record<string, any>>(params: {
    extraPreBuildData?: MakeTxData<TxVersion.V0>[];
    buildProps?: T & {
      lookupTableCache?: CacheLTA;
      lookupTableAddress?: string[];
      forerunCreate?: boolean;
      recentBlockhash?: string;
    };
  }): Promise<MultiTxV0BuildData> {
    const { extraPreBuildData = [], buildProps } = params;
    const { transaction } = await this.buildV0(buildProps);

    const filterExtraBuildData = extraPreBuildData.filter((data) => data.builder.instructions.length > 0);

    const allTransactions: VersionedTransaction[] = [
      transaction,
      ...filterExtraBuildData.map((data) => data.transaction),
    ];
    const allSigners: Signer[][] = [this.signers, ...filterExtraBuildData.map((data) => data.signers)];
    const allInstructionTypes: string[] = [
      ...this.instructionTypes,
      ...filterExtraBuildData.map((data) => data.instructionTypes).flat(),
    ];

    if (this.owner?.signer) {
      allSigners.forEach((signers) => {
        if (!signers.some((s) => s.publicKey.equals(this.owner!.publicKey))) this.signers.push(this.owner!.signer!);
      });
    }

    allTransactions.forEach(async (tx, idx) => {
      tx.sign(allSigners[idx]);
    });

    return {
      builder: this,
      transactions: allTransactions,
      signers: allSigners,
      instructionTypes: allInstructionTypes,
      buildProps,
      execute: async (executeParams?: MultiTxExecuteParam) => {
        const { sequentially, onTxUpdate, recentBlockHash: propBlockHash, skipPreflight = true } = executeParams || {};
        if (propBlockHash) allTransactions.forEach((tx) => (tx.message.recentBlockhash = propBlockHash));
        printSimulate(allTransactions);
        if (this.owner?.isKeyPair) {
          if (sequentially) {
            const txIds: string[] = [];
            for (const tx of allTransactions) {
              const txId = await this.connection.sendTransaction(tx, { skipPreflight });
              await confirmTransaction(this.connection, txId);
              txIds.push(txId);
            }

            return { txIds, signedTxs: allTransactions };
          }

          return {
            txIds: await Promise.all(
              allTransactions.map(async (tx) => {
                return await this.connection.sendTransaction(tx, { skipPreflight });
              }),
            ),
            signedTxs: allTransactions,
          };
        }

        if (this.signAllTransactions) {
          const signedTxs = await this.signAllTransactions(allTransactions);

          if (sequentially) {
            let i = 0;
            const processedTxs: TxUpdateParams[] = [];
            const checkSendTx = async (): Promise<void> => {
              if (!signedTxs[i]) return;
              const txId = await this.connection.sendTransaction(signedTxs[i], { skipPreflight });
              processedTxs.push({ txId, status: "sent", signedTx: signedTxs[i] });
              onTxUpdate?.([...processedTxs]);
              i++;

              let confirmed = false;
              // eslint-disable-next-line
              let intervalId: NodeJS.Timer | null = null,
                subSignatureId: number | null = null;
              const cbk = (signatureResult: SignatureResult): void => {
                intervalId !== null && clearInterval(intervalId);
                subSignatureId !== null && this.connection.removeSignatureListener(subSignatureId);
                const targetTxIdx = processedTxs.findIndex((tx) => tx.txId === txId);
                if (targetTxIdx > -1) {
                  if (processedTxs[targetTxIdx].status === "error" || processedTxs[targetTxIdx].status === "success")
                    return;
                  processedTxs[targetTxIdx].status = signatureResult.err ? "error" : "success";
                }
                onTxUpdate?.([...processedTxs]);
                if (!signatureResult.err) checkSendTx();
              };

              if (this.loopMultiTxStatus)
                intervalId = setInterval(async () => {
                  if (confirmed) {
                    clearInterval(intervalId!);
                    return;
                  }
                  try {
                    const r = await this.connection.getTransaction(txId, {
                      commitment: "confirmed",
                      maxSupportedTransactionVersion: TxVersion.V0,
                    });
                    if (r) {
                      confirmed = true;
                      clearInterval(intervalId!);
                      cbk({ err: r.meta?.err || null });
                      console.log("tx status from getTransaction:", txId);
                    }
                  } catch (e) {
                    confirmed = true;
                    clearInterval(intervalId!);
                    console.error("getTransaction timeout:", e, txId);
                  }
                }, LOOP_INTERVAL);

              subSignatureId = this.connection.onSignature(
                txId,
                (result) => {
                  if (confirmed) {
                    this.connection.removeSignatureListener(subSignatureId!);
                    return;
                  }
                  confirmed = true;
                  cbk(result);
                },
                "confirmed",
              );
              this.connection.getSignatureStatus(txId);
            };
            checkSendTx();
            return {
              txIds: [],
              signedTxs,
            };
          } else {
            const txIds: string[] = [];
            for (let i = 0; i < signedTxs.length; i += 1) {
              const txId = await this.connection.sendTransaction(signedTxs[i], { skipPreflight });
              txIds.push(txId);
            }
            return { txIds, signedTxs };
          }
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: buildProps || {},
    };
  }

  public async sizeCheckBuild(
    props?: Record<string, any> & {
      computeBudgetConfig?: ComputeBudgetConfig;
      splitIns?: TransactionInstruction[];
      useDurableNonce?: boolean;
      customNonceAccount?: string;
    },
  ): Promise<MultiTxBuildData> {
    const { splitIns = [], computeBudgetConfig, useDurableNonce, customNonceAccount, ...extInfo } = props || {};
    const computeBudgetData: { instructions: TransactionInstruction[]; instructionTypes: string[] } =
      computeBudgetConfig
        ? addComputeBudget(computeBudgetConfig)
        : {
            instructions: [],
            instructionTypes: [],
          };

    const signerKey: { [key: string]: Signer } = this.signers.reduce(
      (acc, cur) => ({ ...acc, [cur.publicKey.toBase58()]: cur }),
      {},
    );

    const allTransactions: Transaction[] = [];
    const allSigners: Signer[][] = [];

    let instructionQueue: TransactionInstruction[] = [];
    let splitInsIdx = 0;
    let advanceNonceIx: TransactionInstruction | undefined;
    if (useDurableNonce) {
      const { advanceInstruction } = await this.setupDurableNonce(customNonceAccount);
      advanceNonceIx = advanceInstruction;
    }
    this.allInstructions.forEach((item) => {
      const _itemIns = [...instructionQueue, item, ...(advanceNonceIx ? [advanceNonceIx] : [])];
      const _itemInsWithCompute = computeBudgetConfig ? [...computeBudgetData.instructions, ..._itemIns] : _itemIns;
      const _signerStrs = new Set<string>(
        _itemIns.map((i) => i.keys.filter((ii) => ii.isSigner).map((ii) => ii.pubkey.toString())).flat(),
      );
      const _signer = [..._signerStrs.values()].map((i) => new PublicKey(i));

      if (
        item !== splitIns[splitInsIdx] &&
        instructionQueue.length < 12 &&
        (checkLegacyTxSize({ instructions: _itemInsWithCompute, payer: this.feePayer, signers: _signer }) ||
          checkLegacyTxSize({ instructions: _itemIns, payer: this.feePayer, signers: _signer }))
      ) {
        // current ins add to queue still not exceed tx size limit
        instructionQueue.push(item);
      } else {
        if (instructionQueue.length === 0) throw Error("item ins too big");
        splitInsIdx += item === splitIns[splitInsIdx] ? 1 : 0;
        // if add computeBudget still not exceed tx size limit
        if (
          checkLegacyTxSize({
            instructions: computeBudgetConfig
              ? [...computeBudgetData.instructions, ...instructionQueue]
              : [...instructionQueue],
            payer: this.feePayer,
            signers: _signer,
          })
        ) {
          allTransactions.push(new Transaction().add(...computeBudgetData.instructions, ...instructionQueue));
        } else {
          allTransactions.push(new Transaction().add(...instructionQueue));
        }
        allSigners.push(
          Array.from(
            new Set<string>(
              instructionQueue.map((i) => i.keys.filter((ii) => ii.isSigner).map((ii) => ii.pubkey.toString())).flat(),
            ),
          )
            .map((i) => signerKey[i])
            .filter((i) => i !== undefined),
        );
        instructionQueue = [item];
      }
    });

    if (instructionQueue.length > 0) {
      const _signerStrs = new Set<string>(
        instructionQueue.map((i) => i.keys.filter((ii) => ii.isSigner).map((ii) => ii.pubkey.toString())).flat(),
      );
      const _signers = [..._signerStrs.values()].map((i) => signerKey[i]).filter((i) => i !== undefined);

      if (
        checkLegacyTxSize({
          instructions: computeBudgetConfig
            ? [...computeBudgetData.instructions, ...instructionQueue]
            : [...instructionQueue],
          payer: this.feePayer,
          signers: _signers.map((s) => s.publicKey),
        })
      ) {
        allTransactions.push(new Transaction().add(...computeBudgetData.instructions, ...instructionQueue));
      } else {
        allTransactions.push(new Transaction().add(...instructionQueue));
      }
      allSigners.push(_signers);
    }
    allTransactions.forEach((tx) => (tx.feePayer = this.feePayer));

    if (this.owner?.signer) {
      allSigners.forEach((signers) => {
        if (!signers.some((s) => s.publicKey.equals(this.owner!.publicKey))) signers.push(this.owner!.signer!);
      });
    }

    return {
      builder: this,
      transactions: allTransactions,
      signers: allSigners,
      instructionTypes: this.instructionTypes,
      execute: async (executeParams?: MultiTxExecuteParam) => {
        const {
          sequentially,
          onTxUpdate,
          skipTxCount = 0,
          recentBlockHash: propBlockHash,
          skipPreflight = true,
        } = executeParams || {};
        const recentBlockHash = propBlockHash ?? (await getRecentBlockHash(this.connection, this.blockhashCommitment));
        allTransactions.forEach(async (tx, idx) => {
          tx.recentBlockhash = recentBlockHash;
          if (allSigners[idx].length) tx.sign(...allSigners[idx]);
        });
        printSimulate(allTransactions);
        if (this.owner?.isKeyPair) {
          if (allTransactions.length > 1 && !sequentially) {
            throw new Error("multi tx only support sequentially send");
          }
          if (sequentially) {
            let i = 0;
            const txIds: string[] = [];
            for (const tx of allTransactions) {
              ++i;
              if (i <= skipTxCount) {
                txIds.push("tx skipped");
                continue;
              }

              if (useDurableNonce) {
                const { nonce } = await this.setupDurableNonce(customNonceAccount);
                tx.recentBlockhash = nonce;
                if (allSigners[i].length) {
                  tx.partialSign(...allSigners[i]);
                }
              }

              const txId = await sendAndConfirmTransaction(
                this.connection,
                tx,
                this.signers.find((s) => s.publicKey.equals(this.owner!.publicKey))
                  ? this.signers
                  : [...this.signers, this.owner.signer!],
                { skipPreflight },
              );
              txIds.push(txId);
            }

            return {
              txIds,
              signedTxs: allTransactions,
            };
          }
          return {
            txIds: await Promise.all(
              allTransactions.map(async (tx) => {
                return await this.connection.sendRawTransaction(tx.serialize(), { skipPreflight });
              }),
            ),
            signedTxs: allTransactions,
          };
        }
        if (this.signAllTransactions) {
          const needSignedTx = await this.signAllTransactions(
            allTransactions.slice(skipTxCount, allTransactions.length),
          );
          const signedTxs = [...allTransactions.slice(0, skipTxCount), ...needSignedTx];
          if (sequentially) {
            let i = 0;
            const processedTxs: TxUpdateParams[] = [];
            const checkSendTx = async (): Promise<void> => {
              if (!signedTxs[i]) return;
              if (i < skipTxCount) {
                // success before, do not send again
                processedTxs.push({ txId: "", status: "success", signedTx: signedTxs[i] });
                onTxUpdate?.([...processedTxs]);
                i++;
                checkSendTx();
              }
              if (useDurableNonce) {
                const { nonce } = await this.setupDurableNonce(customNonceAccount);
                signedTxs[i].recentBlockhash = nonce;
                if (allSigners[i].length) {
                  signedTxs[i].partialSign(...allSigners[i]);
                }
              }
              const txId = await this.connection.sendRawTransaction(signedTxs[i].serialize(), { skipPreflight });
              processedTxs.push({ txId, status: "sent", signedTx: signedTxs[i] });
              onTxUpdate?.([...processedTxs]);
              i++;

              let confirmed = false;
              // eslint-disable-next-line
              let intervalId: NodeJS.Timer | null = null,
                subSignatureId: number | null = null;
              const cbk = (signatureResult: SignatureResult): void => {
                intervalId !== null && clearInterval(intervalId);
                subSignatureId !== null && this.connection.removeSignatureListener(subSignatureId);
                const targetTxIdx = processedTxs.findIndex((tx) => tx.txId === txId);
                if (targetTxIdx > -1) {
                  if (processedTxs[targetTxIdx].status === "error" || processedTxs[targetTxIdx].status === "success")
                    return;
                  processedTxs[targetTxIdx].status = signatureResult.err ? "error" : "success";
                }
                onTxUpdate?.([...processedTxs]);
                if (!signatureResult.err) checkSendTx();
              };

              if (this.loopMultiTxStatus)
                intervalId = setInterval(async () => {
                  if (confirmed) {
                    clearInterval(intervalId!);
                    return;
                  }
                  try {
                    const r = await this.connection.getTransaction(txId, {
                      commitment: "confirmed",
                      maxSupportedTransactionVersion: TxVersion.V0,
                    });
                    if (r) {
                      confirmed = true;
                      clearInterval(intervalId!);
                      cbk({ err: r.meta?.err || null });
                      console.log("tx status from getTransaction:", txId);
                    }
                  } catch (e) {
                    confirmed = true;
                    clearInterval(intervalId!);
                    console.error("getTransaction timeout:", e, txId);
                  }
                }, LOOP_INTERVAL);

              subSignatureId = this.connection.onSignature(
                txId,
                (result) => {
                  if (confirmed) {
                    this.connection.removeSignatureListener(subSignatureId!);
                    return;
                  }
                  confirmed = true;
                  cbk(result);
                },
                "confirmed",
              );
              this.connection.getSignatureStatus(txId);
            };
            await checkSendTx();
            return {
              txIds: processedTxs.map((d) => d.txId),
              signedTxs,
            };
          } else {
            const txIds: string[] = [];
            for (let i = 0; i < signedTxs.length; i += 1) {
              const txId = await this.connection.sendRawTransaction(signedTxs[i].serialize(), { skipPreflight });
              txIds.push(txId);
            }
            return { txIds, signedTxs };
          }
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: extInfo || {},
    };
  }

  public async sizeCheckBuildV0(
    props?: Record<string, any> & {
      computeBudgetConfig?: ComputeBudgetConfig;
      lookupTableCache?: CacheLTA;
      lookupTableAddress?: string[];
      splitIns?: TransactionInstruction[];
      useDurableNonce?: boolean;
      customNonceAccount?: string;
    },
  ): Promise<MultiTxV0BuildData> {
    const {
      computeBudgetConfig,
      splitIns = [],
      lookupTableCache = {},
      lookupTableAddress = [],
      ...extInfo
    } = props || {};
    const lookupTableAddressAccount = {
      ...(this.cluster === "devnet" ? {} : LOOKUP_TABLE_CACHE),
      ...lookupTableCache,
    };
    const allLTA = Array.from(new Set<string>([...this.lookupTableAddress, ...lookupTableAddress]));
    const needCacheLTA: PublicKey[] = [];
    for (const item of allLTA) {
      if (lookupTableAddressAccount[item] === undefined) needCacheLTA.push(new PublicKey(item));
    }
    const newCacheLTA = await getMultipleLookupTableInfo({ connection: this.connection, address: needCacheLTA });
    for (const [key, value] of Object.entries(newCacheLTA)) lookupTableAddressAccount[key] = value;

    const computeBudgetData: { instructions: TransactionInstruction[]; instructionTypes: string[] } =
      computeBudgetConfig
        ? addComputeBudget(computeBudgetConfig)
        : {
            instructions: [],
            instructionTypes: [],
          };

    const blockHash = await getRecentBlockHash(this.connection, this.blockhashCommitment);

    const signerKey: { [key: string]: Signer } = this.signers.reduce(
      (acc, cur) => ({ ...acc, [cur.publicKey.toBase58()]: cur }),
      {},
    );
    const allTransactions: VersionedTransaction[] = [];
    const allSigners: Signer[][] = [];

    let instructionQueue: TransactionInstruction[] = [];
    let splitInsIdx = 0;
    let advanceIx: TransactionInstruction | undefined;
    if (props?.useDurableNonce) {
      console.log("use durable nonce for v0 tx");
      const { advanceInstruction } = await this.setupDurableNonce(props?.customNonceAccount);
      advanceIx = advanceInstruction;
    }
    this.allInstructions.forEach((item) => {
      const _itemIns = [...instructionQueue, item, advanceIx].filter(
        (i) => i !== undefined,
      ) as TransactionInstruction[];
      const _itemInsWithCompute = computeBudgetConfig ? [...computeBudgetData.instructions, ..._itemIns] : _itemIns;
      if (
        item !== splitIns[splitInsIdx] &&
        instructionQueue.length < 12 &&
        (checkV0TxSize({ instructions: _itemInsWithCompute, payer: this.feePayer, lookupTableAddressAccount }) ||
          checkV0TxSize({ instructions: _itemIns, payer: this.feePayer, lookupTableAddressAccount }))
      ) {
        // current ins add to queue still not exceed tx size limit
        instructionQueue.push(item);
      } else {
        if (instructionQueue.length === 0) throw Error("item ins too big");
        splitInsIdx += item === splitIns[splitInsIdx] ? 1 : 0;
        const lookupTableAddress: undefined | CacheLTA = {};
        for (const item of [...new Set<string>(allLTA)]) {
          if (lookupTableAddressAccount[item] !== undefined) lookupTableAddress[item] = lookupTableAddressAccount[item];
        }
        // if add computeBudget still not exceed tx size limit
        if (
          computeBudgetConfig &&
          checkV0TxSize({
            instructions: [...computeBudgetData.instructions, ...instructionQueue],
            payer: this.feePayer,
            lookupTableAddressAccount,
            recentBlockhash: blockHash,
          })
        ) {
          const messageV0 = new TransactionMessage({
            payerKey: this.feePayer,
            recentBlockhash: blockHash,

            instructions: [...computeBudgetData.instructions, ...instructionQueue],
          }).compileToV0Message(Object.values(lookupTableAddressAccount));
          allTransactions.push(new VersionedTransaction(messageV0));
        } else {
          const messageV0 = new TransactionMessage({
            payerKey: this.feePayer,
            recentBlockhash: blockHash,
            instructions: [...instructionQueue],
          }).compileToV0Message(Object.values(lookupTableAddressAccount));
          allTransactions.push(new VersionedTransaction(messageV0));
        }
        allSigners.push(
          Array.from(
            new Set<string>(
              instructionQueue.map((i) => i.keys.filter((ii) => ii.isSigner).map((ii) => ii.pubkey.toString())).flat(),
            ),
          )
            .map((i) => signerKey[i])
            .filter((i) => i !== undefined),
        );
        instructionQueue = [item];
      }
    });

    if (instructionQueue.length > 0) {
      const _signerStrs = new Set<string>(
        instructionQueue.map((i) => i.keys.filter((ii) => ii.isSigner).map((ii) => ii.pubkey.toString())).flat(),
      );
      const _signers = [..._signerStrs.values()].map((i) => signerKey[i]).filter((i) => i !== undefined);

      if (
        computeBudgetConfig &&
        checkV0TxSize({
          instructions: [...computeBudgetData.instructions, ...instructionQueue],
          payer: this.feePayer,
          lookupTableAddressAccount,
          recentBlockhash: blockHash,
        })
      ) {
        const messageV0 = new TransactionMessage({
          payerKey: this.feePayer,
          recentBlockhash: blockHash,
          instructions: [...computeBudgetData.instructions, ...instructionQueue],
        }).compileToV0Message(Object.values(lookupTableAddressAccount));
        allTransactions.push(new VersionedTransaction(messageV0));
      } else {
        const messageV0 = new TransactionMessage({
          payerKey: this.feePayer,
          recentBlockhash: blockHash,
          instructions: [...instructionQueue],
        }).compileToV0Message(Object.values(lookupTableAddressAccount));
        allTransactions.push(new VersionedTransaction(messageV0));
      }

      allSigners.push(_signers);
    }

    if (this.owner?.signer) {
      allSigners.forEach((signers) => {
        if (!signers.some((s) => s.publicKey.equals(this.owner!.publicKey))) signers.push(this.owner!.signer!);
      });
    }

    allTransactions.forEach((tx, idx) => {
      tx.sign(allSigners[idx]);
    });

    return {
      builder: this,
      transactions: allTransactions,
      buildProps: props,
      signers: allSigners,
      instructionTypes: this.instructionTypes,
      execute: async (executeParams?: MultiTxExecuteParam) => {
        const {
          sequentially,
          onTxUpdate,
          skipTxCount = 0,
          recentBlockHash: propBlockHash,
          skipPreflight = true,
          useDurableNonce = false,
          customNonceAccount,
        } = executeParams || {};
        allTransactions.map(async (tx, idx) => {
          if (allSigners[idx].length) tx.sign(allSigners[idx]);
          if (propBlockHash) tx.message.recentBlockhash = propBlockHash;
        });
        printSimulate(allTransactions);
        if (this.owner?.isKeyPair) {
          if (allTransactions.length > 1 && useDurableNonce && !sequentially) {
            throw new Error("useDurableNonce only support sequentially send txs");
          }
          if (sequentially) {
            let i = 0;
            const txIds: string[] = [];
            for (const tx of allTransactions) {
              ++i;
              if (i <= skipTxCount) {
                console.log("skip tx: ", i);
                txIds.push("tx skipped");
                continue;
              }
              if (useDurableNonce) {
                const { nonce } = await this.setupDurableNonce(customNonceAccount);
                tx.message.recentBlockhash = nonce;
                if (allSigners[i].length) {
                  tx.sign(allSigners[i]);
                }
              }
              printSimulate([tx]);
              const txId = await this.connection.sendTransaction(tx, { skipPreflight });
              await confirmTransaction(this.connection, txId);

              txIds.push(txId);
            }

            return { txIds, signedTxs: allTransactions };
          }

          return {
            txIds: await Promise.all(
              allTransactions.map(async (tx) => {
                return await this.connection.sendTransaction(tx, { skipPreflight });
              }),
            ),
            signedTxs: allTransactions,
          };
        }
        if (useDurableNonce && sequentially && this.signAllTransactions) {
          const signers = allSigners.slice(skipTxCount, allSigners.length);
          let i = 0;
          const processedTxs: TxUpdateParams[] = [];
          const signedTxs: VersionedTransaction[] = [];
          for await (const tx of allTransactions.slice(skipTxCount, allTransactions.length)) {
            const { nonce, nonceAccount, advanceInstruction } = await this.setupDurableNonce(customNonceAccount);
            console.log("use durable nonce for tx:", nonceAccount.toBase58());
            const messageV0 = TransactionMessage.decompile(tx.message, {
              addressLookupTableAccounts: Object.values(lookupTableAddressAccount),
            });
            messageV0.recentBlockhash = nonce;
            messageV0.instructions = [advanceInstruction, ...messageV0.instructions];
            const newTx = new VersionedTransaction(
              messageV0.compileToV0Message(Object.values(lookupTableAddressAccount)),
            );
            if (signers[i].length) {
              newTx.sign(signers[i]);
            }

            printSimulate([newTx]);
            console.log(
              await this.connection.simulateTransaction(newTx, {
                commitment: this.blockhashCommitment,
                replaceRecentBlockhash: true,
              }),
            );
            const txs = await this.signAllTransactions([newTx]);
            signedTxs.push(txs[0]);

            const checkSendTx = async (): Promise<void> => {
              printSimulate(txs);
              const txId = await this.connection.sendTransaction(txs[0], { skipPreflight });
              processedTxs.push({ txId, status: "sent", signedTx: txs[0] });
              onTxUpdate?.([...processedTxs]);
              i++;
              let confirmed = false;
              let intervalId: NodeJS.Timer | null = null;
              let subSignatureId: number | null = null;
              const cbk = (signatureResult: SignatureResult): void => {
                const targetTxIdx = processedTxs.findIndex((tx) => tx.txId === txId);
                if (targetTxIdx > -1) {
                  if (processedTxs[targetTxIdx].status === "error" || processedTxs[targetTxIdx].status === "success")
                    return;
                  processedTxs[targetTxIdx].status = signatureResult.err ? "error" : "success";
                }
                onTxUpdate?.([...processedTxs]);
                if (!signatureResult.err) checkSendTx();
              };

              if (this.loopMultiTxStatus)
                intervalId = setInterval(async () => {
                  if (confirmed) {
                    clearInterval(intervalId!);
                    return;
                  }
                  try {
                    const r = await this.connection.getTransaction(txId, {
                      commitment: "confirmed",
                      maxSupportedTransactionVersion: TxVersion.V0,
                    });
                    if (r) {
                      confirmed = true;
                      clearInterval(intervalId!);
                      cbk({ err: r.meta?.err || null });
                      console.log("tx status from getTransaction:", txId);
                    }
                  } catch (e) {
                    confirmed = true;
                    clearInterval(intervalId!);
                    console.error("getTransaction timeout:", e, txId);
                  }
                }, LOOP_INTERVAL);

              subSignatureId = this.connection.onSignature(
                txId,
                (result) => {
                  if (confirmed) {
                    this.connection.removeSignatureListener(subSignatureId!);
                    return;
                  }
                  confirmed = true;
                  cbk(result);
                },
                "confirmed",
              );
              this.connection.getSignatureStatus(txId);
            };

            await checkSendTx();
          }
          return {
            txIds: processedTxs.map((d) => d.txId),
            signedTxs,
          };
        }
        if (this.signAllTransactions) {
          const needSignedTx = await this.signAllTransactions(
            allTransactions.slice(skipTxCount, allTransactions.length),
          );
          const signedTxs = [...allTransactions.slice(0, skipTxCount), ...needSignedTx];
          if (sequentially) {
            let i = 0;
            const processedTxs: TxUpdateParams[] = [];
            const checkSendTx = async (): Promise<void> => {
              if (!signedTxs[i]) return;
              if (i < skipTxCount) {
                // success before, do not send again
                processedTxs.push({ txId: "", status: "success", signedTx: signedTxs[i] });
                onTxUpdate?.([...processedTxs]);
                i++;
                checkSendTx();
                return;
              }
              if (useDurableNonce) {
                const { nonce } = await this.setupDurableNonce(customNonceAccount);
                signedTxs[i].message.recentBlockhash = nonce;
                if (allSigners[i].length) {
                  signedTxs[i].sign(allSigners[i]);
                }
              }
              printSimulate([signedTxs[i]]);
              const txId = await this.connection.sendTransaction(signedTxs[i], { skipPreflight });
              processedTxs.push({ txId, status: "sent", signedTx: signedTxs[i] });
              onTxUpdate?.([...processedTxs]);
              i++;

              let confirmed = false;
              // eslint-disable-next-line
              let intervalId: NodeJS.Timer | null = null,
                subSignatureId: number | null = null;
              const cbk = (signatureResult: SignatureResult): void => {
                intervalId !== null && clearInterval(intervalId);
                subSignatureId !== null && this.connection.removeSignatureListener(subSignatureId);
                const targetTxIdx = processedTxs.findIndex((tx) => tx.txId === txId);
                if (targetTxIdx > -1) {
                  if (processedTxs[targetTxIdx].status === "error" || processedTxs[targetTxIdx].status === "success")
                    return;
                  processedTxs[targetTxIdx].status = signatureResult.err ? "error" : "success";
                }
                onTxUpdate?.([...processedTxs]);
                if (!signatureResult.err) checkSendTx();
              };

              if (this.loopMultiTxStatus)
                intervalId = setInterval(async () => {
                  if (confirmed) {
                    clearInterval(intervalId!);
                    return;
                  }
                  try {
                    const r = await this.connection.getTransaction(txId, {
                      commitment: "confirmed",
                      maxSupportedTransactionVersion: TxVersion.V0,
                    });
                    if (r) {
                      confirmed = true;
                      clearInterval(intervalId!);
                      cbk({ err: r.meta?.err || null });
                      console.log("tx status from getTransaction:", txId);
                    }
                  } catch (e) {
                    confirmed = true;
                    clearInterval(intervalId!);
                    console.error("getTransaction timeout:", e, txId);
                  }
                }, LOOP_INTERVAL);

              subSignatureId = this.connection.onSignature(
                txId,
                (result) => {
                  if (confirmed) {
                    this.connection.removeSignatureListener(subSignatureId!);
                    return;
                  }
                  confirmed = true;
                  cbk(result);
                },
                "confirmed",
              );
              this.connection.getSignatureStatus(txId);
            };
            checkSendTx();
            return {
              txIds: [],
              signedTxs,
            };
          } else {
            const txIds: string[] = [];
            for (let i = 0; i < signedTxs.length; i += 1) {
              const txId = await this.connection.sendTransaction(signedTxs[i], { skipPreflight });
              txIds.push(txId);
            }
            return { txIds, signedTxs };
          }
        }
        throw new Error("please provide owner in keypair format or signAllTransactions function");
      },
      extInfo: extInfo || {},
    };
  }
}
