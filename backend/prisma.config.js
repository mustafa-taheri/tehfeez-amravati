import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";
dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}
export default defineConfig({
    earlyAccess: true,
    datasource: {
        url: databaseUrl,
    },
    migrate: {
        databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map