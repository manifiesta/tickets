import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SellingInformation {
  @PrimaryGeneratedColumn()
  id: number;

  // On the first call it will be null
  // We fill in after the completation of the selling
  @Column({ nullable: true })
  eventsquareReference: string;

  @Column({nullable: true, default: null})
  clientTransactionId: string;

  @Column()
  sellerId: string;

  @Column()
  sellerDepartmentId: string;

  @Column()
  sellerPostalCode: string;

  @Column({nullable: true, default: null})
  vwTransactionId: string;

  @Column({nullable: true, default: null})
  clientName: string;

  @Column()
  date: Date;

  @Column()
  quantity: number;

  // Must seen how to stock that
  // A json string ?
  @Column("simple-json", {nullable: true, default: null})
  ticketInfo: { ticketId: string, ticketAmount: number, ticketName: string, ticketPrice: number }[];
}
