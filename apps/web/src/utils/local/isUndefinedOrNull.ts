/**
 * 本地工具函数集合
 * 避免从 @pancakeswap/utils 导入时的路径问题
 */

export function isUndefinedOrNull<TValue>(value: TValue | null | undefined): value is null | undefined {
  return value === null || value === undefined
}

export function isNotUndefinedOrNull<TValue>(value: TValue | null | undefined): value is TValue {
  return !isUndefinedOrNull(value)
}
