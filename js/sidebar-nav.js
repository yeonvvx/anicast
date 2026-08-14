(function () {
  "use strict";

  var appShell = document.querySelector(".app-shell");
  var collapseBtn = document.getElementById("sidebarCollapseBtn");
  var moreBtn = document.getElementById("mobileMoreBtn");
  var sheet = document.getElementById("mobileSheet");
  var backdrop = document.getElementById("mobileSheetBackdrop");

  // Remember collapse preference across visits
  if (collapseBtn && appShell) {
    var collapsed = localStorage.getItem("cv_sidebar_collapsed") === "1";
    if (collapsed) appShell.classList.add("sidebar-collapsed");

    collapseBtn.addEventListener("click", function () {
      var isCollapsed = appShell.classList.toggle("sidebar-collapsed");
      collapseBtn.setAttribute("aria-expanded", String(!isCollapsed));
      localStorage.setItem("cv_sidebar_collapsed", isCollapsed ? "1" : "0");
    });
  }

  // Mobile "More" sheet
  function openSheet() {
    if (!sheet || !backdrop) return;
    sheet.classList.add("open");
    backdrop.style.display = "block";
    moreBtn.setAttribute("aria-expanded", "true");
  }
  function closeSheet() {
    if (!sheet || !backdrop) return;
    sheet.classList.remove("open");
    backdrop.style.display = "none";
    if (moreBtn) moreBtn.setAttribute("aria-expanded", "false");
  }
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      sheet.classList.contains("open") ? closeSheet() : openSheet();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeSheet);

  // Keep sidebar + mobile nav active states in sync with the current page
  var current = (document.body.getAttribute("data-page") ||
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home");
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(function (el) {
    var key = el.getAttribute("data-nav");
    if (!key) return;
    el.classList.toggle("active", key === current || (key === "home" && current === "index" ));
  });
})();
