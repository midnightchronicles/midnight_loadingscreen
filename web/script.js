(function () {
  "use strict";

  function getConfig() {
    return typeof Config !== "undefined" ? Config : null;
  }

  const PLACEHOLDER_IMAGE_RE = /change-?me|placeholder|your-?image|example\.com/i;

  function isPlaceholderAsset(value) {
    if (value == null) return true;
    const trimmed = String(value).trim();
    return !trimmed || PLACEHOLDER_IMAGE_RE.test(trimmed);
  }

  function isSafeImageUrl(url) {
    if (isPlaceholderAsset(url)) return false;
    const trimmed = String(url).trim();
    if (/^https?:\/\//i.test(trimmed)) return true;
    if (/^(images\/|\.\/)/.test(trimmed)) return true;
    if (!trimmed.includes("://") && !trimmed.startsWith("data:")) return true;
    return false;
  }

  function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function formatStatValue(value) {
    if (typeof value !== "number" || isNaN(value) || value < 0) return "0";
    if (value > 9999) return "9999+";
    return String(Math.floor(value));
  }

  function clampFraction(value) {
    const num = Number(value);
    if (isNaN(num)) return 0;
    return Math.min(1, Math.max(0, num));
  }

  function enableBackgroundFallback() {
    const bg = document.getElementById("background");
    if (bg) bg.classList.add("background--fallback");
  }

  const THEME_VAR_MAP = {
    accent: "--accent",
    accent_rgb: "--accent-rgb",
    background: "--background",
    glass_bg: "--glass-bg",
    glass_border: "--glass-border",
    glass_highlight: "--glass-highlight",
    text_primary: "--text-primary",
    text_secondary: "--text-secondary",
    stats_gradient_start: "--stats-gradient-start",
    stats_gradient_mid: "--stats-gradient-mid",
    stats_gradient_end: "--stats-gradient-end",
    police: "--stat-police",
    police_rgb: "--stat-police-rgb",
    ems: "--stat-ems",
    ems_rgb: "--stat-ems-rgb",
    mechanic: "--stat-mechanic",
    mechanic_rgb: "--stat-mechanic-rgb",
    staff_stat: "--stat-staff",
    staff_stat_rgb: "--stat-staff-rgb",
    connecting: "--stat-connecting",
    connecting_rgb: "--stat-connecting-rgb",
    tab_inactive_bg: "--tab-inactive-bg",
    tab_inactive_text: "--tab-inactive-text",
    tab_active_bg: "--tab-active-bg",
    tab_active_text: "--tab-active-text",
    tab_active_border: "--tab-active-border",
    list_item_bg: "--list-item-bg",
    list_item_border: "--list-item-border",
    list_item_hover_bg: "--list-item-hover-bg",
    owner_card_bg: "--owner-card-bg",
    owner_card_border: "--owner-card-border",
  };

  function applyTheme(theme) {
    if (!theme) return;

    Object.keys(THEME_VAR_MAP).forEach(function (key) {
      const value = theme[key];
      if (value != null && value !== "") {
        document.documentElement.style.setProperty(THEME_VAR_MAP[key], value);
      }
    });
  }

  function applyConfig(cfg) {
    document.documentElement.style.setProperty(
      "--bg-transition",
      ((cfg.backgroundTransition || 1500) / 1000) + "s"
    );
    const serverNameEl = document.getElementById("server-name");
    if (serverNameEl) {
      serverNameEl.textContent = cfg.serverName || "Midnight Chronicles";
    }
    document.title = (cfg.serverName || "Midnight Chronicles") + " — Loading";
  }

  function getTheme() {
    if (window.nuiHandoverData && window.nuiHandoverData.theme) {
      return window.nuiHandoverData.theme;
    }
    return null;
  }

  function getTracks(cfg) {
    const mode = (cfg.sound || "mp3").toLowerCase();
    const ext = mode === "mp4" ? ".mp4" : ".mp3";
    const raw = (cfg.tracks || []).slice(0, 2);

    return raw
      .map(function (entry) {
        let file = "";
        let title = "";

        if (typeof entry === "string") {
          file = entry;
        } else if (entry && entry.file) {
          file = entry.file;
          title = entry.title || "";
        }

        file = file.replace(/^sound\//, "");
        if (!file) return null;

        const src = "sound/" + file;
        const fallbackTitle = file.replace(/\.[^.]+$/, "");

        return {
          src: src,
          title: title || fallbackTitle,
        };
      })
      .filter(function (track) {
        return track && track.src.toLowerCase().endsWith(ext);
      });
  }

  function initSlideshow(cfg) {
    const images = (cfg.backgroundImages || []).filter(isSafeImageUrl);
    let currentIndex = 0;
    let activeLayer = "a";
    let timer = null;
    const failedUrls = {};

    const layerA = document.getElementById("bg-layer-a");
    const layerB = document.getElementById("bg-layer-b");

    function activeEl() {
      return activeLayer === "a" ? layerA : layerB;
    }

    function inactiveEl() {
      return activeLayer === "a" ? layerB : layerA;
    }

    function preload(url) {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { resolve(url); };
        img.onerror = function () { reject(url); };
        img.referrerPolicy = "no-referrer";
        img.src = url;
      });
    }

    function setBackground(el, url) {
      if (!el || !url) return;
      el.style.backgroundImage = "url(" + JSON.stringify(String(url)) + ")";
    }

    function stopSlideshow() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function allImagesFailed() {
      return images.length > 0 && Object.keys(failedUrls).length >= images.length;
    }

    function show(index) {
      if (!images.length || allImagesFailed()) {
        enableBackgroundFallback();
        stopSlideshow();
        return;
      }

      const url = images[index];
      if (failedUrls[url]) {
        advance();
        return;
      }

      const next = inactiveEl();
      const curr = activeEl();
      if (!next || !curr) return;

      preload(url)
        .then(function (loaded) {
          setBackground(next, loaded);
          next.classList.add("active");
          curr.classList.remove("active");
          activeLayer = activeLayer === "a" ? "b" : "a";
        })
        .catch(function () {
          failedUrls[url] = true;
          if (allImagesFailed()) {
            enableBackgroundFallback();
            stopSlideshow();
            return;
          }
          advance();
        });
    }

    function advance() {
      if (!images.length || allImagesFailed()) return;
      currentIndex = (currentIndex + 1) % images.length;
      show(currentIndex);
    }

    if (!images.length) {
      enableBackgroundFallback();
      return;
    }

    if (!layerA) return;

    setBackground(layerA, images[0]);
    layerA.classList.add("active");

    preload(images[0]).catch(function () {
      failedUrls[images[0]] = true;
      if (allImagesFailed()) {
        enableBackgroundFallback();
        return;
      }
      advance();
    });

    if (images.length > 1) {
      timer = setInterval(advance, cfg.backgroundInterval || 8000);
    }
  }

  function createAvatar(image, name) {
    const safeName = String(name || "Staff member").trim() || "Staff member";

    if (!isPlaceholderAsset(image)) {
      const img = document.createElement("img");
      img.className = "avatar";
      img.src = String(image).trim();
      img.alt = safeName;
      img.referrerPolicy = "no-referrer";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = function () {
        img.replaceWith(createFallback(safeName));
      };
      return img;
    }
    return createFallback(safeName);
  }

  function createFallback(name) {
    const div = document.createElement("div");
    div.className = "avatar-fallback";
    div.setAttribute("aria-hidden", "true");
    div.textContent = getInitials(name);
    return div;
  }

  function createMemberInfo(name, role) {
    const info = document.createElement("div");
    info.className = "member-info";

    const safeName = String(name || "Unknown").trim() || "Unknown";
    const safeRole = String(role || "").trim();

    const nameEl = document.createElement("div");
    nameEl.className = "member-name";
    nameEl.textContent = safeName;
    if (safeName.length > 24) {
      nameEl.title = safeName;
    }

    info.appendChild(nameEl);

    if (safeRole) {
      const badge = document.createElement("span");
      badge.className = "role-badge";
      badge.textContent = safeRole;
      if (safeRole.length > 28) {
        badge.title = safeRole;
      }
      info.appendChild(badge);
    }

    return info;
  }

  function getOwners(cfg) {
    if (Array.isArray(cfg.owners) && cfg.owners.length) {
      return cfg.owners.slice(0, 2).filter(function (member) {
        return member && member.name;
      });
    }

    if (cfg.owner && cfg.owner.name) {
      return [cfg.owner];
    }

    return [];
  }

  function createInfoCard(entry, showDate) {
    const card = document.createElement("article");
    card.className = "info-card";
    if (entry.current) {
      card.classList.add("info-card-current");
    }

    const header = document.createElement("div");
    header.className = "info-card-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "info-card-title-wrap";

    const title = document.createElement("h3");
    title.className = "info-card-title";
    title.textContent = entry.title || "Untitled update";
    if (entry.title && entry.title.length > 48) {
      title.title = entry.title;
    }
    titleWrap.appendChild(title);

    if (entry.current) {
      const current = document.createElement("span");
      current.className = "info-card-current-badge";
      current.textContent = "Latest";
      titleWrap.appendChild(current);
    }

    header.appendChild(titleWrap);

    if (showDate && entry.date) {
      const date = document.createElement("span");
      date.className = "info-card-date";
      date.textContent = entry.date;
      header.appendChild(date);
    }

    const text = document.createElement("p");
    text.className = "info-card-text";
    text.textContent = entry.text || "";

    card.appendChild(header);
    card.appendChild(text);
    return card;
  }

  function getUpdateEntries(cfg) {
    const items = (cfg.updates || []).filter(function (entry) {
      return entry && typeof entry === "object" && (entry.title || entry.text);
    });

    if (!items.length) return items;

    const hasCurrent = items.some(function (entry) {
      return entry.current === true;
    });

    if (!hasCurrent) {
      return items.map(function (entry, index) {
        if (index === 0) {
          return Object.assign({}, entry, { current: true });
        }
        return entry;
      });
    }

    return items;
  }

  function renderVersionBanner(el, version, show) {
    if (!el) return;

    if (show && version) {
      el.textContent = "Server version " + version;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
  }

  function renderInfoList(container, items, showDate, emptyMessage) {
    container.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "panel-empty";
      empty.textContent = emptyMessage;
      container.appendChild(empty);
      return;
    }

    items.forEach(function (entry) {
      if (!entry || (!entry.title && !entry.text)) return;
      container.appendChild(createInfoCard(entry, showDate));
    });
  }

  function initPanelTabs() {
    const tabs = Array.prototype.slice.call(document.querySelectorAll(".panel-tab"));
    const views = Array.prototype.slice.call(document.querySelectorAll(".panel-view"));

    function activateTab(tab) {
      const target = tab.getAttribute("data-tab");
      if (!target) return;

      tabs.forEach(function (t) {
        const selected = t === tab;
        t.classList.toggle("active", selected);
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
      });

      views.forEach(function (view) {
        const isActive = view.getAttribute("data-panel") === target;
        view.classList.toggle("active", isActive);
        view.hidden = !isActive;
        view.tabIndex = isActive ? 0 : -1;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab);
      });

      tab.addEventListener("keydown", function (event) {
        let nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          event.preventDefault();
          nextIndex = 0;
        } else if (event.key === "End") {
          event.preventDefault();
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex]);
      });
    });
  }

  function initRulesOnboarding() {
    const rulesTab = document.getElementById("tab-rules");
    const badge = document.getElementById("tab-rules-badge");
    const RULES_SEEN_KEY = "midnight_rules_seen";
    if (!rulesTab) return;

    let seen = false;
    try {
      seen = localStorage.getItem(RULES_SEEN_KEY) === "1";
    } catch (err) {
      // localStorage unavailable in some embedded contexts
    }

    let cleared = false;
    function clearNudge() {
      if (cleared) return;
      cleared = true;
      rulesTab.classList.remove("panel-tab--nudge");
      if (badge) badge.classList.add("hidden");
      try {
        localStorage.setItem(RULES_SEEN_KEY, "1");
      } catch (err) {
        // ignore
      }
    }

    if (!seen) {
      rulesTab.classList.add("panel-tab--nudge");
      if (badge) badge.classList.remove("hidden");
    } else {
      cleared = true;
    }

    // Focus covers keyboard tab activation (arrow-key roving focuses before activating)
    rulesTab.addEventListener("click", clearNudge);
    rulesTab.addEventListener("focus", clearNudge);
  }

  function initStaff(cfg) {
    const ownerList = document.getElementById("owner-list");
    const staffList = document.getElementById("staff-list");
    const divider = document.getElementById("staff-divider");
    const rulesList = document.getElementById("rules-list");
    const updatesList = document.getElementById("updates-list");
    const versionBanner = document.getElementById("updates-version-banner");
    const owners = getOwners(cfg);

    initPanelTabs();
    initRulesOnboarding();
    renderVersionBanner(
      versionBanner,
      cfg.updateVersion,
      cfg.showServerVersion !== false
    );

    if (!owners.length) {
      ownerList.classList.add("hidden");
    } else {
      owners.forEach(function (member) {
        const card = document.createElement("div");
        card.className = "owner-card";
        card.appendChild(createAvatar(member.image, member.name));
        card.appendChild(createMemberInfo(member.name, member.role));
        ownerList.appendChild(card);
      });
    }

    const staff = (cfg.staff || []).filter(function (member) {
      return member && member.name;
    });
    if (!staff.length) {
      if (divider) divider.classList.add("hidden");
      const emptyStaff = document.createElement("p");
      emptyStaff.className = "panel-empty";
      emptyStaff.textContent = "No staff listed yet. Ask in Discord if you need help.";
      staffList.appendChild(emptyStaff);
    } else {
      staff.forEach(function (member) {
        const item = document.createElement("div");
        item.className = "staff-item";
        item.appendChild(createAvatar(member.image, member.name));
        item.appendChild(createMemberInfo(member.name, member.role));
        staffList.appendChild(item);
      });
    }

    renderInfoList(
      rulesList,
      cfg.rules || [],
      false,
      "No rules posted yet. Open Updates for server news."
    );

    renderInfoList(
      updatesList,
      getUpdateEntries(cfg),
      true,
      "No updates yet. New patches show up here after restarts."
    );
  }

  function initMediaPlayer(cfg) {
    const mode = (cfg.sound || "mp3").toLowerCase();
    const isVideo = mode === "mp4";
    const tracks = getTracks(cfg);
    const VOLUME_KEY = "midnight_loadingscreen_volume";
    const MUTED_KEY = "midnight_loadingscreen_muted";

    function loadVolumePrefs() {
      const defaultPct = Math.min(100, Math.max(0, cfg.defaultVolume != null ? cfg.defaultVolume : 70));
      let vol = defaultPct / 100;
      let muted = false;

      try {
        const stored = localStorage.getItem(VOLUME_KEY);
        if (stored !== null) {
          const parsed = Number(stored);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            vol = parsed / 100;
          }
        }
        if (localStorage.getItem(MUTED_KEY) === "1") {
          muted = true;
        }
      } catch (err) {
        // localStorage unavailable in some embedded contexts
      }

      return {
        volume: vol,
        lastVolume: vol > 0 ? vol : defaultPct / 100,
        isMuted: muted,
      };
    }

    const prefs = loadVolumePrefs();
    let currentIndex = 0;
    let isPlaying = false;
    let activeEl = null;
    let volume = prefs.volume;
    let lastVolume = prefs.lastVolume;
    let isMuted = prefs.isMuted;

    const container = document.getElementById("media-player");
    const mediaWrap = document.getElementById("media-container");
    const audioVisual = document.getElementById("audio-visual");
    const audioLabel = document.getElementById("audio-label");
    const audioHint = document.getElementById("audio-hint");
    const btnPrev = document.getElementById("btn-prev");
    const btnPlay = document.getElementById("btn-play");
    const btnNext = document.getElementById("btn-next");
    const counter = document.getElementById("video-counter");
    const fallback = document.getElementById("video-fallback");
    const panel = document.getElementById("video-panel");
    const iconPlay = btnPlay.querySelector(".icon-play");
    const iconPause = btnPlay.querySelector(".icon-pause");
    const btnMute = document.getElementById("btn-mute");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeValue = document.getElementById("volume-value");
    const iconVolume = btnMute ? btnMute.querySelector(".icon-volume") : null;
    const iconMuted = btnMute ? btnMute.querySelector(".icon-muted") : null;

    panel.classList.toggle("audio-mode", !isVideo);
    panel.classList.toggle("video-mode", isVideo);
    audioVisual.classList.toggle("hidden", isVideo);
    if (audioHint) audioHint.classList.add("hidden");

    function updateCounter() {
      if (!counter) return;
      const current = tracks.length ? currentIndex + 1 : 0;
      const total = tracks.length;
      counter.textContent = total ? current + " / " + total : "0 / 0";
      counter.classList.toggle("hidden", total <= 1);
      counter.setAttribute(
        "aria-label",
        total ? "Track " + current + " of " + total : "No tracks"
      );
    }

    function setPlayState(playing) {
      isPlaying = playing;
      panel.classList.toggle("is-playing", playing);
      iconPlay.classList.toggle("hidden", playing);
      iconPause.classList.toggle("hidden", !playing);
      if (btnPlay) {
        btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
      }
    }

    function getVolumePercent() {
      return Math.round((isMuted ? 0 : volume) * 100);
    }

    function updateVolumeSliderFill() {
      if (!volumeSlider) return;
      const pct = getVolumePercent();
      volumeSlider.style.background =
        "linear-gradient(to right, var(--accent) 0%, var(--accent) " + pct +
        "%, rgba(255, 255, 255, 0.12) " + pct + "%, rgba(255, 255, 255, 0.12) 100%)";
    }

    function updateVolumeUI() {
      const pct = getVolumePercent();
      if (volumeSlider) volumeSlider.value = String(pct);
      if (volumeValue) volumeValue.textContent = pct + "%";
      if (iconVolume) iconVolume.classList.toggle("hidden", isMuted || pct === 0);
      if (iconMuted) iconMuted.classList.toggle("hidden", !isMuted && pct > 0);
      updateVolumeSliderFill();
    }

    function saveVolumePrefs() {
      try {
        const level = lastVolume > 0 ? lastVolume : volume;
        localStorage.setItem(VOLUME_KEY, String(Math.round(level * 100)));
        localStorage.setItem(MUTED_KEY, isMuted ? "1" : "0");
      } catch (err) {
        // ignore
      }
    }

    function applyVolume() {
      if (activeEl) {
        activeEl.volume = isMuted ? 0 : volume;
      }
      updateVolumeUI();
    }

    function setVolumeLevel(nextVolume) {
      volume = Math.min(1, Math.max(0, nextVolume));
      if (volume > 0) {
        lastVolume = volume;
        isMuted = false;
      } else {
        isMuted = true;
      }
      saveVolumePrefs();
      applyVolume();
    }

    function showFallback(msg) {
      fallback.textContent = "";
      const p = document.createElement("p");
      p.textContent = msg || "This track couldn't load.";
      fallback.appendChild(p);
      fallback.classList.remove("hidden");
    }

    function hideFallback() {
      fallback.classList.add("hidden");
    }

    function clearPlayer() {
      if (activeEl) {
        activeEl.pause();
        activeEl.removeAttribute("src");
        activeEl.load();
      }
      container.innerHTML = "";
      activeEl = null;
    }

    function onEnded() {
      if (tracks.length > 1) {
        loadTrack(currentIndex + 1, true);
      } else {
        setPlayState(false);
      }
    }

    function loadTrack(index, autoplay) {
      if (!tracks.length) return;

      currentIndex = ((index % tracks.length) + tracks.length) % tracks.length;
      const track = tracks[currentIndex];

      clearPlayer();
      hideFallback();

      if (!isVideo) {
        audioLabel.textContent = track.title;
        audioLabel.title = track.title;
      }

      const el = document.createElement(isVideo ? "video" : "audio");
      el.src = track.src;
      el.preload = "auto";
      el.muted = false;
      el.volume = isMuted ? 0 : volume;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", function () {
        showFallback("Couldn't load this track. Try the next one.");
        setPlayState(false);
      });
      el.addEventListener("playing", function () {
        hideFallback();
        setPlayState(true);
      });

      container.appendChild(el);
      activeEl = el;
      updateCounter();

      function tryPlay() {
        if (!activeEl) return;
        const promise = activeEl.play();
        if (promise) {
          promise.catch(function () {
            setPlayState(false);
            if (audioHint) {
              audioHint.textContent = "Press play to start the music";
              audioHint.classList.remove("hidden");
            }
          });
        }
      }

      if (autoplay !== false) {
        if (el.readyState >= 2) {
          tryPlay();
        } else {
          el.addEventListener("canplay", tryPlay, { once: true });
        }
      } else {
        setPlayState(false);
      }
    }

    function startWithSound() {
      if (!activeEl) return;
      if (audioHint) audioHint.classList.add("hidden");
      activeEl.muted = false;
      activeEl.play().then(function () {
        setPlayState(true);
      }).catch(function () {
        setPlayState(false);
        if (audioHint) {
          audioHint.textContent = "Press play to start the music";
          audioHint.classList.remove("hidden");
        }
      });
    }

    function bindControls() {
      const canSkip = tracks.length > 1;

      if (btnPrev) {
        btnPrev.disabled = !canSkip;
        btnPrev.setAttribute("aria-disabled", canSkip ? "false" : "true");
      }
      if (btnNext) {
        btnNext.disabled = !canSkip;
        btnNext.setAttribute("aria-disabled", canSkip ? "false" : "true");
      }

      btnPrev.addEventListener("click", function () {
        if (tracks.length < 2) return;
        loadTrack(currentIndex - 1, true);
      });

      btnNext.addEventListener("click", function () {
        if (tracks.length < 2) return;
        loadTrack(currentIndex + 1, true);
      });

      btnPlay.addEventListener("click", function () {
        if (!activeEl) return;
        if (isPlaying) {
          activeEl.pause();
          setPlayState(false);
        } else {
          startWithSound();
        }
      });

      if (volumeSlider) {
        volumeSlider.addEventListener("input", function () {
          setVolumeLevel(Number(volumeSlider.value) / 100);
        });
      }

      if (btnMute) {
        btnMute.addEventListener("click", function () {
          if (isMuted) {
            isMuted = false;
            volume = lastVolume > 0 ? lastVolume : 0.7;
          } else {
            isMuted = true;
            lastVolume = volume > 0 ? volume : lastVolume;
            volume = 0;
          }
          saveVolumePrefs();
          applyVolume();
        });
      }

      const shortcutHint = document.getElementById("shortcut-hint");
      const SHORTCUTS_KEY = "midnight_shortcuts_used";
      let shortcutsUsed = false;
      try {
        shortcutsUsed = localStorage.getItem(SHORTCUTS_KEY) === "1";
      } catch (err) {
        // localStorage unavailable in some embedded contexts
      }
      if (shortcutHint && !shortcutsUsed) {
        shortcutHint.classList.remove("hidden");
      }

      function dismissShortcutHint() {
        if (shortcutsUsed) return;
        shortcutsUsed = true;
        if (shortcutHint) shortcutHint.classList.add("hidden");
        try {
          localStorage.setItem(SHORTCUTS_KEY, "1");
        } catch (err) {
          // ignore
        }
      }

      function isMusicFocused() {
        const active = document.activeElement;
        return !!(active && panel.contains(active));
      }

      document.addEventListener("keydown", function (event) {
        const active = document.activeElement;
        if (active) {
          const tag = active.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable) {
            return;
          }
        }
        if (panel.classList.contains("hidden")) return;
        if (!isMusicFocused()) return;

        if (event.code === "Space") {
          event.preventDefault();
          btnPlay.click();
          dismissShortcutHint();
        } else if (event.code === "ArrowLeft" && tracks.length > 1) {
          event.preventDefault();
          btnPrev.click();
          dismissShortcutHint();
        } else if (event.code === "ArrowRight" && tracks.length > 1) {
          event.preventDefault();
          btnNext.click();
          dismissShortcutHint();
        } else if (event.key === "m" || event.key === "M") {
          if (btnMute) btnMute.click();
          dismissShortcutHint();
        }
      });
    }

    if (!tracks.length) {
      panel.classList.add("hidden");
      return;
    }

    updateCounter();
    updateVolumeUI();
    bindControls();
    loadTrack(0, true);
  }

  function initServerStats() {
    const statKeys = ["players", "police", "ems", "mechanic", "staff", "connecting"];
    const elements = {};
    const displayed = {};
    const animFrames = {};
    const statsBar = document.getElementById("stats-bar");
    const statsLiveRegion = document.getElementById("stats-live-region");
    let statsReady = false;
    let lastAnnouncedGlance = { players: null, connecting: null };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COUNT_DURATION_MS = 650;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    statKeys.forEach(function (key) {
      const el = document.getElementById("stat-" + key);
      elements[key] = {
        el: el,
        wrap: el ? el.closest(".stats-value-wrap") : null,
      };
      displayed[key] = null;
    });

    function clearStatPending(key) {
      const entry = elements[key];
      if (!entry || !entry.el) return;
      if (entry.el.classList.contains("stats-pending")) {
        entry.el.classList.remove("stats-pending");
        entry.el.removeAttribute("aria-busy");
        displayed[key] = null;
      }
    }

    function animateStatValue(key, target) {
      const entry = elements[key];
      if (!entry || !entry.el) return;

      clearStatPending(key);

      const wrap = entry.wrap;
      const el = entry.el;
      const isFirstRender = displayed[key] === null;

      if (animFrames[key]) {
        cancelAnimationFrame(animFrames[key]);
        animFrames[key] = null;
        const mid = parseInt(el.textContent, 10);
        if (!isNaN(mid)) {
          displayed[key] = mid;
        } else {
          displayed[key] = 0;
        }
      }

      const from = isFirstRender ? 0 : displayed[key];
      if (!isFirstRender && from === target) return;

      if (reducedMotion || from === target) {
        el.textContent = formatStatValue(target);
        displayed[key] = target;
        return;
      }

      if (wrap) {
        wrap.classList.remove("stats-value-settled");
        wrap.classList.add("stats-value-changing");
      }

      const start = performance.now();

      function frame(now) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / COUNT_DURATION_MS);
        const eased = easeOutCubic(t);
        const current = Math.round(from + (target - from) * eased);

        el.textContent = formatStatValue(current);

        if (t < 1) {
          animFrames[key] = requestAnimationFrame(frame);
          return;
        }

        el.textContent = formatStatValue(target);
        displayed[key] = target;
        animFrames[key] = null;

        if (wrap) {
          wrap.classList.remove("stats-value-changing");
          wrap.classList.add("stats-value-settled");
          setTimeout(function () {
            wrap.classList.remove("stats-value-settled");
          }, 500);
        }

        const item = el.closest(".stats-item");
        if (item && from !== target) {
          item.classList.add("stats-updated");
          setTimeout(function () {
            item.classList.remove("stats-updated");
          }, 550);
        }
      }

      animFrames[key] = requestAnimationFrame(frame);
    }

    function announceStats(stats, isFirst) {
      if (!statsLiveRegion || !stats) return;

      const players = typeof stats.players === "number" && !isNaN(stats.players) ? stats.players : 0;
      const connecting = typeof stats.connecting === "number" && !isNaN(stats.connecting) ? stats.connecting : 0;

      if (isFirst) {
        lastAnnouncedGlance = { players: players, connecting: connecting };
        let message;
        if (players > 0) {
          message = formatStatValue(players) + " already in the city";
        } else {
          message = "You're first in line — city is warming up";
        }
        if (connecting > 0) {
          message += ", " + formatStatValue(connecting) + " connecting";
        }
        message += ".";
        statsLiveRegion.textContent = message;
        return;
      }

      if (
        players === lastAnnouncedGlance.players &&
        connecting === lastAnnouncedGlance.connecting
      ) {
        return;
      }

      lastAnnouncedGlance = { players: players, connecting: connecting };

      let update = formatStatValue(players) + " online";
      if (connecting > 0) {
        update += ", " + formatStatValue(connecting) + " connecting";
      }
      statsLiveRegion.textContent = update + ".";
    }

    function applyStats(stats) {
      if (!stats) return;

      const isFirst = !statsReady;

      if (isFirst) {
        statsReady = true;
        if (statsBar) {
          statsBar.setAttribute("aria-busy", "false");
          statsBar.classList.add("stats-bar--ready");
        }
      }

      statKeys.forEach(function (key) {
        const raw = stats[key];
        const value = typeof raw === "number" && !isNaN(raw) ? raw : 0;
        animateStatValue(key, value);
      });

      const connectingItem = document.querySelector('.stats-item[data-stat="connecting"]');
      if (connectingItem) {
        const connectingCount = typeof stats.connecting === "number" && !isNaN(stats.connecting)
          ? stats.connecting
          : 0;
        connectingItem.classList.toggle("stats-connecting-active", connectingCount > 0);
      }

      announceStats(stats, isFirst);
    }

    function parseMessageData(raw) {
      if (!raw) return null;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch (err) {
          return null;
        }
      }
      return raw;
    }

    if (window.nuiHandoverData && window.nuiHandoverData.serverStats) {
      applyStats(window.nuiHandoverData.serverStats);
    }

    window.addEventListener("message", function (event) {
      const data = parseMessageData(event.data);
      if (!data || data.eventName !== "serverStats") return;
      applyStats(data.stats);
    });
  }

  const DEFAULT_LOADING_MESSAGES = [
    "Convincing dispatch you're not a cop...",
    "Warming up the city for your arrival...",
    "Bribing traffic lights to stay green...",
    "The loading bar is mostly for dramatic effect",
  ];

  function initProgress(cfg) {
    cfg = cfg || {};
    const fill = document.getElementById("progress-fill");
    const percent = document.getElementById("progress-percent");
    const status = document.getElementById("progress-status");
    const progressBar = document.getElementById("progress-bar");

    const messages = (cfg.loadingMessages && cfg.loadingMessages.length)
      ? cfg.loadingMessages
      : DEFAULT_LOADING_MESSAGES;
    const interval = cfg.loadingMessageInterval || 4500;

    let msgIndex = 0;
    let finished = false;

    function showMessage(index) {
      if (finished || !messages.length || !status) return;
      status.textContent = messages[index % messages.length];
    }

    function nextMessage() {
      if (finished) return;
      msgIndex = (msgIndex + 1) % messages.length;
      showMessage(msgIndex);
    }

    if (status) showMessage(0);
    const rotateTimer = setInterval(nextMessage, interval);

    function update(fraction) {
      const pct = Math.min(100, Math.max(0, Math.round(fraction * 100)));
      if (fill) fill.style.transform = "scaleX(" + (pct / 100) + ")";
      if (percent) percent.textContent = pct + "%";
      if (progressBar) progressBar.setAttribute("aria-valuenow", String(pct));

      if (pct >= 100 && !finished) {
        finished = true;
        clearInterval(rotateTimer);
        if (status) {
          status.textContent = cfg.extraDelayMessage || "Getting your character ready. You're almost in.";
        }
      }
    }

    window.addEventListener("message", function (event) {
      const data = event.data;
      if (!data || !data.eventName) return;

      if (data.eventName === "loadProgress") {
        update(clampFraction(data.loadFraction));
      }
    });

    window.addEventListener("message", function (event) {
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (err) {
          return;
        }
      }
      if (data && data.eventName === "applyTheme" && data.theme) {
        applyTheme(data.theme);
      }
    });
  }

  function boot() {
    const cfg = getConfig();
    if (!cfg) {
      document.getElementById("progress-status").textContent =
        "The loadscreen hit a snag. Ask staff to check the server setup.";
      return;
    }

    applyTheme(getTheme());
    applyConfig(cfg);
    initServerStats();
    initSlideshow(cfg);
    initStaff(cfg);
    initMediaPlayer(cfg);
    initProgress(cfg);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
