# E-SDMART Delivery ERP

A React + Vite delivery workspace for Pinjrapole Gaushala.

## Current phase: Phase 2 — Route workflow + Mapbox/GPS-ready demo

Implemented in this phase:
- Shared illustrative order dataset in `src/data/mockData.js`.
- Shared order state via `src/context/DeliveryDataContext.jsx` and `src/context/useDeliveryData.js`.
- Dashboard metrics calculated from the same order dataset.
- My Deliveries search across order/customer/address/product, status/date filters, pagination, CSV export, order detail modal and demo status updates.
- Status changes reflected in dashboard/history/route views and persisted to this browser's local storage.
- Delivery history filters and sample route stop list.
- Route stop actions: Packed → Dispatched → Delivered, shared with the other demo pages.
- Route completion progress is calculated from the illustrative orders; cancelled orders are excluded from route completion.
- Responsive UI styling aligned to the existing forest-green / pale-sage E-SDMART admin design.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```

## Important limitations

All names, phone numbers, addresses, coordinates, products and orders are illustrative demo records. No real customer data is included. The frontend demo does not connect to a backend or shared database. Status updates are local to the current browser only. The route page includes a Mapbox/GPS integration scaffold. Without a valid Mapbox public token, it displays a clearly labelled map placeholder. Browser GPS only reads this device when permission is granted; delivery assignment, shared tracking, authentication and API/database integration are still future phases.

Do not put `.env` files, API tokens, database credentials or secrets in source control or uploaded archives.


## Mapbox route + device GPS (database-free phase)

1. Create a Mapbox account and copy a **public** access token (`pk...`). Do not use a secret (`sk...`) token in the browser. Restrict the public token to your development/deployment URLs when possible.
2. Copy `.env.example` to `.env` in the project root.
3. Set `VITE_MAPBOX_ACCESS_TOKEN=pk.your_public_token`.
4. Stop and restart Vite (`Ctrl+C`, then `npm run dev`).
5. Open Delivery Route and accept the browser's location permission to test GPS. Use localhost during development; production location requires HTTPS.

The map shows approximate illustrative demo stop coordinates in Jaipur. Mapbox Directions calculates a driving route and estimated distance/time when the token is configured. The GPS button reads this device's browser geolocation. **This phase does not send location to a backend, persist GPS history, or share a driver's position across devices.** Those capabilities require the authenticated backend/database/realtime phase.


## Database-free route workflow test

1. Open Delivery Route and choose **Active stops**.
2. On a Packed stop, select **Mark dispatched**.
3. The same order should become Dispatched across My Deliveries, Overview and the route page.
4. Select **Mark delivered** on a Dispatched stop and confirm the prompt.
5. Check the route completion percentage and Delivery History.

These changes persist only in this browser local storage and are demo data, not server records.


## Visual polish update
- Kept the existing Overview cow photograph unchanged and in the Overview page only.
- Updated the app canvas to soft sage `#E8F2D8` and light lime `#D1E5AB` accents.
- Added softer green-tinted surfaces, clearer route spacing, and responsive route layout.
- Mapbox token and live shared tracking remain optional/pending; no credentials are included.
