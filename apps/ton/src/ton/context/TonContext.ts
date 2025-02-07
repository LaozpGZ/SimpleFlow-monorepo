import { getHttpEndpoint } from '@orbs-network/ton-access'
import { TonClient } from '@ton/ton'
import { tonState } from 'ton/atom/tonStateAtom'
import { TonContextEvents, TonNetworks } from 'ton/ton.enums'
import { Emiter } from 'ton/utils/Emiter'
import { TonEndPoints } from './endpoints'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  private endpoint?: string

  constructor() {
    super()

    const { network } = tonState

    this.tonClient = new TonClient({ endpoint: TonEndPoints[network] })
    getHttpEndpoint({ network: network === TonNetworks.Mainnet ? 'mainnet' : 'testnet' }).then((endpoint) => {
      this.endpoint = endpoint
      this.tonClient = new TonClient({ endpoint })
    })
  }

  public getClient() {
    return this.tonClient ?? ({} as unknown as TonClient)
  }

  public getEndPoint() {
    return this.endpoint
  }

  public static instance = new TonContext()
}
