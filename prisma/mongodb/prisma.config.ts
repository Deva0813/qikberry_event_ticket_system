import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: env('MONGODB_DATABASE_URL'),
  },
});