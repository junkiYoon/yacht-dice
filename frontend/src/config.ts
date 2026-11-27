/**
 * Backend base URL resolution (priority order):
 *  1. VITE_API_URL env var — explicit override (set in .env for non-standard setups)
 *  2. Auto-detect from window.location.hostname — works for both localhost and LAN IPs
 *
 * LAN play: guests just visit http://<host-ip>:5173 — no extra config needed.
 */
export const BACKEND_URL: string =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT ?? 3000}`;
