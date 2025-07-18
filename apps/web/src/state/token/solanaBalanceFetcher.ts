import { parseTokenAccountResp, TokenAccount } from '@pancakeswap/solana-core-sdk'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token-0.4'
import { Connection, PublicKey } from '@solana/web3.js'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

export async function fetchSolanaTokenBalances(walletAddress: string): Promise<Map<string, TokenAccount[]>> {
  const connection = new Connection(SOLANA_RPC_ENDPOINT)
  const owner = new PublicKey(walletAddress)
  const [solAccountResp, tokenAccountResp, token2022Req] = await Promise.all([
    connection.getAccountInfo(owner),
    connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
    connection.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }),
  ])

  const tokenAccountData = parseTokenAccountResp({
    owner,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  })

  const tokenAccountMap: Map<string, TokenAccount[]> = new Map()
  tokenAccountData.tokenAccounts.forEach((tokenAccount) => {
    const mintStr = tokenAccount.mint?.toBase58()
    if (!tokenAccountMap.has(mintStr)) {
      tokenAccountMap.set(mintStr, [tokenAccount])
      return
    }
    tokenAccountMap.get(mintStr)!.push(tokenAccount)
  })

  tokenAccountMap.forEach((tokenAccount) => {
    tokenAccount.sort((a, b) => (a.amount.lt(b.amount) ? 1 : -1))
  })
  return tokenAccountMap
}
