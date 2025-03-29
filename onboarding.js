// Fill onboarding page content with localized text
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  $("obTitle").textContent = chrome.i18n.getMessage("onboarding_title");
  $("obIntro").textContent = chrome.i18n.getMessage("onboarding_intro");
  $("obHowTitle").textContent = chrome.i18n.getMessage("onboarding_how_title");
  $("obHowText").textContent = chrome.i18n.getMessage("onboarding_how_text");
  $("obFeaturesTitle").textContent = chrome.i18n.getMessage("onboarding_features_title");
  const features = [
    "onboarding_feature_favorites",
    "onboarding_feature_share",
    "onboarding_feature_stats",
    "onboarding_feature_accessibility"
  ];
  const featuresListElem = $("obFeaturesList");
  features.forEach(key => {
    const li = document.createElement("li");
    li.textContent = chrome.i18n.getMessage(key);
    featuresListElem.appendChild(li);
  });
  $("obThanks").textContent = chrome.i18n.getMessage("onboarding_thanks");
});
