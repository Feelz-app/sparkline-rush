# Sparkline Rush iOS Build Notes

## What exists now

- Android `.aab` is untouched and remains for Google Play.
- iOS Capacitor project exists in `ios/`.
- App icon has been replaced with the Sparkline Rush icon.
- `codemagic.yaml` is ready for a cloud Mac build that can create an `.ipa`.

## Why the App Store build box is empty

Apple does not accept Android `.aab` files. App Store Connect needs an iOS build uploaded from Xcode, Transporter, or a cloud Mac build service. Since this workspace is on Windows, use Codemagic or another cloud Mac builder.

## Before the final paid-ad iOS release

Create an iOS app in AdMob and make these iOS ad units:

- iOS app ID
- Banner ad unit
- Rewarded revive ad unit
- Rewarded double sparks ad unit
- Rewarded free chest ad unit

Then add them as Codemagic environment variables:

```text
IOS_ADMOB_APP_ID=ca-app-pub-...~...
VITE_ADMOB_IOS_APP_ID=ca-app-pub-...~...
VITE_ADMOB_IOS_BANNER_MENU_ID=ca-app-pub-.../...
VITE_ADMOB_IOS_REWARD_REVIVE_ID=ca-app-pub-.../...
VITE_ADMOB_IOS_REWARD_DOUBLE_SPARKS_ID=ca-app-pub-.../...
VITE_ADMOB_IOS_REWARD_FREE_CHEST_ID=ca-app-pub-.../...
VITE_ADMOB_USE_TEST_ADS=false
```

The current Codemagic file uses iOS test ads as a safe placeholder. Do not submit a final monetized App Store release with test ads.

## Codemagic flow

1. Push this project to GitHub.
2. Connect the GitHub repo to Codemagic.
3. Connect App Store Connect inside Codemagic integrations.
4. Add the environment variables above after the iOS AdMob IDs exist.
5. Run the `Sparkline Rush iOS App Store` workflow.
6. Codemagic builds an `.ipa` and can upload it to TestFlight.
7. In App Store Connect, select the uploaded build in the `Build` section.

## Local command before cloud build

Run this after app changes:

```bash
npm run ios:sync
```
