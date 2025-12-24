[根目录](../../../CLAUDE.md) > [packages](../../) > [uikit](../) > **src/widgets**

---

# packages/uikit/src/widgets - 业务组件

> 最后更新：2025-12-24 19:25:00 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:25:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`packages/uikit/src/widgets` 是 PancakeSwap 的业务组件库，包含高级业务逻辑的 UI 组件。

**核心功能：**
- Modal 模态框系统
- Menu 导航菜单
- IFO 组件
- 用户资料组件
- 钱包组件

---

## 文件结构

```
packages/uikit/src/widgets/
├── Modal/                       # 模态框系统 ⭐
│   ├── Modal.tsx                # 主模态框组件
│   ├── ModalV2.tsx              # V2 模态框
│   ├── ModalInput.tsx           # 模态框输入
│   ├── ModalContext.tsx         # 模态框上下文
│   ├── ModalActions.tsx         # 模态框操作按钮
│   ├── ModalWrapper.tsx         # 包装器
│   ├── MotionModal.tsx          # 动画模态框
│   ├── BottomDrawer/            # 底部抽屉（移动端）
│   │   ├── BottomDrawer.tsx
│   │   ├── styles.ts
│   │   └── index.stories.tsx
│   ├── NotEnoughTokensModal.tsx # 代币不足弹窗
│   ├── useModal.ts              # 模态框 Hook
│   ├── types.ts                 # 类型定义
│   ├── theme.ts                 # 主题配置
│   ├── styles.tsx               # 样式
│   └── index.tsx
├── Menu/                        # 导航菜单 ⭐
│   ├── Menu.tsx                 # 主菜单组件
│   ├── config.ts                # 菜单配置
│   ├── theme.ts                 # 菜单主题
│   ├── components/
│   │   ├── Logo.tsx             # Logo 组件
│   │   ├── UserMenu/            # 用户菜单
│   │   │   ├── index.tsx
│   │   │   ├── MenuIcon.tsx
│   │   │   ├── styles.tsx
│   │   │   └── types.ts
│   │   └── footerConfig.ts      # 页脚配置
│   └── index.stories.tsx
├── Ifo/                         # IFO 组件 ⭐
│   ├── components/
│   │   ├── IfoFoldableCard.tsx
│   │   ├── IfoCardV3Data.tsx
│   │   └── ...
│   └── ...
└── ...                          # 更多组件
```

---

## 核心组件详解

### 1. Modal 模态框系统

**主要组件**：`Modal/Modal.tsx`

**特性**：
- 桌面端居中显示
- 移动端底部抽屉
- 支持滑动手势关闭
- 支持 Android 和 Binance 钱包特殊处理
- 可自定义头部、主体、操作区

**核心代码**：

```typescript
const Modal: React.FC<ModalProps> = ({
  title,
  onDismiss,
  children,
  hideCloseButton = false,
  headerPadding = "12px 24px",
  bodyPadding = "24px",
  minWidth = "320px",
  minHeight = "300px",
  // ...
}) => {
  // 特殊平台检测
  const isAndroid = getIsAndroid()
  const isBinance = getIsBinance()

  return (
    <ModalWrapper
      minWidth={minWidth}
      minHeight={minHeight}
      onDismiss={onDismiss}
    >
      <ModalHeader>
        {onBack && <ModalBackButton onBack={onBack} />}
        <ModalTitle>{title}</ModalTitle>
        {!hideCloseButton && (
          <ModalCloseButton onDismiss={onDismiss} />
        )}
      </ModalHeader>

      <ModalBody padding={bodyPadding}>
        {children}
      </ModalBody>

      {/* 底部操作区（可选） */}
      {actions && (
        <ModalActions>
          {actions}
        </ModalActions>
      )}
    </ModalWrapper>
  )
}
```

**使用示例**：

```typescript
import { Modal } from '@pancakeswap/uikit'

<Modal
  title="确认交换"
  onDismiss={() => setShowModal(false)}
  headerPadding="16px"
  minWidth="400px"
>
  <p>确认交换 100 USDT 到 BNB？</p>
</Modal>
```

