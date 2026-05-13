import { Capacitor } from "@capacitor/core";
import { ADMOB_USE_TEST_ADS, menuBannerAdId, rewardAdIdFor } from "../config/admob";

export type RewardedPlacement = "revive" | "doubleSparks" | "freeChest";

type RewardedAdResult = {
  rewarded: boolean;
  native: boolean;
  message: string;
};

let initialized = false;
let menuBannerVisible = false;

export async function showRewardedAd(placement: RewardedPlacement): Promise<RewardedAdResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      rewarded: true,
      native: false,
      message: "Browser reward preview"
    };
  }

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await initializeAdMob();
    await AdMob.prepareRewardVideoAd({
      adId: rewardAdIdFor(placement),
      isTesting: ADMOB_USE_TEST_ADS,
      immersiveMode: true
    });
    await AdMob.showRewardVideoAd();
    return {
      rewarded: true,
      native: true,
      message: ADMOB_USE_TEST_ADS ? "Test ad reward" : "Ad reward"
    };
  } catch {
    return {
      rewarded: false,
      native: true,
      message: "Ad not ready yet"
    };
  }
}

export async function showPrivacyOptions() {
  if (!Capacitor.isNativePlatform()) {
    return "Privacy options open in the mobile app";
  }

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await initializeAdMob();
    await AdMob.showPrivacyOptionsForm();
    return "Privacy options opened";
  } catch {
    return "Privacy options unavailable";
  }
}

export async function showMenuBanner() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (menuBannerVisible) {
    return;
  }

  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import("@capacitor-community/admob");
    await initializeAdMob();
    await AdMob.showBanner({
      adId: menuBannerAdId(),
      isTesting: ADMOB_USE_TEST_ADS,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0
    });
    menuBannerVisible = true;
  } catch {
    menuBannerVisible = false;
  }
}

export async function hideMenuBanner() {
  if (!Capacitor.isNativePlatform() || !menuBannerVisible) {
    return;
  }

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.removeBanner();
  } catch {
    return;
  } finally {
    menuBannerVisible = false;
  }
}

async function initializeAdMob() {
  if (initialized) {
    return;
  }

  const { AdMob, MaxAdContentRating } = await import("@capacitor-community/admob");
  await AdMob.initialize({
    initializeForTesting: ADMOB_USE_TEST_ADS,
    maxAdContentRating: MaxAdContentRating.Teen,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false
  });

  try {
    const consentInfo = await AdMob.requestConsentInfo();
    if (!consentInfo.canRequestAds && consentInfo.isConsentFormAvailable) {
      await AdMob.showConsentForm();
    }
  } catch {
    // Consent can be unavailable in some test contexts; ad load will report failure if it matters.
  }

  initialized = true;
}
