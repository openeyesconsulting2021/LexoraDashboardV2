import { defineConfig } from "drizzle-kit";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_b7yZwj9saStx@ep-summer-surf-ae0exjrd.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
// const DATABASE_URL =
//   "postgresql://oec_root:root@localhost:5432/lexoracase_db?options=-c%20search_path=oec_root";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
