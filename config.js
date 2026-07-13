const protopediaConfig = {
  PROTOPEDIA_PROFILE_URL: "https://protopedia.net/prototyper/yohaku_make"
};

if (typeof window !== "undefined") {
  window.PROTOPEDIA_CONFIG = protopediaConfig;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = protopediaConfig;
}