**关键 Hook**：

```typescript
// useModal - 简化模态框状态管理
const [showModal, setShowModal] = useModal()

// 简化使用
{showModal && (
  <Modal onDismiss={setShowModal.false}>
    内容
  </Modal>
)}
```

### 2. BottomDrawer 底部抽屉

**组件**：`Modal/BottomDrawer/BottomDrawer.tsx`

**特性**：
- 移动端专用
- 从底部滑出
- 支持手势关闭
- 自动适应屏幕高度

**核心代码**：

```typescript
const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  children,
  onDismiss,
  contentProps = {}
}) => {
  return (
    <Drawer
      drag="y"
      dragConstraints={{ top: 0, bottom: 600 }}
      dragElastic={{ top: 0 }}
      onDragEnd={(e, info) => {
        if (info.velocity.y > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) {
          onDismiss()
        }
      }}
    >
      <DrawerContent {...contentProps}>
        {children}
      </DrawerContent>
    </Drawer>
  )
}
```

### 3. Menu 导航菜单

**组件**：`Menu/Menu.tsx`

**特性**：
- 响应式设计
- 多级菜单
- 用户菜单集成
- Logo 和品牌展示
- 页脚链接

**核心结构**：

```typescript
const Menu: React.FC<MenuProps> = ({
  isDark,
  toggleTheme,
  currentLang,
  setLang,
  links,
  // ...
}) => {
  return (
    <MenuContainer>
      {/* Logo */}
      <Logo />

      {/* 导航链接 */}
      <MenuLinks>
        {links.map(link => (
          <MenuItem key={link.href} href={link.href}>
            {link.label}
          </MenuItem>
        ))}
      </MenuLinks>

      {/* 用户菜单 */}
      <UserMenu />

      {/* 设置 */}
      <Settings>
        <LanguageSelector />
        <ThemeToggle />
      </Settings>
    </MenuContainer>
  )
}
```

**配置文件**：`Menu/config.ts`

```typescript
export const MENU_LINKS = [
  {
    href: '/swap',
    label: 'Trade',
    items: [
      { href: '/swap', label: 'Swap' },
      { href: '/liquidity', label: 'Liquidity' },
    ]
  },
  {
    href: '/farms',
    label: 'Earn',
    items: [
      { href: '/farms', label: 'Farms' },
      { href: '/pools', label: 'Pools' },
    ]
  },
  // ...
]
```

### 4. IFO 组件

**组件**：`Ifo/components/`

**特性**：
- IFO 卡片展示
- IFO 数据显示
- 质买界面
- IFO 历史记录

**关键组件**：
- `IfoFoldableCard` - 可折叠的 IFO 卡片
- `IfoCardV3Data` - V3 IFO 数据展示
- `IfoVesting` - IFO 释放信息

---

## 通用模式

### 1. Context 模式

```typescript
// ModalContext
const ModalV2Context = createContext<ModalContextValue | null>(null)

export const ModalV2Provider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ModalV2Context.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ModalV2Context.Provider>
  )
}
```

### 2. 复合组件模式

```typescript
// Modal 作为复合组件
<Modal>
  <Modal.Header>标题</Modal.Header>
  <Modal.Body>内容</Modal.Body>
  <Modal.Footer>
    <Button>取消</Button>
    <Button>确认</Button>
  </Modal.Footer>
</Modal>
```

### 3. Props 组合模式

```typescript
// 允许多种 props 组合
type ModalProps =
  | { title: string; onBack?: never }
  | { title?: never; onBack: () => void }

// 或使用可选链
<Modal
  title="标题"
  headerBackground="gradient"
  bodyPadding="16px"
  minWidth="400px"
/>
```

---

## 关键依赖

### 内部依赖

```typescript
// 基础组件
import { Button } from '../components/Button'
import { Box } from '../components/Box'
import { Heading } from '../components/Heading'

// Hooks
import { useMatchBreakpoints } from '../contexts'
import { useTheme } from 'styled-components'

// 工具
import getThemeValue from '../util/getThemeValue'
```

