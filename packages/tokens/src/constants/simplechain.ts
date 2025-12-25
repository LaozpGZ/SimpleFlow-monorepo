import { ChainId } from '@simpleflow/chains'
import { ERC20Token } from '@simpleflow/sdk'

// SimpleChain Mainnet Tokens
export const simplechainTokens = {
  // 原生代币 Wrapped SRW
  wsrw: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  // 作为 wmon 的别名，兼容旧代码
  wmon: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  // 作为 weth 的别名，兼容旧代码
  weth: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  usdt: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  wbtc: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xc48DC2507A162E2Ab63e12055CA5C79cf9b19BF2',
    8,
    'WBTC',
    'Wrapped Bitcoin',
    'https://wbtc.network/',
  ),
  // Mock WETH (可 mint)
  mockWeth: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x9F19e7749ceE12d56488C394556D52C89d68258A',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io/',
  ),
  // Wrapped SOL
  wsol: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xbB0543b26A291648D67B91a8A0f150f6122FEd03',
    9,
    'WSOL',
    'Wrapped SOL',
    'https://solana.com/',
  ),
  dai: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://makerdao.com/',
  ),
  // 兼容旧代码的 busd alias (指向 usdc)
  busd: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  // 兼容旧代码的 ausd alias
  ausd: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  // 兼容旧代码的 usdt0 alias
  usdt0: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  // 测试代币
  test1: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x31bbA26B33F6B15359876C86D06AC0848C6C2C29',
    18,
    'TEST1',
    'Test Token 1',
    'https://simplechain.com/',
  ),
  test2: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C',
    18,
    'TEST2',
    'Test Token 2',
    'https://simplechain.com/',
  ),
  test3: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856',
    18,
    'TEST3',
    'Test Token 3',
    'https://simplechain.com/',
  ),
  test4: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x86b330E5D253D2eEAE9316ecc2e62322B90eF809',
    18,
    'TEST4',
    'Test Token 4',
    'https://simplechain.com/',
  ),
  // SDX 代币 (只有 MasterChef 可以 mint)
  sdx: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75',
    18,
    'SDX',
    'SimpleFlow Token',
    'https://simplechain.com/',
  ),
  // sSRW - Staked SRW (Liquid Staking Token)
  ssrw: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x1234567890123456789012345678901234567890', // TODO: 部署后替换为实际合约地址
    18,
    'sSRW',
    'Staked SRW',
    'https://simplechain.com/',
  ),
}
