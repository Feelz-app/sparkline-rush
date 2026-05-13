import { Capacitor } from "@capacitor/core";

export const ADMOB_IDS = {
  android: {
    appId: import.meta.env.VITE_ADMOB_APP_ID || "",
    rewarded: {
      revive: import.meta.env.VITE_ADMOB_REWARD_REVIVE_ID || "",
      doubleSparks: import.meta.env.VITE_ADMOB_REWARD_DOUBLE_SPARKS_ID || "",
      freeChest: import.meta.env.VITE_ADMOB_REWARD_FREE_CHEST_ID || ""
    },
    banner: {
      menu: import.meta.env.VITE_ADMOB_BANNER_MENU_ID || ""
    }
  },
  ios: {
    appId: import.meta.env.VITE_ADMOB_IOS_APP_ID || "",
    rewarded: {
      revive: import.meta.env.VITE_ADMOB_IOS_REWARD_REVIVE_ID || "",
      doubleSparks: import.meta.env.VITE_ADMOB_IOS_REWARD_DOUBLE_SPARKS_ID || "",
      freeChest: import.meta.env.VITE_ADMOB_IOS_REWARD_FREE_CHEST_ID || ""
    },
    banner: {
      menu: import.meta.env.VITE_ADMOB_IOS_BANNER_MENU_ID || ""
    }
  }
} as const;

export const ADMOB_TEST_IDS = {
  android: {
    appId: "ca-app-pub-3940256099942544~3347511713",
    rewarded: "ca-app-pub-3940256099942544/5224354917",
    banner: "ca-app-pub-3940256099942544/6300978111"
  },
  ios: {
    appId: "ca-app-pub-3940256099942544~1458002511",
    rewarded: "ca-app-pub-3940256099942544/1712485313",
    banner: "ca-app-pub-3940256099942544/2934735716"
  }
} as const;

export const ADMOB_USE_TEST_ADS = import.meta.env.VITE_ADMOB_USE_TEST_ADS !== "false";

export type AdMobRewardPlacement = keyof typeof ADMOB_IDS.android.rewarded;

function adPlatform() {
  return Capacitor.getPlatform() === "ios" ? "ios" : "android";
}

function liveIds() {
  return ADMOB_IDS[adPlatform()];
}

function testIds() {
  return ADMOB_TEST_IDS[adPlatform()];
}

export function rewardAdIdFor(placement: AdMobRewardPlacement) {
  const liveId = liveIds().rewarded[placement];
  return ADMOB_USE_TEST_ADS || !liveId ? testIds().rewarded : liveId;
}

export function menuBannerAdId() {
  const liveId = liveIds().banner.menu;
  return ADMOB_USE_TEST_ADS || !liveId ? testIds().banner : liveId;
}

export function admobAppId() {
  const liveId = liveIds().appId;
  return ADMOB_USE_TEST_ADS || !liveId ? testIds().appId : liveId;
}