### 外部依赖

```typescript
import framerMotion from 'framer-motion'  // 动画
import { Popper } from 'react-popper'      // 定位
```

---

## Storybook 文档

**访问地址**：`http://localhost:6006`

**运行命令**：

```bash
pnpm --filter @pancakeswap/uikit storybook
```

**组件示例**：

```typescript
// Modal.stories.tsx
export default {
  title: 'Widgets/Modal',
  component: Modal,
} as ComponentMeta<typeof Modal>

export const Default: ComponentStoryObj<typeof Modal> = {
  args: {
    title: '模态框标题',
    children: '模态框内容',
  },
}

export const WithActions: ComponentStoryObj<typeof Modal> = {
  args: {
    title: '确认操作',
    children: '确认要执行此操作吗？',
    actions: (
      <>
        <Button variant="secondary">取消</Button>
        <Button variant="primary">确认</Button>
      </>
    ),
  },
}
```

---

## 常见问题 (FAQ)

### Q: 如何自定义模态框样式？

A: 可以通过 props 或 styled-components：

```typescript
// 方式 1：Props
<Modal
  headerBackground="gradient"
  headerPadding="16px"
  bodyPadding="24px"
  minWidth="500px"
/>

// 方式 2：styled-components
const CustomModal = styled(Modal)`
  .modal-header {
    background: linear-gradient(...);
  }
`
```

### Q: 如何实现嵌套模态框？

A: 使用 Context 管理：

```typescript
const NestedModal = () => {
  const [parentOpen, setParentOpen] = useState(true)
  const [childOpen, setChildOpen] = useState(false)

  return (
    <>
      <Modal isOpen={parentOpen} onDismiss={() => setParentOpen(false)}>
        <Button onClick={() => setChildOpen(true)}>打开子模态框</Button>
        {childOpen && (
          <Modal onDismiss={() => setChildOpen(false)}>
            子模态框
          </Modal>
        )}
      </Modal>
    </>
  )
}
```

### Q: 如何处理移动端和桌面端的差异？

A: 使用 `useMatchBreakpoints`：

```typescript
const MyComponent = () => {
  const { isMobile, isTablet } = useMatchBreakpoints()

  if (isMobile) {
    return <BottomDrawer>...</BottomDrawer>
  }

  return <Modal>...</Modal>
}
```

---

## 相关文件清单

### Modal 组件

- `Modal/Modal.tsx` - 主模态框组件 ⭐
- `Modal/ModalV2.tsx` - V2 版本
- `Modal/BottomDrawer/` - 底部抽屉 ⭐
- `Modal/useModal.ts` - Hook
- `Modal/types.ts` - 类型定义

### Menu 组件

- `Menu/Menu.tsx` - 主菜单 ⭐
- `Menu/config.ts` - 菜单配置
- `Menu/components/UserMenu/` - 用户菜单 ⭐

### IFO 组件

- `Ifo/components/IfoFoldableCard.tsx` - IFO 卡片 ⭐

---

## 特殊设计模式

### 1. 插槽模式

```typescript
interface ModalProps {
  headerRightSlot?: ReactNode
  footerLeftSlot?: ReactNode
}

<Modal
  headerRightSlot={<Badge>NEW</Badge>}
  footerLeftSlot={<Text>Info</Text>}
/>
```

### 2. 渐进增强

```typescript
// 基础功能
<Modal>基础内容</Modal>

// 增强功能
<Modal
  onDismiss={handleClose}
  headerBackground="gradient"
  drag={true}
>
  增强内容
</Modal>
```

### 3. 组合优于继承

```typescript
// 组合多个小组件
const IfoCard = () => (
  <Card>
    <IfoHeader />
    <IfoData />
    <IfoProgress />
    <IfoActions />
  </Card>
)
```

---

*本模块文档由 AI 架构师生成，包含业务组件详解。*
