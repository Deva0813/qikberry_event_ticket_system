import app from "./app.ts";
import { app_config } from "./constants/app.config.ts";


app.listen(app_config.PORT, () => {
    console.log(`[server]: Running at http://localhost:${app_config.PORT}`)
})