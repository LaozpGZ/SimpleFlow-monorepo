[根目录](../../CLAUDE.md) > [packages](../) > **uikit**

---

# packages/uikit - UI 组件库

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/uikit` 是 PancakeSwap 的 UI 组件库，提供一套统一的、可复用的 React 组件。

**核心功能：**
- 基础 UI 组件（按钮、输入框、卡片等）
- 业务组件（Header、Footer、Menu 等）
- 主题系统（深色/浅色模式）
- Storybook 文档
- Vanilla Extract 样式

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/uikit",
  "version": "0.69.4",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### 启动命令

```bash
# 开发模式（构建组件）
pnpm --filter @pancakeswap/uikit dev

# Storybook
pnpm --filter @pancakeswap/uikit storybook

# 构建
pnpm --filter @pancakeswap/uikit build:uikit

# 构建 Storybook
pnpm --filter @pancakeswap/uikit build:storybook
```

---

## 对外接口

### 主要导出

```typescript
// 组件
export { Button } from './components/Button'
export { Card } from './components/Card'
export { Modal } from './widgets/Modal'
export { Menu } from './widgets/Menu'
export { Ifo } from './widgets/Ifo'
// ... 更多组件

// 样式
export './css/vars.css'
export './css/atoms'
export './css/responsiveStyle'

// 主题
export { darkColors, lightColors } from './theme'
```

### 核心组件分类

**基础组件**
- `Button` - 按钮
- `Input` - 输入框
- `Text` - 文本
- `Heading` - 标题
- `Card` - 卡片
- `Flex` - 弹性布局
- `Grid` - 网格布局

**表单组件**
- `TextField` - 文本字段
- `Select` - 下拉选择
- `Checkbox` - 复选框
- `Radio` - 单选框
- `Slider` - 滑块

**反馈组件**
- `Modal` - 模态框
- `Toast` - 提示
- `Spinner` - 加载动画
- `Progress` - 进度条

**业务组件**
- `Menu` - 导航菜单
- `Header` - 页头
- `Footer` - 页脚
- `Ifo` - IFO 组件
- `Profile` - 用户资料
- `Wallet` - 钱包连接

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/hooks": "workspace:*",
    "@pancakeswap/localization": "workspace:*",
    "@radix-ui/react-dismissable-layer": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.0",
    "@vanilla-extract/css": "^1.13.0",
    "@vanilla-extract/recipes": "^0.5.0",
    "@vanilla-extract/sprinkles": "^1.6.1",
    "bignumber.js": "^9.0.0",
    "clsx": "^1.2.1",
    "framer-motion": "10.16.4",
    "lodash": "^4.17.20",
    "react-popper": "^2.3.0",
    "sonner": "^1.2.4",
    "styled-system": "^5.1.5"
  }
}
```

---

## 数据模型

### 文件结构

```
packages/uikit/src/
├── components/           # 基础组件
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Text/
│   └── ...
├── widgets/              # 业务组件
│   ├── Modal/           # 模态框
│   ├── Menu/            # 导航菜单
│   ├── Ifo/             # IFO 组件
│   └── ...
├── theme/               # 主题配置
│   └── index.ts
├── css/                 # Vanilla Extract 样式
│   ├── vars.css.ts
│   ├── atoms.ts
│   └── responsiveStyle.ts
├── Providers.tsx        # 全局 Provider
└── index.ts             # 导出入口
```

### 主题系统

```typescript
// 主题颜色
export const lightColors = {
  primary: '#0099FA',
  success: '#53B453',
  danger: '#F94646',
  warning: '#FFAE00',
  // ... 更多颜色
}

export const darkColors = {
  primary: '#0099FA',
  success: '#53B453',
  danger: '#F94646',
  warning: '#FFAE00',
  // ... 更多颜色
}
```

---

## 测试与质量

### Storybook

- 可视化组件文档
- 交互式组件演示
- 主题切换演示

访问：`http://localhost:6006`

### 测试

```bash
# 运行测试
pnpm --filter @pancakeswap/uikit test

# 更新快照
pnpm --filter @pancakeswap/uikit update:snapshot
```

---

## 常见问题 (FAQ)

### Q: 如何使用 UI 组件？

A:
```typescript
import { Button, Card } from '@pancakeswap/uikit'

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">点击我</Button>
    </Card>
  )
}
```

### Q: 如何自定义主题？

A: 可以通过 styled-components 或 vanilla-extract 覆盖样式：

```typescript
import { Button } from '@pancakeswap/uikit'

const CustomButton = styled(Button)`
  background: custom-color;
`
```

### Q: 如何切换深色/浅色模式？

A: 使用 `next-themes`：

```typescript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      切换主题
    </button>
  )
}
```

---

## 相关文件清单

### 核心文件

- `src/index.ts` - 主入口
- `src/Providers.tsx` - 全局 Provider
- `src/theme/index.ts` - 主题配置

### 组件目录

- `src/components/` - 基础组件
- `src/widgets/` - 业务组件
- `src/css/` - 样式配置

---

*本模块文档由 AI 架构师生成。*
