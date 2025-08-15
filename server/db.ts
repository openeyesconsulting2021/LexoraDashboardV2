import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
//import { Pool } from "pg";

neonConfig.webSocketConstructor = ws;
const DATABASE_URL =
  "postgresql://neondb_owner:npg_b7yZwj9saStx@ep-summer-surf-ae0exjrd.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });

pool
  .connect()
  .then((value) => {
    console.log("Pool Connected");
  })
  .catch((err) => {
    console.log("Error While Connecting To Pool:", err);
  });

export const db = drizzle({ client: pool, schema });
