import { IsArray, IsNumber, IsString } from "class-validator";

export class ConfirmTicketsDto {
  @IsString()
  readonly firstname: string;
  @IsString()
  readonly lastname: string;
  @IsString()
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
  @IsArray()
  readonly tickets: {ticketId: string, ticketAmount: number}[];
}