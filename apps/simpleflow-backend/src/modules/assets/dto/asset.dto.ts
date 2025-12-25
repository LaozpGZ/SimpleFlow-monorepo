import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * 资源类型枚举
 */
export enum AssetType {
  TOKEN = 'token', // 代币图标
  CHAIN = 'chain', // 链图标
  SYMBOL = 'symbol', // 符号图标
  CUSTOM = 'custom', // 自定义图标
}

/**
 * 查询资源 DTO
 */
export class GetAssetDto {
  @IsString()
  address: string;

  @IsNumber()
  chainId: number;

  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType = AssetType.TOKEN;
}

/**
 * 通过 Symbol 查询 DTO
 */
export class GetAssetBySymbolDto {
  @IsString()
  symbol: string;

  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType = AssetType.SYMBOL;
}

/**
 * 上传资源 DTO
 */
export class UploadAssetDto {
  @IsString()
  address: string;

  @IsNumber()
  chainId: number;

  @IsString()
  symbol: string;

  @IsOptional()
  @IsNumber()
  decimals?: number;
}

/**
 * 批量上传 DTO
 */
export class BatchUploadDto {
  @IsString()
  chainId: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string; // 从外部URL批量下载
}

/**
 * 删除资源 DTO
 */
export class DeleteAssetDto {
  @IsString()
  address: string;

  @IsNumber()
  chainId: number;
}
