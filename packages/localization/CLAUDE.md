[根目录](../../CLAUDE.md) > [packages](../) > **localization**

---

# packages/localization - 国际化库

> 最后更新：2025-12-24 19:30:00 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:30:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/localization` 是 PancakeSwap 的国际化（i18n）库，支持多语言翻译。

**核心功能：**
- 多语言支持（26 种语言）
- 翻译管理
- 语言切换
- LRU 缓存优化
- 动态翻译包加载

**支持的语言**：
阿拉伯语、孟加拉语、英语、德语、希腊语、西班牙语、芬兰语、菲律宾语、法语、印地语、匈牙利语、印尼语、日语、韩语、荷兰语、波兰语、葡萄牙语（巴西/葡萄牙）、罗马尼亚语、俄语、瑞典语、泰米尔语、乌克兰语、越南语、简体中文、繁体中文

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/localization",
  "version": "6.2.0",
  "main": "./src/index.tsx",
  "types": "./src/index.tsx"
}
```

### 主入口

```typescript
// src/index.tsx
export { default as LanguageProvider } from './Provider'
export { default as useTranslation } from './useTranslation'
export type { TranslateFunction, ContextApi, Language } from './types'
export { default as languageList } from './config/languages'
export * from './helpers'
export { Trans } from './Trans'
```

---

## 核心模块

### 1. 语言提供者 (Provider.tsx)

**核心功能**：提供全局翻译上下文。

**关键代码**：

```typescript
export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // 1. 获取本地化包
  const { lang, bundle, ver, refresh, isFetching } = useLocaleBundle()

  // 2. 同步语言
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang)
  }

  // 3. 设置语言
  const setLanguage = useCallback(
    async (language: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, language.locale)
      }
      await i18n.changeLanguage(language.locale)
      refresh()
    },
    [refresh],
  )

  // 4. 翻译函数（带缓存）
  const translate: TranslateFunction = useCallback(
    (key, data) => {
      if (isFetching) return ''

      // LRU 缓存
      const cacheKey = data
        ? `${lang}:${ver}:${key}-${JSON.stringify(data)}`
        : undefined

      if (cacheKey && cache.has(cacheKey)) {
        return cache.get(cacheKey) || ''
      }

      // 获取翻译
      const value = bundle[key] || extendEnList[key] || key

      // 插值替换
      if (cacheKey) {
        const interpolated = value.replace(/%([a-zA-Z0-9-_]+)%/g, (match, p1) => {
          const replacement = data?.[p1]
          return replacement === undefined ? match : String(replacement)
        })
        cache.set(cacheKey, interpolated)
        return interpolated
      }

      return value
    },
    [bundle, lang, ver, isFetching],
  )

  return (
    <I18nextProvider i18n={i18n} key={ver}>
      <LanguageContext.Provider value={{ currentLanguage, setLanguage, t: translate, isFetching }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  )
}
```

### 2. 语言配置 (config/languages.ts)

**支持的语言**：

```typescript
export const languages: Record<string, Language> = {
  'ar-SA': { locale: 'ar-SA', language: 'العربية', code: 'ar' },
  'bn-BD': { locale: 'bn-BD', language: 'বাংলা', code: 'bn' },
  'en-US': { locale: 'en-US', language: 'English', code: 'en' },
  'de-DE': { locale: 'de-DE', language: 'Deutsch', code: 'de' },
  'el-GR': { locale: 'el-GR', language: 'Ελληνικά', code: 'el' },
  'es-ES': { locale: 'es-ES', language: 'Español', code: 'es-ES' },
  'fi-FI': { locale: 'fi-FI', language: 'Suomalainen', code: 'fi' },
  'fil-PH': { locale: 'fil-PH', language: 'Filipino', code: 'fil' },
  'fr-FR': { locale: 'fr-FR', language: 'Français', code: 'fr' },
  'hi-IN': { locale: 'hi-IN', language: 'हिंदी', code: 'hi' },
  'hu-HU': { locale: 'hu-HU', language: 'Magyar', code: 'hu' },
  'id-ID': { locale: 'id-ID', language: 'Bahasa Indonesia', code: 'id' },
  'ja-JP': { locale: 'ja-JP', language: '日本語', code: 'ja' },
  'ko-KR': { locale: 'ko-KR', language: '한국어', code: 'ko' },
  'nl-NL': { locale: 'nl-NL', language: 'Nederlands', code: 'nl' },
  'pl-PL': { locale: 'pl-PL', language: 'Polski', code: 'pl' },
  'pt-BR': { locale: 'pt-BR', language: 'Português (Brazil)', code: 'pt-br' },
  'pt-PT': { locale: 'pt-PT', language: 'Português', code: 'pt-pt' },
  'ro-RO': { locale: 'ro-RO', language: 'Română', code: 'ro' },
  'ru-RU': { locale: 'ru-RU', language: 'Русский', code: 'ru' },
  'sv-SE': { locale: 'sv-SE', language: 'Svenska', code: 'sv' },
  'ta-IN': { locale: 'ta-IN', language: 'தமிழ்', code: 'ta' },
  'uk-UA': { locale: 'uk-UA', language: 'Українська', code: 'uk' },
  'vi-VN': { locale: 'vi-VN', language: 'Tiếng Việt', code: 'vi' },
  'zh-CN': { locale: 'zh-CN', language: '简体中文', code: 'zh-cn' },
  'zh-TW': { locale: 'zh-TW', language: '繁體中文', code: 'zh-tw' },
}
```

