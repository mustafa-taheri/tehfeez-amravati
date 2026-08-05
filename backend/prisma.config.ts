import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const datasource = {} as { url?: string };
if (databaseUrl) {
  datasource.url = databaseUrl;
}

export default defineConfig({
  datasource,
});
