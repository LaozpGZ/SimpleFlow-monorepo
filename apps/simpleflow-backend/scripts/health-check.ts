#!/usr/bin/env tsx
/**
 * SimpleFlow Backend 健康检查脚本
 *
 * 用法:
 *   tsx scripts/health-check.ts
 *   BASE_URL=http://localhost:3000 tsx scripts/health-check.ts
 */

import { existsSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10秒超时

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

type CheckResult = {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
  data?: any;
};

// 确保token list文件存在
function ensureTokenLists() {
  const distDir = join(process.cwd(), 'dist', 'tokens');
  const srcDir = join(process.cwd(), 'tokens');

  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const defaultSrc = join(srcDir, 'simpleflow-default.json');
  const defaultDist = join(distDir, 'simpleflow-default.json');
  const extendedSrc = join(srcDir, 'simpleflow-extended.json');
  const extendedDist = join(distDir, 'simpleflow-extended.json');

  if (existsSync(defaultSrc) && !existsSync(defaultDist)) {
    copyFileSync(defaultSrc, defaultDist);
  }
  if (existsSync(extendedSrc) && !existsSync(extendedDist)) {
    copyFileSync(extendedSrc, extendedDist);
  }
}

// HTTP请求辅助函数
async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 检查函数
async function checkHealth(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/health`, TIMEOUT);
    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Health Check',
        status: 'fail',
        duration: Date.now() - start,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    if (data.status !== 'ok') {
      return {
        name: 'Health Check',
        status: 'warn',
        duration: Date.now() - start,
        message: 'Service reported unhealthy status',
        data,
      };
    }

    return {
      name: 'Health Check',
      status: 'pass',
      duration: Date.now() - start,
      data,
    };
  } catch (error) {
    return {
      name: 'Health Check',
      status: 'fail',
      duration: Date.now() - start,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTokensDefault(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/tokens/list/default`,
      TIMEOUT,
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Tokens - Default List',
        status: 'fail',
        duration: Date.now() - start,
        message: `HTTP ${response.status}`,
      };
    }

    if (!data.tokens || !Array.isArray(data.tokens)) {
      return {
        name: 'Tokens - Default List',
        status: 'warn',
        duration: Date.now() - start,
        message: 'Invalid response structure',
        data,
      };
    }

    return {
      name: 'Tokens - Default List',
      status: 'pass',
      duration: Date.now() - start,
      message: `${data.tokens.length} tokens`,
      data: { tokenCount: data.tokens.length },
    };
  } catch (error) {
    return {
      name: 'Tokens - Default List',
      status: 'fail',
      duration: Date.now() - start,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTokensExtended(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/tokens/list/extended`,
      TIMEOUT,
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Tokens - Extended List',
        status: 'fail',
        duration: Date.now() - start,
        message: `HTTP ${response.status}`,
      };
    }

    return {
      name: 'Tokens - Extended List',
      status: 'pass',
      duration: Date.now() - start,
      message: `${data.tokens?.length || 0} tokens`,
      data: { tokenCount: data.tokens?.length || 0 },
    };
  } catch (error) {
    return {
      name: 'Tokens - Extended List',
      status: 'fail',
      duration: Date.now() - start,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTokensByChain(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/tokens/56`, TIMEOUT);
    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Tokens - By Chain (BSC)',
        status: 'fail',
        duration: Date.now() - start,
        message: `HTTP ${response.status}`,
      };
    }

    return {
      name: 'Tokens - By Chain (BSC)',
      status: 'pass',
      duration: Date.now() - start,
      message: `${data.length || 0} BSC tokens`,
      data: { tokenCount: data.length || 0 },
    };
  } catch (error) {
    return {
      name: 'Tokens - By Chain (BSC)',
      status: 'fail',
      duration: Date.now() - start,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTokensSearch(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/tokens/search/USDT`,
      TIMEOUT,
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Tokens - Search',
        status: 'fail',
        duration: Date.now() - start,
        message: `HTTP ${response.status}`,
      };
    }

    return {
      name: 'Tokens - Search',
      status: 'pass',
      duration: Date.now() - start,
      message: `${data.length || 0} results for "USDT"`,
      data: { resultCount: data.length || 0 },
    };
  } catch (error) {
    return {
      name: 'Tokens - Search',
      status: 'fail',
      duration: Date.now() - start,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// 打印结果
function printResult(result: CheckResult) {
  const statusColor =
    result.status === 'pass'
      ? colors.green
      : result.status === 'warn'
      ? colors.yellow
      : colors.red;
  const statusSymbol =
    result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';

  // eslint-disable-next-line no-console
  console.log(
    `${statusColor}${statusSymbol} [${result.duration}ms] ${result.name}${
      colors.reset
    } ${result.message || ''}`,
  );
}

// 生成JSON报告
function generateReport(results: CheckResult[]): string {
  const total = results.length;
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  const report = {
    summary: {
      total,
      passed,
      failed,
      warned,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    },
    checks: results,
  };

  return JSON.stringify(report, null, 2);
}

// 主函数
async function main() {
  // eslint-disable-next-line no-console
  console.log(`${colors.blue}SimpleFlow Backend 健康检查${colors.reset}`);
  // eslint-disable-next-line no-console
  console.log(`目标: ${BASE_URL}\n`);

  // 确保token lists存在
  ensureTokenLists();

  const checks = [
    checkHealth(),
    checkTokensDefault(),
    checkTokensExtended(),
    checkTokensByChain(),
    checkTokensSearch(),
  ];

  const results = await Promise.all(checks);

  // 打印结果
  results.forEach(printResult);

  // 生成JSON报告
  const report = generateReport(results);

  // 退出码
  const hasFailures = results.some((r) => r.status === 'fail');

  // eslint-disable-next-line no-console
  console.log(`\n${colors.blue}JSON 报告:${colors.reset}`);
  // eslint-disable-next-line no-console
  console.log(report);

  process.exit(hasFailures ? 1 : 0);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
