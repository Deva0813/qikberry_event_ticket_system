import app from "./app.ts";
import seeding from "./config/db/seed.ts";
import { port } from "./config/env.ts";

app.listen(port, async () => {
  console.log(`[server]: Running at http://localhost:${port}`);
  await seeding();
});
