[根目录](../../CLAUDE.md) > [packages](../) > **uikit**

# UI Kit - 组件库

> **包类型**: UI库 | **功能**: 共享组件库 | **状态**: 生产就绪
> **入口文件**: `src/index.ts` | **包依赖**: 33个 | **Storybook**: 端口6006

## 模块职责

UI Kit是PancakeSwap的共享组件库，提供：
- **设计系统**: 统一的视觉设计和交互规范
- **基础组件**: 按钮、输入框、模态框等基础UI组件
- **业务组件**: 交易、钱包、图表等业务特定组件
- **主题系统**: 支持暗色/亮色主题切换
- **响应式设计**: 适配桌面和移动端
- **可访问性**: 遵循WCAG标准，支持键盘导航

## 入口与启动

### 技术架构
```
packages/uikit/
├── src/
│   ├── components/          # 组件实现
│   │   ├── Button/         # 按钮组件
│   │   ├── Input/          # 输入框组件
│   │   ├── Modal/          # 模态框组件
│   │   └── ...             # 其他组件
│   ├── css/                # CSS-in-JS样式
│   ├── theme/              # 主题配置
│   ├── hooks/              # React Hooks
│   ├── utils/              # 工具函数
│   └── widgets/            # 业务组件
├── .storybook/             # Storybook配置
├── stories/                # 组件故事
├── dist/                   # 构建输出
└── package.json            # 包配置
```

### 核心入口文件
- **`src/index.ts`**: 主入口，导出所有组件和工具
- **`src/theme/index.ts`**: 主题系统配置
- **`src/css/atoms.ts`**: CSS原子类定义
- **`.storybook/main.ts`**: Storybook配置

### 组件导出结构
```typescript
// 主要导出
export { ResetCSS, GlobalStyle } from './theme/global'
export { useTheme } from './theme/useTheme'

// 基础组件
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'
export { default as Modal } from './components/Modal'
export { default as Card } from './components/Card'

// 布局组件
export { default as Flex } from './components/Box/Flex'
export { default as Grid } from './components/Box/Grid'

// 业务组件
export { default as SwapWidget } from './widgets/SwapWidget'
export { default as FarmCard } from './widgets/FarmCard'
```

## 对外接口

### 组件API设计模式
```typescript
// 通用组件Props接口
interface BaseProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

// 按钮组件示例
interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onClick?: (event: MouseEvent) => void
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  // 组件实现
}
```

### 主题系统接口
```typescript
interface Theme {
  colors: {
    primary: ColorScale
    secondary: ColorScale
    success: ColorScale
    danger: ColorScale
    warning: ColorScale
    text: ColorScale
    background: ColorScale
  }
  fonts: {
    primary: string
    secondary: string
    mono: string
  }
  spacings: SpacingScale
  shadows: ShadowScale
  radii: RadiusScale
}

// 主题上下文
const ThemeContext = createContext<Theme>(defaultTheme)

export const ThemeProvider: React.FC<{
  theme: Partial<Theme>
  children: React.ReactNode
}> = ({ theme, children }) => {
  // 主题提供逻辑
}

export const useTheme = (): Theme => {
  return useContext(ThemeContext)
}
```

### 组件变体系统
```typescript
// 使用Vanilla Extract的变体系统
import { recipe } from '@vanilla-extract/recipes'

const buttonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: 'var(--colors-primary)',
        color: 'var(--colors-white)',
        ':hover': {
          backgroundColor: 'var(--colors-primary-hover)',
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: 'var(--colors-primary)',
        border: '2px solid var(--colors-primary)',
      },
    },
    size: {
      sm: {
        fontSize: '14px',
        padding: '8px 16px',
        height: '32px',
      },
      md: {
        fontSize: '16px',
        padding: '12px 24px',
        height: '40px',
      },
      lg: {
        fontSize: '18px',
        padding: '16px 32px',
        height: '48px',
      },
    },
  },
})
```

## 关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "@vanilla-extract/css": "^1.13.0",
    "@vanilla-extract/recipes": "^0.5.0",
    "@vanilla-extract/sprinkles": "^1.6.1",
    "styled-components": "6.0.7",
    "framer-motion": "10.16.4",
    "@radix-ui/react-slot": "^1.0.0",
    "@popperjs/core": "^2.9.2",
    "react-popper": "^2.3.0",
    "clsx": "^1.2.1"
  },
  "devDependencies": {
    "storybook": "^7.0.7",
    "@storybook/react": "^7.0.7",
    "vite": "5.0.12",
    "@vanilla-extract/vite-plugin": "^3.8.0"
  }
}
```

### Storybook配置
```typescript
// .storybook/main.ts
export default {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    buildStoriesJson: true,
  },
}
```

### 构建配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@pancakeswap/uikit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

## 数据模型

### 组件状态模型
```typescript
// 通用组件状态
interface ComponentState {
  isHovered: boolean
  isFocused: boolean
  isDisabled: boolean
  isLoading: boolean
  hasError: boolean
}

// 表单状态
interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

