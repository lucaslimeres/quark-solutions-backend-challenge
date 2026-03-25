import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
import { IsCnpj } from "../decorator/cnpj.decorator";
import { LeadSource } from "generated/prisma/enums";

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()  
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phone: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @IsCnpj({ message: 'companyCnpj is invalid' })
  companyCnpj: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedValue?: number;

  @IsNotEmpty()
  @IsEnum(['WEBSITE', 'REFERRAL', 'PAID_AD', 'ORGANIC', 'OTHER'])
  source: LeadSource;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}