import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const api = createClient<paths>({ baseUrl: (typeof window !== 'undefined' ? window : process).env.API_BASE_URL });