// 模态框状态
interface ModalState {
  isOpen: boolean
  isClosing: boolean
  content: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### 样式变量模型
```typescript
// 颜色系统
interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string  // 主色
  600: string
  700: string
  800: string
  900: string
}

// 间距系统
interface SpacingScale {
  0: '0'
  1: '4px'
  2: '8px'
  3: '12px'
  4: '16px'
  5: '20px'
  6: '24px'
  8: '32px'
  10: '40px'
  12: '48px'
  16: '64px'
  20: '80px'
  24: '96px'
}
```

### 组件变体定义
```typescript
// 组件变体配置
const buttonVariants = {
  variant: {
    primary: ['bg-primary', 'text-white', 'border-primary'],
    secondary: ['bg-transparent', 'text-primary', 'border-primary'],
    tertiary: ['bg-gray-100', 'text-gray-700', 'border-transparent'],
    danger: ['bg-danger', 'text-white', 'border-danger'],
  },
  size: {
    sm: ['py-2', 'px-4', 'text-sm'],
    md: ['py-3', 'px-6', 'text-base'],
    lg: ['py-4', 'px-8', 'text-lg'],
  },
}
```

## 测试与质量

### 组件测试模式
```typescript
// 组件单元测试
describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies variant styles correctly', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveStyle({
      backgroundColor: 'var(--colors-danger)',
    })
  })
})
```

### 视觉回归测试
```typescript
// Storybook视觉测试
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export const Default = {
  args: {
    children: 'Button',
  },
}

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}
```

### 可访问性测试
```typescript
// A11y测试配置
test('should be keyboard accessible', () => {
  render(<Button>Accessible button</Button>)
  const button = screen.getByRole('button')

  expect(button).toHaveAttribute('tabIndex', '0')

  fireEvent.keyDown(button, { key: 'Enter' })
  // 测试键盘交互
})

test('should have proper ARIA labels', () => {
  render(<Button aria-label="Close dialog">X</Button>)
  const button = screen.getByRole('button')

  expect(button).toHaveAttribute('aria-label', 'Close dialog')
})
```

### 质量保证工具
```json
{
  "scripts": {
    "build:uikit": "vite build",
    "dev": "vite build --watch --mode development",
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build",
    "test": "vitest --run",
    "test:visual": "chromatic --project-token=xxx",
    "lint": "eslint 'src/**/*.{js,jsx,ts,tsx}'"
  }
}
```

## 设计系统

### 颜色系统
```css
:root {
  /* 主色调 */
  --colors-primary-50: #f0f9ff;
  --colors-primary-500: #3b82f6;
  --colors-primary-900: #1e3a8a;

  /* 语义化颜色 */
  --colors-success-500: #10b981;
  --colors-warning-500: #f59e0b;
  --colors-danger-500: #ef4444;

  /* 中性色 */
  --colors-gray-50: #f9fafb;
  --colors-gray-500: #6b7280;
  --colors-gray-900: #111827;
}
```

### 字体系统
```css
:root {
  /* 字体族 */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Roboto', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  /* 字体大小 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
}
```

### 组件规范
```typescript
// 组件命名规范
export const Button = () => {}        // PascalCase
export const useButton = () => {}     // use前缀
export const buttonVariants = {}      // camelCase

// 文件结构规范
components/
├── Button/
│   ├── index.ts          # 导出
│   ├── Button.tsx        # 主组件
│   ├── Button.test.tsx   # 测试
│   ├── Button.stories.ts # Storybook
│   └── styles.ts         # 样式
```

## 常见问题 (FAQ)

### Q1: 如何创建新组件？
**A**: 使用组件模板，遵循设计系统规范，编写测试和Storybook文档。

### Q2: 如何自定义主题？
**A**: 通过ThemeProvider传递自定义主题配置，或使用CSS变量覆盖默认样式。

### Q3: 如何优化组件性能？
**A**: 使用React.memo、useMemo、useCallback，避免不必要的重渲染。

### Q4: 如何处理暗色模式？
**A**: 使用useTheme hook，基于CSS变量实现主题切换。

### Q5: 如何确保可访问性？
**A**: 遵循WCAG标准，使用语义化HTML，添加ARIA属性，测试键盘导航。

## 相关文件清单

### 核心组件
- `src/components/Button/Button.tsx` - 按钮组件
- `src/components/Input/Input.tsx` - 输入框组件
- `src/components/Modal/Modal.tsx` - 模态框组件
- `src/components/Card/Card.tsx` - 卡片组件

### 布局组件
- `src/components/Box/Flex.tsx` - Flex布局
- `src/components/Box/Grid.tsx` - Grid布局
- `src/components/Container/Container.tsx` - 容器组件

### 业务组件
- `src/widgets/SwapWidget/SwapWidget.tsx` - 交易组件
- `src/widgets/FarmCard/FarmCard.tsx` - 挖矿卡片
- `src/widgets/PoolCard/PoolCard.tsx` - 流动性池卡片

### 样式系统
- `src/theme/index.ts` - 主题配置
- `src/css/atoms.ts` - 原子CSS
- `src/css/vars.css.ts` - CSS变量

### Storybook
- `stories/Button.stories.ts` - 按钮故事
- `stories/Modal.stories.ts` - 模态框故事
- `.storybook/main.ts` - Storybook配置

### 测试文件
- `src/components/Button/Button.test.tsx` - 组件测试
- `src/utils/test-utils.tsx` - 测试工具

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理组件库架构和设计系统
- **分析状态**: 组件结构已识别，需深入设计规范和组件细节
- **下一步**: 建议分析核心组件实现和Storybook配置

---

> 🎨 **设计原则**: 保持一致性、可访问性和可维护性，优先考虑用户体验。