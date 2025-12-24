[根目录](../../CLAUDE.md) > [packages](../) > **hooks**

---

# packages/hooks - 共享 React Hooks

> 最后更新：2025-12-24 19:30:00 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:30:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/hooks` 是 PancakeSwap 的共享 React Hooks 库，提供通用业务逻辑。

**核心功能：**
- 主题切换
- 倒计时
- 防抖/节流
- 间隔器
- Intersection Observer
- 主题检测
- 图片预加载
- 代币排序

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/hooks",
  "version": "0.0.46",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### 主入口

```typescript
// src/index.ts
export { default as usePreviousValue } from './usePreviousValue'
export { default as useLastUpdated } from './useLastUpdated'
export { default as useInterval } from './useInterval'
export { default as useIsWindowVisible } from './useIsWindowVisible'
export { default as useDebounce } from './useDebounce'
export { default as useHttpLocations } from './useHttpLocations'
export { default as useDebouncedChangeHandler } from './useDebouncedChangeHandler'
export * from './useIsMounted'
export { usePreloadImages } from './usePreloadImage'
export { default as useIntersectionObserver } from './useIntersectionObserver'
export { default as useDelayedUnmount } from './useDelayedUnmount'
export { default as useSortedTokensByQuery } from './useSortedTokensByQuery'
export { default as useTheme, COOKIE_THEME_KEY, THEME_DOMAIN } from './useTheme'
export { usePropsChanged } from './usePropsChanged'
export * from './useImageColor'
export * from './useCountdown'
```

---

## 核心 Hooks 详解

### 1. useTheme - 主题切换

**功能**：管理深色/浅色主题切换。

**核心代码**：

```typescript
import { useTheme as useNextTheme } from 'next-themes'
import Cookie from 'js-cookie'
import { useContext } from 'react'

export const COOKIE_THEME_KEY = 'theme'
export const THEME_DOMAIN = '.pancakeswap.finance'

