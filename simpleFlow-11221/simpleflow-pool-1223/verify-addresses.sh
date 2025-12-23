#!/bin/bash

# ============================================================
# SimpleDex V3 链上地址验证脚本
# 验证 7 个流动性池和核心合约
# 创建日期: 2024-12-23
# ============================================================

RPC_URL="https://testnet-rpc.simplechain.com"

echo "=========================================="
echo "SimpleDex V3 链上地址验证"
echo "网络: SimpleChain Testnet (Chain ID: 1914)"
echo "RPC: $RPC_URL"
echo "验证时间: $(date)"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# 核心合约地址
# ============================================================

FACTORY="0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5"
POOL_DEPLOYER="0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d"
POSITION_MANAGER="0x53074FeB375dD50b600c9986180ab90974112284"
SWAP_ROUTER="0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0"
SMART_ROUTER="0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12"
QUOTER="0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5"
QUOTER_V2="0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A"
TICK_LENS="0x64272699d818646781a4fCAa435C98A05b2d9668"
MULTICALL3="0xcA11bde05977b3631167028862bE2a173976CA11"
PERMIT2="0x339b28A97Cb2311F85B75C375cC0CD7D2F2417d0"

# ============================================================
# 代币地址 (已确认正确)
# ============================================================

WSRW="0x22608aC253B934D5078cB0d12f7F7e377b51798b"
WBTC="0x770556F853a17893b1187A9754F17c6f57776b7c"
USDT="0x3577E5E0E3A47d9a552426638977ee3EddD4552e"
USDC="0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769"
DAI="0xA16171a7dadfb86afC934eaF16daCD86cD435120"

# ============================================================
# 池子地址 (7个)
# ============================================================

POOL_WBTC_USDT="0x851D390bdA232082C6368Ee1c245F6Eea5eadD62"
POOL_WBTC_USDC="0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F"
POOL_DAI_USDT="0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad"
POOL_DAI_USDC="0x1eaC1C35f06231357F4a61ceb14962735Fa20b57"
POOL_WBTC_WSRW="0x74698cde37436b62d60C877D39B5EdB6c9C70a74"
POOL_WSRW_USDT="0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25"
POOL_WSRW_USDC="0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a"

# ============================================================
# 验证函数
# ============================================================

check_contract_exists() {
    local address=$1
    local name=$2
    
    code=$(cast code $address --rpc-url $RPC_URL 2>/dev/null)
    
    if [ "$code" != "0x" ] && [ -n "$code" ]; then
        echo -e "${GREEN}✓${NC} $name ($address) - 合约存在"
        return 0
    else
        echo -e "${RED}✗${NC} $name ($address) - 合约不存在或无代码"
        return 1
    fi
}

get_token_info() {
    local address=$1
    local name=$2
    
    echo ""
    echo "--- $name ---"
    
    symbol=$(cast call $address "symbol()(string)" --rpc-url $RPC_URL 2>/dev/null)
    decimals=$(cast call $address "decimals()(uint8)" --rpc-url $RPC_URL 2>/dev/null)
    
    if [ -n "$symbol" ]; then
        echo "  Symbol: $symbol"
        echo "  Decimals: $decimals"
        echo "  地址: $address"
        echo -e "  ${GREEN}✓ 代币验证通过${NC}"
    else
        echo -e "  ${RED}无法获取代币信息${NC}"
    fi
}

verify_pool() {
    local pool_address=$1
    local pool_name=$2
    local expected_fee=$3
    
    echo ""
    echo "--- 验证池子: $pool_name ---"
    echo "  池子地址: $pool_address"
    
    # 检查合约是否存在
    code=$(cast code $pool_address --rpc-url $RPC_URL 2>/dev/null)
    if [ "$code" == "0x" ] || [ -z "$code" ]; then
        echo -e "  ${RED}✗ 池子合约不存在${NC}"
        return 1
    fi
    
    # 获取池子信息
    token0=$(cast call $pool_address "token0()(address)" --rpc-url $RPC_URL 2>/dev/null)
    token1=$(cast call $pool_address "token1()(address)" --rpc-url $RPC_URL 2>/dev/null)
    fee=$(cast call $pool_address "fee()(uint24)" --rpc-url $RPC_URL 2>/dev/null)
    liquidity=$(cast call $pool_address "liquidity()(uint128)" --rpc-url $RPC_URL 2>/dev/null)
    
    # 获取代币符号
    token0_symbol=$(cast call $token0 "symbol()(string)" --rpc-url $RPC_URL 2>/dev/null)
    token1_symbol=$(cast call $token1 "symbol()(string)" --rpc-url $RPC_URL 2>/dev/null)
    
    echo "  Token0: $token0 ($token0_symbol)"
    echo "  Token1: $token1 ($token1_symbol)"
    echo "  Fee: $fee"
    echo "  Liquidity: $liquidity"
    
    # 验证fee是否匹配
    if [ "$fee" == "$expected_fee" ]; then
        echo -e "  ${GREEN}✓ Fee 匹配${NC}"
    else
        echo -e "  ${RED}✗ Fee 不匹配 (期望: $expected_fee, 实际: $fee)${NC}"
    fi
    
    # 检查是否有流动性
    if [ "$liquidity" != "0" ] && [ -n "$liquidity" ]; then
        echo -e "  ${GREEN}✓ 池子有流动性${NC}"
    else
        echo -e "  ${YELLOW}⚠ 池子暂无流动性${NC}"
    fi
}

