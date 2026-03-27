import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class ExportFilterDto {
  @IsString()
  @IsOptional()
  @IsEnum(['Hot', 'Warm', 'Cold'])
  classification?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}