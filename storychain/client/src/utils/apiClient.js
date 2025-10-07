
// client/src/utils/apiClient.js
// Exposes API_BASE for front-end fetch/axios use.

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";

// remove trailing slashes
const cleanRoot = API_ROOT.replace(/\/+$/, "");

// ensure we always end with /api (but not /api/api)
export const API_BASE = cleanRoot.endsWith("/api") ? cleanRoot : `${cleanRoot}/api`;

export default API_BASE;