verify_periphery_contract() {
    local address=$1
    local name=$2
    
    echo ""
    echo "--- 验证 $name ---"
    echo "  地址: $address"
    
    # 检查合约是否存在
    code=$(cast code $address --rpc-url $RPC_URL 2>/dev/null)
    if [ "$code" == "0x" ] || [ -z "$code" ]; then
        echo -e "  ${RED}✗ 合约不存在${NC}"
        return 1
    fi
    echo -e "  ${GREEN}✓ 合约存在${NC}"
    
    # 尝试获取factory地址
    factory=$(cast call $address "factory()(address)" --rpc-url $RPC_URL 2>/dev/null)
    
    if [ -n "$factory" ]; then
        echo "  Factory 指向: $factory"
        if [ "$factory" == "$FACTORY" ]; then
            echo -e "  ${GREEN}✓ Factory 地址正确${NC}"
        fi
    fi
}

# ============================================================
# 开始验证
# ============================================================

echo "============================================"
echo -e "${BLUE}1. 验证核心合约存在性${NC}"
echo "============================================"

check_contract_exists $FACTORY "SimpleDexV3Factory"
check_contract_exists $POOL_DEPLOYER "SimpleDexV3PoolDeployer"

echo ""
echo "============================================"
echo -e "${BLUE}2. 验证代币信息${NC}"
echo "============================================"

echo ""
echo -e "${YELLOW}【重要】WSRW 地址确认: $WSRW${NC}"
get_token_info $WSRW "WSRW (原生包装代币)"
get_token_info $WBTC "WBTC"
get_token_info $USDT "USDT"
get_token_info $USDC "USDC"
get_token_info $DAI "DAI"

echo ""
echo "============================================"
echo -e "${BLUE}3. 验证 7 个流动性池${NC}"
echo "============================================"

verify_pool $POOL_WBTC_USDT "WBTC/USDT" "2500"
verify_pool $POOL_WBTC_USDC "WBTC/USDC" "2500"
verify_pool $POOL_DAI_USDT "DAI/USDT" "100"
verify_pool $POOL_DAI_USDC "DAI/USDC" "100"
verify_pool $POOL_WBTC_WSRW "WBTC/WSRW" "2500"
verify_pool $POOL_WSRW_USDT "WSRW/USDT" "2500"
verify_pool $POOL_WSRW_USDC "WSRW/USDC" "2500"

echo ""
echo "============================================"
echo -e "${BLUE}4. 验证外围合约${NC}"
echo "============================================"

verify_periphery_contract $POSITION_MANAGER "NonfungiblePositionManager"
verify_periphery_contract $SWAP_ROUTER "SwapRouter"
verify_periphery_contract $QUOTER "Quoter"
verify_periphery_contract $QUOTER_V2 "QuoterV2"
verify_periphery_contract $TICK_LENS "TickLens"
verify_periphery_contract $SMART_ROUTER "SmartRouter"
verify_periphery_contract $MULTICALL3 "Multicall3"
check_contract_exists $PERMIT2 "Permit2"

echo ""
echo "============================================"
echo -e "${BLUE}5. 地址汇总${NC}"
echo "============================================"
echo ""
echo "| 类型 | 名称 | 地址 |"
echo "|------|------|------|"
echo "| 核心 | Factory | $FACTORY |"
echo "| 核心 | PoolDeployer | $POOL_DEPLOYER |"
echo "| 外围 | PositionManager | $POSITION_MANAGER |"
echo "| 外围 | SwapRouter | $SWAP_ROUTER |"
echo "| 外围 | SmartRouter | $SMART_ROUTER |"
echo "| 外围 | Quoter | $QUOTER |"
echo "| 外围 | QuoterV2 | $QUOTER_V2 |"
echo "| 外围 | TickLens | $TICK_LENS |"
echo "| 工具 | Multicall3 | $MULTICALL3 |"
echo "| 工具 | Permit2 | $PERMIT2 |"
echo "| 代币 | WSRW | $WSRW |"
echo "| 代币 | WBTC | $WBTC |"
echo "| 代币 | USDT | $USDT |"
echo "| 代币 | USDC | $USDC |"
echo "| 代币 | DAI | $DAI |"
echo "| 池子 | WBTC/USDT | $POOL_WBTC_USDT |"
echo "| 池子 | WBTC/USDC | $POOL_WBTC_USDC |"
echo "| 池子 | DAI/USDT | $POOL_DAI_USDT |"
echo "| 池子 | DAI/USDC | $POOL_DAI_USDC |"
echo "| 池子 | WBTC/WSRW | $POOL_WBTC_WSRW |"
echo "| 池子 | WSRW/USDT | $POOL_WSRW_USDT |"
echo "| 池子 | WSRW/USDC | $POOL_WSRW_USDC |"

echo ""
echo "============================================"
echo -e "${GREEN}验证完成!${NC}"
echo "============================================"