const useTheme = () => {
  const { resolvedTheme, setTheme } = useNextTheme()
  const theme = useContext(StyledThemeContext)!

  const handleSwitchTheme = useCallback(
    (themeValue: 'light' | 'dark') => {
      try {
        setTheme(themeValue)
        // 同步到 Cookie（跨子域）
        Cookie.set(COOKIE_THEME_KEY, themeValue, {
          domain: THEME_DOMAIN
        })
      } catch (err) {
        // 忽略 Cookie 设置错误
      }
    },
    [setTheme],
  )

  return useMemo(
    () => ({
      isDark: resolvedTheme === 'dark',
      theme,
      setTheme: handleSwitchTheme
    }),
    [theme, resolvedTheme, handleSwitchTheme],
  )
}
```

**使用示例**：

```typescript
function ThemeToggle() {
  const { isDark, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
```

### 2. useDebounce - 防抖

**功能**：延迟执行函数，避免频繁触发。

**核心代码**：

```typescript
import { useState, useEffect } from 'react'

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**使用示例**：

```typescript
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    // 只有在停止输入 500ms 后才会执行搜索
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
```

### 3. useInterval - 间隔器

**功能**：定期执行函数。

**核心代码**：

```typescript
import { useEffect, useRef } from 'react'

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay])
}
```

**使用示例**：

```typescript
function Countdown() {
  const [seconds, setSeconds] = useState(0)

  useInterval(() => {
    setSeconds(s => s + 1)
  }, 1000)

  return <div>Seconds: {seconds}</div>
}
```

### 4. useLastUpdated - 最后更新时间

**功能**：跟踪数据最后更新时间，用于显示"多久前更新"。

**核心代码**：

```typescript
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)

export const useLastUpdated = (timestamp?: number) => {
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    if (timestamp) {
      const updated = dayjs.utc(timestamp).fromNow()
      setLastUpdated(updated)
    }
  }, [timestamp])

  return lastUpdated
}
```

**使用示例**：

```typescript
function LastUpdated({ blockTimestamp }) {
  const lastUpdated = useLastUpdated(blockTimestamp * 1000)

  return <span>Updated {lastUpdated}</span>
  // 显示: "Updated 2 minutes ago"
}
```

### 5. useIntersectionObserver - 可见性检测

**功能**：检测元素是否进入视口。

**核心代码**：

```typescript
import { useEffect, useState, useRef } from 'react'

export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting = useState(false)

  useEffect(() => {
    const node = elementRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])

  return isIntersecting
}
```

**使用示例**：

```typescript
function LazyImage({ src }) {
  const imgRef = useRef()
  const isVisible = useIntersectionObserver(imgRef, {
    threshold: 0.1
  })

  return (
    <div ref={imgRef}>
      {isVisible ? <img src={src} /> : <div>Loading...</div>}
    </div>
  )
}
```

### 6. useSortedTokensByQuery - 代币排序

**功能**：根据搜索词排序代币列表。

**核心代码**：

```typescript
import { useMemo } from 'react'
import { Token } from '@pancakeswap/sdk'

export const useSortedTokensByQuery = (
  tokens: Token[],
  searchQuery: string,
  isSortedByBalance?: boolean
) => {
  return useMemo(() => {
    if (!searchQuery) return tokens

    const searchQueryLower = searchQuery.toLowerCase()

    const filtered = tokens.filter(token => {
      const symbolMatch = token.symbol.toLowerCase().includes(searchQueryLower)
      const nameMatch = token.name.toLowerCase().includes(searchQueryLower)
      const addressMatch = token.address.toLowerCase().includes(searchQueryLower)

      return symbolMatch || nameMatch || addressMatch
    })

    return filtered.sort((a, b) => {
      // 优先匹配符号
      if (a.symbol.toLowerCase().startsWith(searchQueryLower) &&
          !b.symbol.toLowerCase().startsWith(searchQueryLower)) {
        return -1
      }
      return 1
    })
  }, [tokens, searchQuery, isSortedByBalance])
}
```

**使用示例**：

```typescript
function TokenList({ tokens }) {
  const [search, setSearch] = useState('')
  const sortedTokens = useSortedTokensByQuery(tokens, search)

  return (
    <>
      <input onChange={(e) => setSearch(e.target.value)} />
      {sortedTokens.map(token => (
        <div key={token.address}>{token.symbol}</div>
      ))}
    </>
  )
}
```

### 7. useCountdown - 倒计时

**功能**：倒计时到指定时间。

**使用示例**：

```typescript
function Countdown({ targetDate }) {
  const { seconds, minutes, hours, days } = useCountdown(targetDate)

  return (
    <div>
      {days}d {hours}h {minutes}m {seconds}s
    </div>
  )
}
```

---

## 复用模式和最佳实践

### 1. 依赖清理

```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000)

  // 清理副作用
  return () => clearInterval(timer)
}, [])
```

### 2. 条件执行

```typescript
useEffect(() => {
  if (!condition) return

  // 只有条件满足时才执行
  doSomething()
}, [condition])
```

### 3. 性能优化

```typescript
// 使用 useMemo 缓存计算结果
const value = useMemo(() => expensiveCalculation(a, b), [a, b])

// 使用 useCallback 缓存函数
const handler = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### 4. 类型安全

```typescript
// 使用泛型保持类型安全
function useDebounce<T>(value: T, delay: number): T {
  // ...
}
```

---

## 关键依赖

```typescript
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext
} from 'react'

import dayjs from 'dayjs'
import Cookie from 'js-cookie'

import { useTheme as useNextTheme } from 'next-themes'
import { ThemeContext as StyledThemeContext } from 'styled-components'
```

---

## 文件结构

```
packages/hooks/src/
├── useTheme.ts               # 主题切换 ⭐
├── useDebounce.ts            # 防抖 ⭐
├── useInterval.ts            # 间隔器 ⭐
├── useLastUpdated.ts         # 最后更新 ⭐
├── useIntersectionObserver.ts # 可见性检测 ⭐
├── useSortedTokensByQuery.ts # 代币排序 ⭐
├── useCountdown.ts           # 倒计时
├── useIsWindowVisible.ts     # 窗口可见性
├── useHttpLocations.ts       # HTTP 位置
├── useDebouncedChangeHandler.ts  # 防抖变更处理
├── useIsMounted.ts           # 组件挂载状态
├── usePreloadImage.ts        # 图片预加载
├── useDelayedUnmount.ts      # 延迟卸载
├── usePropsChanged.ts        # Props 变化检测
├── useImageColor/            # 图片颜色提取
└── index.ts                  # 主入口
```

---

## 测试策略

```bash
# Hooks 测试在各个应用中
# 例如 apps/web/src/hooks/__tests__/
```

---

## 常见问题 (FAQ)

### Q: 为什么使用 Cookie 保存主题？

A: 为了在跨子域时保持主题一致：
```typescript
Cookie.set('theme', 'dark', { domain: '.pancakeswap.finance' })
```

### Q: useDebounce 的延迟应该设置多少？

A: 根据场景：
- 搜索输入：300-500ms
- 按钮点击：100-200ms
- 窗口调整：200-300ms

### Q: useInterval 如何处理 null 延迟？

A: null 表示不启动间隔器：
```typescript
if (delay === null) return
```

### Q: 为什么使用 useRef 保存回调？

A: 避免回调变化时重新创建定时器：
```typescript
const savedCallback = useRef(callback)
useEffect(() => {
  savedCallback.current = callback
}, [callback])
```

---

## 相关文件清单

### 核心文件

- `src/useTheme.ts` - 主题切换 ⭐
- `src/useDebounce.ts` - 防抖 ⭐
- `src/useInterval.ts` - 间隔器 ⭐
- `src/useLastUpdated.ts` - 最后更新 ⭐
- `src/useIntersectionObserver.ts` - 可见性检测 ⭐
- `src/useSortedTokensByQuery.ts` - 代币排序 ⭐

---

## 特殊设计模式

### 1. 自定义 Hook 封装

将复杂逻辑封装成可复用的 Hook：
```typescript
const useFeature = () => {
  const [state, setState] = useState()
  // 复杂逻辑
  return { state, actions }
}
```

### 2. 组合 Hook

多个 Hook 组合使用：
```typescript
function useAdvancedFeature() {
  const theme = useTheme()
  const debouncedValue = useDebounce(value, 500)
  const isVisible = useIntersectionObserver(ref)
  // 组合逻辑
}
```

### 3. 工厂模式

根据条件返回不同的 Hook 实现：
```typescript
const useHook = (condition) => {
  return condition ? useHookA : useHookB
}
```

---

*本模块文档由 AI 架构师生成。*
