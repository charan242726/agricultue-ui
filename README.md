# AgroEase

AgroEase is a modern frontend web application for smart farming workflows. It provides a complete farmer-facing experience with a landing page, authentication flow, and an interactive dashboard for weather, crop insights, soil guidance, fertilizer suggestions, scheduling, market tracking, and profit estimation.

## Highlights

- Premium multi-page UI built with HTML, CSS, and vanilla JavaScript
- Dedicated landing page with animated sections and CTA flow
- Farmer login form with validation and local profile persistence
- Dashboard with multiple farming operation panels
- Live weather integration pattern using OpenWeatherMap
- Local data-driven recommendations for crops and farm planning
- Rich interactions: sidebar navigation, search overlay, notifications, charts, toasts, skeletons, and custom dropdowns

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (for dashboard charts)
- AOS (Animate On Scroll, on landing page)

## Project Structure

```text
agri/
  index.html          # Landing page
  login.html          # Farmer login
  dashboard.html      # Main dashboard
  README.md           # Project documentation
  css/
    styles.css        # Core global + dashboard styling
    ui.css            # UI utility styles/components
  js/
    script.js         # Landing page interactions (navbar scroll)
    app.js            # Dashboard logic and business rules
    ui.js             # Reusable UI utilities (toast, dropdown, loading states)
```

## Pages and Flow

1. Landing: `index.html`
- Presents AgroEase value proposition
- Feature showcase and “How it works” steps
- CTA routes user to login page

2. Login: `login.html`
- Captures farmer name, mobile number, village, and district
- Performs client-side validation
- Stores user profile in localStorage
- Redirects to dashboard after simulated authentication

3. Dashboard: `dashboard.html`
- Main control center with panel-based navigation
- Uses local profile data for personalization
- Provides multiple modules for farm decision support

## Dashboard Modules

- Overview Dashboard
  - Stat cards (land, crops, yield, revenue)
  - Farming score visualization
  - Yield chart with period tabs

- Weather Intelligence
  - City search and geolocation trigger
  - Live metrics: temperature, humidity, wind, visibility, pressure, sunrise/sunset
  - Forecast cards and weather alert messaging

- Soil Test
  - Soil-focused panel for farm condition guidance

- Fertilizer Prediction
  - Input-based fertilizer suggestions and usage guidance

- Market Panel
  - Crop price and trend-focused market support

- Scheduler
  - Task and planning support for farming operations

- Profit Estimator
  - Revenue/cost/profit-oriented insights

## Data and Logic Notes

- Core dashboard behavior and recommendation logic are in `js/app.js`
- UI components and reusable helpers are in `js/ui.js`
- Landing-specific behavior is in `js/script.js`
- User session/profile is persisted in browser `localStorage`

## External Dependencies

Included via CDN:

- Chart.js in `dashboard.html`
- AOS in `index.html`

If internet/CDN access is unavailable, these features may be limited.

## Weather API Setup

Weather features are designed to use OpenWeatherMap.

1. Create a free API key at: https://openweathermap.org/api
2. Open `js/app.js`
3. Set your API key in the weather configuration section (the dashboard UI also shows a hint about this)

Without an API key, live weather requests may fail or stay in fallback mode.

## Run Locally

No build step is required.

Option A: Open directly
1. Open `index.html` in a browser

Option B: Recommended local server
1. From project root, run any static server
2. Example with Python:

```bash
python -m http.server 5500
```

3. Visit: `http://localhost:5500/index.html`

## Validation Rules (Login)

- Name: minimum basic text length
- Mobile: exactly 10 digits (numeric)
- Village: required
- District: required (custom searchable dropdown)

## UX Features

- Loading screen transitions
- Glassmorphism-inspired cards and panels
- Animated background blobs
- Toast notifications for success/error/info
- Search overlay with quick panel shortcuts
- Notification dropdown with read-state actions
- Mobile-friendly navigation with sidebar overlay

## Browser Compatibility

Test on modern browsers:

- Google Chrome (recommended)
- Microsoft Edge
- Mozilla Firefox

## Deployment (GitHub)

Repository target:

- Owner: `bhanusai06`
- Repository name: `AgroEase`
- Remote URL: `https://github.com/bhanusai06/AgroEase.git`

If push fails with “Repository not found”, create the repository first on GitHub and push again.

## Suggested Next Improvements

- Add secure backend authentication (replace localStorage-only flow)
- Add persistent database for user/farm records
- Add production-grade API key management via environment variables
- Add automated tests for validation and recommendation logic
- Add accessibility audit and Lighthouse performance tuning

## License

No license file is currently included. Add a `LICENSE` file if you want to define usage permissions.
