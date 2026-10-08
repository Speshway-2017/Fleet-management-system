export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English", code: "en" },
  { value: "Spanish", label: "Spanish (Español)", code: "es" },
  { value: "French", label: "French (Français)", code: "fr" },
  { value: "German", label: "German (Deutsch)", code: "de" },
  { value: "Hindi", label: "Hindi (हिन्दी)", code: "hi" },
  { value: "Tamil", label: "Tamil (தமிழ்)", code: "ta" },
  { value: "Telugu", label: "Telugu (తెలుగు)", code: "te" },
  { value: "Arabic", label: "Arabic (العربية)", code: "ar" },
  { value: "Chinese", label: "Chinese (Mandarin)", code: "zh-CN" },
  { value: "Japanese", label: "Japanese (日本語)", code: "ja" },
  { value: "Portuguese", label: "Portuguese (Português)", code: "pt" }
];

export const LANGUAGE_MAP = {
  "English": "en",
  "English (US)": "en",
  "Spanish": "es",
  "Spanish (Español)": "es",
  "French": "fr",
  "French (Français)": "fr",
  "German": "de",
  "German (Deutsch)": "de",
  "Hindi": "hi",
  "Hindi (हिन्दी)": "hi",
  "Hindi (हिंदी)": "hi",
  "Tamil": "ta",
  "Tamil (தமிழ்)": "ta",
  "Telugu": "te",
  "Telugu (తెలుగు)": "te",
  "Arabic": "ar",
  "Arabic (العربية)": "ar",
  "Chinese": "zh-CN",
  "Chinese (Mandarin)": "zh-CN",
  "Japanese": "ja",
  "Japanese (日本語)": "ja",
  "Portuguese": "pt",
  "Portuguese (Português)": "pt",
  "en": "en",
  "es": "es",
  "fr": "fr",
  "de": "de",
  "hi": "hi",
  "ta": "ta",
  "te": "te",
  "ar": "ar",
  "zh-CN": "zh-CN",
  "ja": "ja",
  "pt": "pt"
};

export const getLanguageCode = (langName) => {
  if (!langName) return "en";
  return LANGUAGE_MAP[langName] || "en";
};

export const getLanguageName = (langCodeOrName) => {
  if (!langCodeOrName) return "English";
  const found = LANGUAGE_OPTIONS.find(
    (l) => l.value === langCodeOrName || l.label === langCodeOrName || l.code === langCodeOrName || (l.value.toLowerCase() === String(langCodeOrName).toLowerCase())
  );
  if (found) return found.value;
  if (LANGUAGE_MAP[langCodeOrName]) {
    const code = LANGUAGE_MAP[langCodeOrName];
    const matchByCode = LANGUAGE_OPTIONS.find((l) => l.code === code);
    if (matchByCode) return matchByCode.value;
  }
  return "English";
};

export const setGoogleTranslateCookie = (langCode) => {
  try {
    const hostname = window.location.hostname;
    const paths = ["/", "/admin", "/manager", "/driver"];
    const domains = ["", hostname, `.${hostname}`];

    if (!langCode || langCode === "en") {
      paths.forEach((p) => {
        domains.forEach((d) => {
          const domPart = d ? `; domain=${d}` : "";
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${domPart}`;
        });
      });
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      if (hostname && hostname !== "localhost") {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${hostname};`;
      }
    }
  } catch (err) {
    console.warn("Could not set translation cookie:", err);
  }
};

export const triggerGoogleTranslate = (langCode) => {
  try {
    const code = langCode || "en";
    setGoogleTranslateCookie(code);
    
    const applyToCombo = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        const targetVal = code === "en" ? "" : code;
        if (select.value !== targetVal) {
          select.value = targetVal;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          select.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return true;
      }
      return false;
    };

    if (!applyToCombo()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (applyToCombo() || attempts >= 12) {
          clearInterval(interval);
        }
      }, 250);
    }
  } catch (err) {
    console.warn("Google translate trigger error:", err);
  }
};

export const applyApplicationLanguage = (langNameOrCode, reloadIfNecessary = false) => {
  const langName = getLanguageName(langNameOrCode || "English");
  const langCode = getLanguageCode(langName);

  localStorage.setItem("app_language", langName);
  localStorage.setItem("app_language_code", langCode);

  document.documentElement.lang = langCode;
  document.documentElement.dir = langCode === "ar" ? "rtl" : "ltr";

  triggerGoogleTranslate(langCode);

  window.dispatchEvent(new CustomEvent("app:language-changed", { detail: { language: langName, code: langCode } }));

  if (reloadIfNecessary) {
    const currentCookie = (document.cookie.match(/googtrans=([^;]+)/) || [])[1];
    const expectedCookie = langCode === "en" ? "" : `/en/${langCode}`;
    if (currentCookie !== expectedCookie) {
      setGoogleTranslateCookie(langCode);
      window.location.reload();
    }
  }
};
