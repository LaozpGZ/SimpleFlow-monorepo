import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PoolQueryDto {
  @IsNumber()
  @Type(() => Number)
  chainId!: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 100;
}

export class PoolAddressDto {
  @IsNumber()
  @Type(() => Number)
  chainId!: number;

  @IsString()
  address!: string;
}
