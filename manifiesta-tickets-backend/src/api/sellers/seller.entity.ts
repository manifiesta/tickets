import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Department } from "../departments/department.entity";

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  name: string;

  @Column()
  beepleId: string;
}
