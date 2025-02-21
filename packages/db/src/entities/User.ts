import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Session } from "./Session";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string; 

  @Column()
  web3Address!: string;

  // Watchlist as an array of token IDs (strings)
  @Column("simple-array", { default: "" })
  watchlist!: string[];

  // Define a one-to-many relation to Session
  @OneToMany(() => Session, session => session.user)
  sessions!: Session[];

  // Auto-generated timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
