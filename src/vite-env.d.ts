/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_APP_ID?: string;
  readonly VITE_ADMOB_REWARD_REVIVE_ID?: string;
  readonly VITE_ADMOB_REWARD_DOUBLE_SPARKS_ID?: string;
  readonly VITE_ADMOB_REWARD_FREE_CHEST_ID?: string;
  readonly VITE_ADMOB_BANNER_MENU_ID?: string;
  readonly VITE_ADMOB_IOS_APP_ID?: string;
  readonly VITE_ADMOB_IOS_REWARD_REVIVE_ID?: string;
  readonly VITE_ADMOB_IOS_REWARD_DOUBLE_SPARKS_ID?: string;
  readonly VITE_ADMOB_IOS_REWARD_FREE_CHEST_ID?: string;
  readonly VITE_ADMOB_IOS_BANNER_MENU_ID?: string;
  readonly VITE_ADMOB_USE_TEST_ADS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
