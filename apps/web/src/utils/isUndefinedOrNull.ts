// 本地实现，避免从 @pancakeswap/utils 导入路径问题
export function isUndefinedOrNull<TValue>(value: TValue | null | undefined): value is null | undefined {
  return value === null || value === undefined
}

export function isNotUndefinedOrNull<TValue>(value: TValue | null | undefined): value is TValue {
  return !isUndefinedOrNull(value)
}
