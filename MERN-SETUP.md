# AgroEase React and MongoDB application

The application is in `client/` and `server/`. React now renders the original landing, login and dashboard markup using `html-react-parser`, the original CSS and original assets. Vite strips HTML scripts and packages compatibility scripts separately. This preserves the existing layout and interactions; it is not yet a full rewrite of every interaction into React hooks. `client/original-pages.jsx` is the active entry view. The earlier simplified React screens remain in source but are not the active UI.

Login retains its original sliding panels, imagery, location fields and animated background, with email/password fields added for server authentication. Farm profiles and scheduler data use authenticated MongoDB endpoints. Weather and location autocomplete use server-side keys. Original soil quiz, dataset suggestions, pest references, profit calculations and chart visuals are retained by the compatibility runtime.

## Local setup

1. Install Node.js 22 or newer and run `npm install`.
2. Copy `.env.example` to `.env` and set a MongoDB connection URI (local MongoDB or Atlas).
3. Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and use it as `JWT_SECRET`.
4. Run `npm run server` in one terminal and `npm run dev` in another.
5. Open the Vite address and register an account.

Keep `.env` private. The database must be accessible before the server starts. No fabricated database fallback is used. Existing browser-local records are not automatically imported.

## Deployment

Run `npm run build`, then deploy the repository to a Node-capable host. Configure `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production` and the host's `PORT`. Start with `npm start`. Express serves the compiled React frontend and API together. Use HTTPS so the production session cookie can be sent securely.

GitHub Pages alone cannot run Express or MongoDB. This application requires a Node host and MongoDB deployment. The original static site can still be hosted independently.

## API

- POST `/api/auth/register`, `/api/auth/login`: email/password authentication, HTTP-only cookie session.
- POST `/api/logout`: expire the current browser session.
- GET `/api/me`: signed-in user.
- GET/PUT `/api/farm`: user-owned farm figures.
- GET/POST `/api/records`: user-owned field records.
- PATCH `/api/records/:id`: update completion status.
- GET `/api/health`: database connectivity status.

Passwords are hashed. Account endpoints are rate limited. API errors omit server internals. Farm and record endpoints require authentication and query by owner.

## Tool endpoints and limitations

Authenticated tool endpoints: GET `/api/weather?city=...`, GET `/api/market?q=...`, GET `/api/pests`, GET `/api/fertilizers?soil=...&crop=...`, POST `/api/crops`. Set `WEATHER_API_KEY` on the server for OpenWeatherMap. Dataset files must be included in deployment. Profit estimation is calculated in React from entered quantities, price and costs.

Market prices are historical CSV data. The restored dashboard uses its original browser dataset lookup logic; separate advisory APIs remain available. The original yield charts and farming score are demonstration values, not measured farm analytics. Agricultural reference text needs expert validation. The restored scheduler uses its original calendar generation and saves it through GET/PUT `/api/schedule`; it does not send notifications. GET `/api/weather-detail` supplies current weather and forecast for the original weather cards. `/api/places` provides rate-limited location autocomplete.

The supplied `video/farm-bg.mp4` is empty and cannot play until replaced with a valid video. Production builds and a headless login rendering smoke check have passed. Full authenticated dashboard interactions and responsive visual comparisons still require further testing.

Image/report uploads, agronomist administration and reminder delivery are future extensions. MongoDB-backed authentication, persistence and cross-user isolation still need integration testing against a configured database; a successful frontend build does not establish those checks passed.
