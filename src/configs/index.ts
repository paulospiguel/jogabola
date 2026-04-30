import adminConfig from "./admin.json";
import plansConfig from "./plans.json";
import webConfig from "./web.json";

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "jogabola.app";

export { adminConfig, plansConfig, webConfig, MAIN_DOMAIN };
