import { defineConfig } from "drizzle-kit";

// Only require DATABASE_URL if we're actually using drizzle (not when using Supabase)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl && process.env.NODE_ENV === 'development') {
  console.warn("DATABASE_URL not set - drizzle commands will not work");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl || "postgresql://dummy:dummy@localhost:5432/dummy", // fallback for when not using drizzle
  },
});
