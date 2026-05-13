# Sparkline Rush

Sparkline Rush is a mobile-first arcade runner built with React, TypeScript, Vite, Canvas, and Capacitor. It is designed as a lightweight launch candidate: open the app, play instantly, collect sparks, unlock skins, save a score, and keep chasing the local leaderboard.

## Included

- Flashy lane-runner gameplay with rising speed, three-hit lives, sparks, powerups, combos, and crash effects
- Daily challenge mode with a separate daily top-ten board
- Personal records for best score, best streak, total runs, recent run history, and local leaderboard entries
- Run missions, collectible sparks, revive tokens, extra-life boosts, and a 50-skin Ball Lab
- Touch, swipe, keyboard, and on-screen controls
- Local high score saved in `localStorage`
- Local top-ten leaderboard with player name entry
- Ad-ready placements for a `320 x 50` banner and `300 x 250` rectangle
- PWA manifest and app icon for mobile install prompts
- Static production build output through Vite

## Quick Start

```powershell
npm install
npm run dev
```

Then open the local URL shown by Vite, usually `http://127.0.0.1:5173`.

## Build

```powershell
npm run build
```

Deploy the generated `dist/` folder to Firebase Hosting, Netlify, Vercel, Cloudflare Pages, or any static host.

## Android Release

This project is prepared for a `1.1` Android release with `versionCode 2`.

```powershell
npx cap copy android
cd android
.\gradlew.bat :app:bundleRelease
```

Only upload a newly generated `.aab` after the latest gameplay changes are checked on device.

## Ads

The ad placements are rendered by the `AdSlot` component in `src/App.tsx`.

- `bottom-banner`: sized for a mobile `320 x 50` banner
- `side-rectangle`: sized for a `300 x 250` rectangle or game-over/interstitial sponsor unit

Replace the placeholder contents in `AdSlot` with your ad network tag after your site/app is approved. For mobile app stores, use a wrapper such as Capacitor and swap those zones for AdMob units.

## Leaderboard

The leaderboard is local to the device so the app can launch without accounts, auth, or server setup. For a global leaderboard, connect the submit flow in `submitScore` to Firebase, Supabase, or your own API and keep the local board as an offline fallback.
