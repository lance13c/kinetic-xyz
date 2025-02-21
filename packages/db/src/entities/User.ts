import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string; 

  // Watchlist as an array of token IDs (strings)
  @Column("simple-array", { default: "" })
  watchlist!: string[];
}
