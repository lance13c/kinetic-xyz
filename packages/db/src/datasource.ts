import { DataSource } from "typeorm";
import { Session } from "./entities/Session";
import { User } from "./entities/User";

if (!process.env.POSTGRES_HOST) throw new Error("POSTGRES_HOST is required");
if (!process.env.POSTGRES_PORT) throw new Error("POSTGRES_PORT is required");
if (!process.env.POSTGRES_USER) throw new Error("POSTGRES_USER is required");
if (!process.env.POSTGRES_PASSWORD) throw new Error("POSTGRES_PASSWORD is required");
if (!process.env.POSTGRES_DB) throw new Error("POSTGRES_DB is required");


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true, 
  entities: [User, Session],
});
