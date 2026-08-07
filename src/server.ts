import app from "./app.ts";
import { port } from "./config/env.ts";
 
app.listen(port, () => {
    console.log(`[server]: Running at http://localhost:${port}`)
})