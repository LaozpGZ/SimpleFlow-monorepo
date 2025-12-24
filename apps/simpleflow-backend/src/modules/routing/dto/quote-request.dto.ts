import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteRequestDto {
  @IsNumber()
  @Type(() => Number)
  chainId!: number;

  @IsString()
  amount!: string;

  @IsString()
  currency!: string;

  @IsString()
  @IsOptional()
  tradeType?: string = 'EXACT_INPUT';

  @IsString()
  @IsOptional()
  blockNumber?: string;

  @IsString()
  @IsOptional()
  gasPriceWei?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxHops?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxSplits?: number;

  @IsArray()
  @IsOptional()
  poolTypes?: string[];

  @IsArray()
  @IsOptional()
  candidatePools?: any[];
}
