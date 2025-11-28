import path from "node:path";
import "dotenv/config"; // Loads .env from the current working directory
import { defineConfig, env } from "prisma/config"; 

export default defineConfig({
  // Setting engine to classic is often needed for migrate commands in v7
  engine: "classic", 
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    // Ensure the path is correct relative to the config file
    path: path.join(__dirname, "migrations"),
  },
});
