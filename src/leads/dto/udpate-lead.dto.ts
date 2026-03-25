import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
export class UpdateLeadsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;
  
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phone: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  companyName: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedValue?: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['WEBSITE', 'REFERRAL', 'PAID_AD', 'ORGANIC', 'OTHER'])
  source: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  notes?: string;
}