### 3. 翻译 Hook (useTranslation.ts)

**使用方式**：

```typescript
import { useTranslation } from '@pancakeswap/localization'

function MyComponent() {
  const { t, currentLanguage, setLanguage, isFetching } = useTranslation()

  return (
    <div>
      <p>{t('Swap')}</p>
      <p>{t('Connect Wallet')}</p>
      <p>{t('Welcome to PancakeSwap', { name: 'User' })}</p>
    </div>
  )
}
```

### 4. Trans 组件 (Trans.tsx)

**用于包含 HTML 的翻译**：

```typescript
<Trans
  i18nKey="This is %bold% text"
  values={{
    bold: <strong>bold</strong>
  }}
/>
```

---

## 翻译管理机制

### 1. 翻译文件结构

```
locales/
├── en-US.json          # 英语（默认）
├── zh-CN.json          # 简体中文
├── ja-JP.json          # 日语
└── ...
```

### 2. 翻译键规范

```typescript
// 扁平化结构
{
  "Swap": "Swap",
  "Connect Wallet": "Connect Wallet",
  "Liquidity": "Liquidity",
  "Farms": "Farms",
  // ...
}

// 使用插值
{
  "Welcome %name%": "Welcome %name%",
  "Balance: %amount% %symbol%": "Balance: %amount% %symbol%"
}
```

### 3. 动态加载

```typescript
// hooks/useLocaleBundle.ts
export const useLocaleBundle = () => {
  const [bundle, setBundle] = useState<Record<string, string>>({})
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const load = async () => {
      const locale = getLocale()
      const url = `/locales/${locale}.json`
      const data = await fetch(url).then(r => r.json())
      setBundle(data)
      setIsFetching(false)
    }
    load()
  }, [lang])

  return { bundle, isFetching }
}
```

---

## LRU 缓存优化

**核心代码**：

```typescript
// lru.ts
export class LRU<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined

    // 移到最后（最近使用）
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }
}
```

**缓存键**：

```typescript
// 语言 + 版本 + 翻译键 + 参数
const cacheKey = `${lang}:${ver}:${key}-${JSON.stringify(data)}`

// 例如: "zh-CN:12345:Welcome-{"name":"User"}"
```

---

## 关键依赖

```typescript
import { I18nextProvider } from 'react-i18next'
import i18n from 'react-i18next'
import React, { createContext, useCallback, useEffect, useMemo } from 'react'
import lodash from 'lodash'
```

---

## 文件结构

```
packages/localization/src/
├── Provider.tsx              # 语言提供者 ⭐
├── useTranslation.ts         # 翻译 Hook
├── Trans.tsx                 # Trans 组件
├── i18n.ts                   # i18next 配置
├── types.ts                  # 类型定义
├── helpers.ts                # 工具函数
├── lru.ts                    # LRU 缓存
├── config/
│   ├── languages.ts          # 语言配置 ⭐
│   └── extendList.ts         # 扩展翻译列表
└── hooks/
    ├── useLocaleBundle.ts    # 动态加载翻译包
    ├── useLastUpdated.ts     # 最后更新时间
    └── usePreviousValue.ts   # 上一个值
```

---

## 测试策略

```bash
# 翻译测试
pnpm test:translations
```

---

## 常见问题 (FAQ)

### Q: 如何添加新语言？

A:
1. 在 `config/languages.ts` 添加语言配置
2. 创建 `locales/xx-XX.json` 翻译文件
3. 在语言选择器中添加选项

### Q: 翻译键如何组织？

A:
- 使用扁平化结构（避免嵌套）
- 使用 `%key%` 进行插值
- 遵循命名规范：大写开头，驼峰分隔

### Q: 如何处理缺失翻译？

A:
```typescript
// 降级策略
const value = bundle[key] || extendEnList[key] || key
// 1. 当前语言
// 2. 扩展英语列表
// 3. 翻译键本身（兜底）
```

### Q: LRU 缓存大小是多少？

A: 默认为 1000，可根据需要调整：

```typescript
const cache = new LRU<string, string>(1000)
```

---

## 相关文件清单

### 核心文件

- `src/Provider.tsx` - 语言提供者 ⭐
- `src/config/languages.ts` - 语言配置 ⭐
- `src/useTranslation.ts` - 翻译 Hook
- `src/lru.ts` - LRU 缓存

---

## 特殊设计模式

### 1. Context + Provider 模式

```typescript
<LanguageProvider>
  {children => <App />}
</LanguageProvider>
```

### 2. 动态导入

```typescript
// 按需加载翻译文件
const loadLocale = async (locale: string) => {
  const { default: messages } = await import(`/locales/${locale}.json`)
  addResource(locale, messages)
}
```

### 3. 缓存优先策略

```typescript
// 先查缓存，缓存未命中再计算
if (cache.has(key)) {
  return cache.get(key)
}
const value = compute(key)
cache.set(key, value)
return value
```

---

*本模块文档由 AI 架构师生成。*
