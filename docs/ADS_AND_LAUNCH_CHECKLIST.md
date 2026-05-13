# Ads and Launch Checklist

## Current ad setup

- AdMob app ID is stored in `.env.local` and Android `strings.xml`.
- Rewarded ad units are stored in `.env.local`.
- The menu banner ad unit is stored in `.env.local`.
- The game reward buttons now call the native AdMob plugin on Android.
- The native banner is only shown on menu screens, not during active gameplay.
- Browser testing still grants preview rewards because AdMob only runs in the native mobile app.
- `VITE_ADMOB_USE_TEST_ADS=true` is on for development safety.

## Before final upload

1. Test the game with test ads only.
2. Do not click or watch your own live ads while testing.
3. Change `.env.local` to `VITE_ADMOB_USE_TEST_ADS=false` for the final release build.
4. Run `npm run build`.
5. Run `npx cap sync android`.
6. Build the Play Store upload file only when ready.

## Play Console items

- Mark the app as containing ads.
- Add a privacy policy URL.
- Complete the Data Safety form.
- Complete Content Rating.
- Complete Target Audience.
- Add store listing screenshots.
- Add `app-ads.txt` after a developer website is connected.

## Recommended ad plan

- Keep rewarded ads for revive, double sparks, and free chest.
- Keep banner ads on menus only, not during active gameplay.
- Add interstitial ads only after game-over every few runs, never when the player taps Play.
