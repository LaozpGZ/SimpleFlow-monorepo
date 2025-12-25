# Firebase 社交登录功能禁用报告

**日期**: 2025-12-25  
**状态**: ✅ 已禁用

---

## 概述

Firebase 在本项目中用于社交账号登录认证（Google、X/Twitter、Discord、Telegram），作为 Privy 钱包系统的补充认证层。现已添加环境变量开关，可临时禁用此功能。

---

## 修改内容

### 1. 添加环境变量开关

**文件**: `apps/web/src/wallet/Privy/constants.ts`

```diff
- export const firebaseApp = initializeApp(firebaseConfig)
+ export const firebaseApp: FirebaseApp | undefined =
+   process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'false' ? undefined : initializeApp(firebaseConfig)
```

**效果**: 当 `NEXT_PUBLIC_FIREBASE_ENABLED=false` 时，Firebase SDK 不会初始化。

---

### 2. Provider 提前返回

**文件**: `apps/web/src/wallet/Privy/firebase.tsx`

```diff
  export function FirebaseAuthProvider({ children }: AuthProviderProps) {
+   // Skip Firebase initialization if disabled
+   if (process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'false') {
+     return <>{children}</>
+   }
    // ... rest of the component
  }
```

**效果**: 当禁用时，`FirebaseAuthProvider` 直接渲染子组件，不执行任何 Firebase 相关逻辑。

---

### 3. 环境变量示例更新

**文件**: `apps/web/.env.example`

```bash
# Firebase social login (set to 'false' to disable)
NEXT_PUBLIC_FIREBASE_ENABLED=true
```

---

## 如何禁用

在 `apps/web/.env` 中添加：

```bash
NEXT_PUBLIC_FIREBASE_ENABLED=false
```

然后重启开发服务器。

---

## 如何重新启用

将环境变量改为 `true` 或删除该行：

```bash
NEXT_PUBLIC_FIREBASE_ENABLED=true
```

---

## 禁用后的影响

| 功能 | 状态 |
|------|------|
| Google 登录 | ❌ 不可用 |
| X (Twitter) 登录 | ❌ 不可用 |
| Discord 登录 | ❌ 不可用 |
| Telegram 登录 | ❌ 不可用 |
| 钱包连接 (MetaMask 等) | ✅ 正常 |
| Privy 其他功能 | ✅ 正常 |

---

## 验证方式

1. 设置 `NEXT_PUBLIC_FIREBASE_ENABLED=false`
2. 重启开发服务器
3. 打开浏览器开发者工具 Network 面板
4. 确认没有向 `*.firebaseapp.com` 或 `*.googleapis.com/identitytoolkit` 发起请求
5. 社交登录按钮点击后应无响应或显示功能不可用

---

## 相关文件

- `apps/web/src/wallet/Privy/constants.ts` - Firebase 初始化
- `apps/web/src/wallet/Privy/firebase.tsx` - Firebase Auth Provider
- `apps/web/src/lib/firebase-admin.ts` - 服务端 Firebase Admin
- `apps/web/src/Providers.tsx` - 应用 Provider 层级
