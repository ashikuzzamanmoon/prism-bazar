import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env" });
enum API_VERSION {
    V1 = "1",
}

export { API_VERSION };

