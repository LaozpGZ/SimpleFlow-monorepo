#!/bin/bash
# 品牌名替换验证脚本
# 用法: ./scripts/verify-brand-replacement.sh

set -e

echo "=========================================="
echo "  SimpleFlow 品牌替换验证脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 切换到项目根目录
cd "$(dirname "$0")/.."

echo "=== 1. 域名检查 ==="

# 检查旧域名残留 (排除包名引用 @pancakeswap/)
PANCAKE_COM=$(grep -r "pancakeswap\.com" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "@pancakeswap" | wc -l | tr -d ' ')
PANCAKE_FINANCE=$(grep -r "pancakeswap\.finance" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "@pancakeswap" | wc -l | tr -d ' ')

if [ "$PANCAKE_COM" -eq 0 ]; then
  echo -e "${GREEN}✅ pancakeswap.com: 0 处${NC}"
else
  echo -e "${RED}❌ pancakeswap.com: $PANCAKE_COM 处残留${NC}"
fi

if [ "$PANCAKE_FINANCE" -eq 0 ]; then
  echo -e "${GREEN}✅ pancakeswap.finance: 0 处${NC}"
else
  echo -e "${RED}❌ pancakeswap.finance: $PANCAKE_FINANCE 处残留${NC}"
fi

# 检查新域名
SIMPLEFLOW_FINANCE=$(grep -r "simpleflow\.finance" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ simpleflow.finance: $SIMPLEFLOW_FINANCE 处${NC}"

echo ""
echo "=== 2. 品牌名检查 ==="

# 检查 PancakeSwap 残留 (排除包名引用 @pancakeswap/)
PANCAKESWAP_COUNT=$(grep -r "PancakeSwap" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "@pancakeswap" | wc -l | tr -d ' ')
SIMPLEFLOW_COUNT=$(grep -r "SimpleFlow" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')

# 单独统计包名引用 (Phase 6)
PACKAGE_REF_COUNT=$(grep -r "@pancakeswap" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')

if [ "$PANCAKESWAP_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ PancakeSwap (品牌名): 0 处${NC}"
else
  echo -e "${YELLOW}⚠️  PancakeSwap (品牌名): $PANCAKESWAP_COUNT 处残留${NC}"
fi

echo -e "   SimpleFlow: $SIMPLEFLOW_COUNT 处"
echo -e "   @pancakeswap/* (包名, Phase 6): $PACKAGE_REF_COUNT 处"

echo ""
echo "=== 3. 关键文件检查 ==="

# meta.ts
if [ -f "apps/web/src/config/constants/meta.ts" ]; then
  if grep -q "PancakeSwap" apps/web/src/config/constants/meta.ts 2>/dev/null; then
    echo -e "${RED}❌ meta.ts: 仍包含 PancakeSwap${NC}"
  else
    echo -e "${GREEN}✅ meta.ts: 已更新${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  meta.ts: 文件不存在${NC}"
fi

# manifest.json
if [ -f "apps/web/public/manifest.json" ]; then
  if grep -q "PancakeSwap" apps/web/public/manifest.json 2>/dev/null; then
    echo -e "${RED}❌ manifest.json: 仍包含 PancakeSwap${NC}"
  else
    echo -e "${GREEN}✅ manifest.json: 已更新${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  manifest.json: 文件不存在${NC}"
fi

# endpoints.ts
if [ -f "apps/web/src/config/constants/endpoints.ts" ]; then
  if grep -q "pancakeswap" apps/web/src/config/constants/endpoints.ts 2>/dev/null; then
    echo -e "${RED}❌ endpoints.ts: 仍包含 pancakeswap 域名${NC}"
  else
    echo -e "${GREEN}✅ endpoints.ts: 已更新${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  endpoints.ts: 文件不存在${NC}"
fi

echo ""
echo "=== 4. 国际化文案检查 ==="

for locale in "en-US" "zh-CN" "zh-TW"; do
  if [ -f "locales/${locale}.json" ]; then
    LOCALE_COUNT=$(grep -c "PancakeSwap" "locales/${locale}.json" 2>/dev/null || echo "0")
    if [ "$LOCALE_COUNT" -eq 0 ]; then
      echo -e "${GREEN}✅ ${locale}.json: 已更新${NC}"
    else
      echo -e "${YELLOW}⚠️  ${locale}.json: $LOCALE_COUNT 处 PancakeSwap 残留${NC}"
    fi
  fi
done

echo ""
echo "=== 5. Token List 文件检查 ==="

# 检查旧文件名
if [ -f "apps/web/src/config/constants/tokenLists/pancake-default.tokenlist.json" ]; then
  echo -e "${YELLOW}⚠️  pancake-default.tokenlist.json 仍存在 (应重命名)${NC}"
else
  echo -e "${GREEN}✅ pancake-default.tokenlist.json 已重命名${NC}"
fi

echo ""
echo "=========================================="
echo "  验证完成"
echo "=========================================="

# 总结
TOTAL_ISSUES=$((PANCAKE_COM + PANCAKE_FINANCE))

if [ "$TOTAL_ISSUES" -eq 0 ] && [ "$PANCAKESWAP_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ 所有品牌替换已完成!${NC}"
  exit 0
elif [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  域名已替换，但仍有 $PANCAKESWAP_COUNT 处 PancakeSwap 需要处理${NC}"
  exit 0
else
  echo -e "${RED}❌ 仍有域名或品牌名需要替换${NC}"
  exit 1
fi
