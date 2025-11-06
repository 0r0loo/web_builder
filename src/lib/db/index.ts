import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

// PostgreSQL 클라이언트
const client = postgres(process.env.DATABASE_URL);

// Drizzle ORM 인스턴스
export const db = drizzle(client, { schema });