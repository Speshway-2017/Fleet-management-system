function googleTranslateElementInit() {
  try {
    var currentLang = localStorage.getItem("app_language_code") || "en";
    var hostname = window.location.hostname;
    var paths = ["/", "/admin", "/manager", "/driver"];
    var domains = ["", hostname, "." + hostname];

    if (currentLang === "en") {
      paths.forEach(function (p) {
        domains.forEach(function (d) {
          var domPart = d ? "; domain=" + d : "";
          document.cookie =
            "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" +
            p +
            domPart;
        });
      });
    } else {
      document.cookie = "googtrans=/en/" + currentLang + "; path=/;";
      if (hostname && hostname !== "localhost") {
        document.cookie =
          "googtrans=/en/" +
          currentLang +
          "; path=/; domain=." +
          hostname +
          ";";
      }
    }

    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    }
  } catch (e) {
    console.warn("Translate init warning:", e);
  }
}

window.googleTranslateElementInit = googleTranslateElementInit;

