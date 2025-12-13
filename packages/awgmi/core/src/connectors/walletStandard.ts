import {
  AccountAuthenticator,
  InputGenerateTransactionOptions,
  InputGenerateTransactionPayloadData,
} from '@aptos-labs/ts-sdk'

import { getWallets, Wallet } from '@wallet-standard/core'
import { Chain } from '../chain'
import { ConnectorNotFoundError } from '../errors'
import { Connector } from './base'
import { Account, SignMessagePayload, SignMessageResponse } from './types'
import { convertTransactionPayloadForWalletStandard } from '../transactions/payloadTransformer'

type WalletStandardConnectorOptions = {
  /** Id of connector */
  id: string
  /** Name of connector */
  name: string
}

type AptosWallet = Wallet & {
  features: {
    'aptos:connect': {
      connect(): Promise<{
        args: {
          address: { data: Uint8Array }
          publicKey: { key: { data: Uint8Array } }
        }
        status: string
      }>
    }
    'aptos:disconnect'?: {
      disconnect(): Promise<void>
    }
    'aptos:account'?: {
      account(): Promise<Account>
    }
    'aptos:network': {
      network(): Promise<{ name: string }>
    }
    'aptos:signTransaction': {
      signTransaction(tx: any): Promise<any>
    }
    'aptos:signAndSubmitTransaction': {
      signAndSubmitTransaction(input: { payload: any; gasUnitPrice?: number; maxGasAmount?: number }): Promise<{
        args: {
          hash: string
        }
        status: 'Approved' | 'Rejected'
      }>
    }
    'aptos:signMessage': {
      signMessage(msg: SignMessagePayload): Promise<SignMessageResponse>
    }
    'standard:events'?: {
      on(
        event: 'change',
        cb: (args: {
          accounts?: Array<{
            args: {
              address: { data: Uint8Array }
              publicKey: { key: { data: Uint8Array } }
            }
          }>
          chain?: string
        }) => void,
      ): void
    }
  }
}

export class WalletStandardConnector extends Connector<AptosWallet, WalletStandardConnectorOptions> {
  readonly id: string

  readonly name: string

  provider?: AptosWallet

  constructor(config: { chains?: Chain[]; options?: WalletStandardConnectorOptions } = {}) {
    super(config)

    if (!config.options?.id || !config.options?.name) {
      throw new Error('WalletStandardConnector requires options.id and options.name')
    }

    this.id = config.options.id
    this.name = config.options.name
  }

  get ready(): boolean {
    if (typeof window === 'undefined') return false

    return getWallets()
      .get()
      .some((w) => w.name.toLowerCase() === this.name.toLowerCase() || w.name.toLowerCase() === this.id.toLowerCase())
  }

  async getProvider(_config?: { networkName?: string }): Promise<AptosWallet> {
    if (this.provider) return this.provider

    const wallets = getWallets().get()
    const wallet = wallets.find((w) => w.name.toLowerCase() === this.id)

    if (!wallet) throw new ConnectorNotFoundError()

    this.provider = wallet as unknown as AptosWallet
    return this.provider
  }

  async connect(_config?: { networkName?: string }) {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    this.emit('message', { type: 'connecting' })

    const result = await provider.features['aptos:connect'].connect()

    const account: Account = {
      address: `0x${Buffer.from(result.args.address.data).toString('hex')}` as `0x${string}`,
      publicKey: Buffer.from(result.args.publicKey.key.data).toString('hex'),
    }

    const networkResult = await provider.features['aptos:network'].network()
    const network = typeof networkResult === 'string' ? networkResult : networkResult.name

    provider.features['standard:events']?.on(
      'change',
      ({
        accounts: rawAccounts,
        chain,
      }: {
        accounts?: Array<{
          args: {
            address: { data: Uint8Array }
            publicKey: { key: { data: Uint8Array } }
          }
        }>
        chain?: string
      }) => {
        if (!rawAccounts || rawAccounts.length === 0) {
          this.emit('disconnect')
        } else {
          const raw = rawAccounts[0]
          const acc: Account = {
            address: `0x${Buffer.from(raw.args.address.data).toString('hex')}` as `0x${string}`,
            publicKey: Buffer.from(raw.args.publicKey.key.data).toString('hex'),
          }
          this.emit('change', { account: acc })
        }

        if (chain) {
          this.emit('change', { network: chain })
        }
      },
    )

    return {
      account,
      network,
      provider,
    }
  }

  async disconnect() {
    const provider = await this.getProvider()
    return provider?.features['aptos:disconnect']?.disconnect()
  }

  async account(): Promise<Account> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    if (provider.features['aptos:account']) {
      return provider.features['aptos:account'].account()
    }

    throw new ConnectorNotFoundError()
  }

  async network(): Promise<string> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    const result = await provider.features['aptos:network'].network()

    return typeof result === 'string' ? result : result.name
  }

  async isConnected() {
    try {
      const provider = await this.getProvider()
      if (!provider) return false

      const result = provider.features['aptos:account'] && (await provider.features['aptos:account'].account())

      return !!result?.address
    } catch {
      return false
    }
  }

  async signTransaction(_tx: InputGenerateTransactionPayloadData): Promise<AccountAuthenticator> {
    throw new Error('signTransaction is not supported by Petra Wallet Standard')
  }

  async signAndSubmitTransaction(
    tx: InputGenerateTransactionPayloadData,
    options?: Partial<InputGenerateTransactionOptions>,
  ) {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()
    const result = await provider.features['aptos:signAndSubmitTransaction'].signAndSubmitTransaction({
      payload: convertTransactionPayloadForWalletStandard(tx),
      gasUnitPrice: options?.gasUnitPrice,
      maxGasAmount: options?.maxGasAmount,
    })

    if (result?.status !== 'Approved') {
      throw new Error('Transaction was not approved')
    }

    return {
      hash: result.args.hash,
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    return provider.features['aptos:signMessage'].signMessage(message)
  }
}
