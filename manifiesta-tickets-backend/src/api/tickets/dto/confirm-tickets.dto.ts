import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ConfirmTicketsDto {
  @IsString()
  @IsNotEmpty()
  readonly firstname: string;
  @IsString()
  @IsNotEmpty()
  readonly lastname: string;
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  @IsString()
  readonly language: string;
  @IsString()
  readonly ip: string;
  @IsString()
  readonly agent: string;
  @IsNumber()
  readonly invoice: number;
  @IsNumber()
  readonly testmode: number;
  @IsString()
  readonly sellerId: string;
  @IsString()
  @IsNotEmpty()
  readonly vwTransactionId: string;
  @IsArray()
  readonly tickets: {ticketId: string, ticketAmount: number}[];
}