(function () {
  "use strict";

  function getConfig() {
    return typeof Config !== "undefined" ? Config : null;
  }

  function applyTheme(cfg) {
    document.documentElement.style.setProperty("--accent", cfg.accentColor);
    document.documentElement.style.setProperty("--accent-rgb", cfg.accentColorRgb);
    document.documentElement.style.setProperty(
      "--bg-transition",
      (cfg.backgroundTransition / 1000) + "s"
    );
    document.getElementById("server-name").textContent = cfg.serverName;
  }

  function getTracks(cfg) {
    const mode = (cfg.sound || "mp3").toLowerCase();
    const ext = mode === "mp4" ? ".mp4" : ".mp3";
    const raw = (cfg.tracks || []).slice(0, 2);

    if ((cfg.tracks || []).length > 2) {
      console.warn("[midnight_loadingscreen] Max 2 tracks");
    }

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
    const images = cfg.backgroundImages || [];
    let currentIndex = 0;
    let activeLayer = "a";
    let timer = null;

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
        img.src = url;
      });
    }

    function setBackground(el, url) {
      el.style.backgroundImage = 'url("' + url + '")';
    }

    function show(index) {
      if (!images.length) return;

      const url = images[index];
      const next = inactiveEl();
      const curr = activeEl();

      preload(url)
        .then(function (loaded) {
          setBackground(next, loaded);
          next.classList.add("active");
          curr.classList.remove("active");
          activeLayer = activeLayer === "a" ? "b" : "a";
        })
        .catch(function () {
          advance();
        });
    }

    function advance() {
      if (!images.length) return;
      currentIndex = (currentIndex + 1) % images.length;
      show(currentIndex);
    }

    if (!images.length) return;

    setBackground(layerA, images[0]);
    layerA.classList.add("active");

    preload(images[0]).catch(function () {
      advance();
    });

    if (images.length > 1) {
      timer = setInterval(advance, cfg.backgroundInterval || 8000);
    }
  }

  function createAvatar(image, name) {
    if (image) {
      const img = document.createElement("img");
      img.className = "avatar";
      img.src = image;
      img.alt = name;
      img.referrerPolicy = "no-referrer";
      img.onerror = function () {
        const fb = createFallback(name);
        img.replaceWith(fb);
      };
      return img;
    }
    return createFallback(name);
  }

  function createFallback(name) {
    const div = document.createElement("div");
    div.className = "avatar-fallback";
    div.textContent = (name || "?").charAt(0).toUpperCase();
    return div;
  }

  function createMemberInfo(name, role) {
    const info = document.createElement("div");
    info.className = "member-info";

    const nameEl = document.createElement("div");
    nameEl.className = "member-name";
    nameEl.textContent = name;

    const badge = document.createElement("span");
    badge.className = "role-badge";
    badge.textContent = role;

    info.appendChild(nameEl);
    info.appendChild(badge);
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

  function initStaff(cfg) {
    const ownerList = document.getElementById("owner-list");
    const ownerHeader = document.getElementById("owner-panel-header");
    const ownerTitle = document.getElementById("owner-panel-title");
    const staffList = document.getElementById("staff-list");
    const divider = document.querySelector(".staff-divider");
    const owners = getOwners(cfg);

    if (!owners.length) {
      ownerHeader.classList.add("hidden");
      ownerList.classList.add("hidden");
    } else {
      if (ownerTitle) {
        ownerTitle.textContent = owners.length > 1 ? "Owners" : "Owner";
      }

      owners.forEach(function (member) {
        const card = document.createElement("div");
        card.className = "owner-card";
        card.appendChild(createAvatar(member.image, member.name));
        card.appendChild(createMemberInfo(member.name, member.role));
        ownerList.appendChild(card);
      });
    }

    const staff = cfg.staff || [];
    if (!staff.length) {
      divider.classList.add("hidden");
      return;
    }

    staff.forEach(function (member) {
      const item = document.createElement("div");
      item.className = "staff-item";
      item.appendChild(createAvatar(member.image, member.name));
      item.appendChild(createMemberInfo(member.name, member.role));
      staffList.appendChild(item);
    });
  }

  function initMediaPlayer(cfg) {
    const mode = (cfg.sound || "mp3").toLowerCase();
    const isVideo = mode === "mp4";
    const tracks = getTracks(cfg);

    let currentIndex = 0;
    let isPlaying = false;
    let activeEl = null;

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

    panel.classList.toggle("audio-mode", !isVideo);
    panel.classList.toggle("video-mode", isVideo);
    audioVisual.classList.toggle("hidden", isVideo);
    if (audioHint) audioHint.classList.add("hidden");

    function updateCounter() {
      counter.textContent = tracks.length
        ? (currentIndex + 1) + " / " + tracks.length
        : "0 / 0";
    }

    function setPlayState(playing) {
      isPlaying = playing;
      iconPlay.classList.toggle("hidden", playing);
      iconPause.classList.toggle("hidden", !playing);
    }

    function showFallback(msg) {
      fallback.innerHTML = "<p>" + (msg || "Media unavailable") + "</p>";
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
      }

      const el = document.createElement(isVideo ? "video" : "audio");
      el.src = track.src;
      el.preload = "auto";
      el.muted = false;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", function () {
        showFallback("Could not load: " + track.src);
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
              audioHint.textContent = "Autoplay blocked - press play";
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
          audioHint.textContent = "Autoplay blocked - press play";
          audioHint.classList.remove("hidden");
        }
      });
    }

    function bindControls() {
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
    }

    if (!tracks.length) {
      panel.classList.add("hidden");
      return;
    }

    updateCounter();
    bindControls();
    loadTrack(0, true);
  }

  function initServerStats() {
    const statKeys = ["players", "police", "ems", "mechanic", "staff", "connecting"];
    const elements = {};
    const displayed = {};
    const animFrames = {};
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

    function animateStatValue(key, target) {
      const entry = elements[key];
      if (!entry || !entry.el) return;

      const wrap = entry.wrap;
      const el = entry.el;
      const isFirstRender = displayed[key] === null;

      if (animFrames[key]) {
        cancelAnimationFrame(animFrames[key]);
        animFrames[key] = null;
        const mid = parseInt(el.textContent, 10);
        if (!isNaN(mid)) {
          displayed[key] = mid;
        }
      }

      const from = isFirstRender ? 0 : displayed[key];
      if (!isFirstRender && from === target) return;

      if (reducedMotion || from === target) {
        el.textContent = String(target);
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

        el.textContent = String(current);

        if (t < 1) {
          animFrames[key] = requestAnimationFrame(frame);
          return;
        }

        el.textContent = String(target);
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

    function applyStats(stats) {
      if (!stats) return;

      statKeys.forEach(function (key) {
        const raw = stats[key];
        const value = typeof raw === "number" && !isNaN(raw) ? raw : 0;
        animateStatValue(key, value);
      });
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

  /* ── FiveM load progress ── */

  const DEFAULT_LOADING_MESSAGES = [
    "Convincing the server you're not a cop...",
    "Loading chaos... please stand by",
    "Bribing the traffic lights to stay green",
    "Don't worry, the loading bar is just dramatic",
  ];

  function initProgress(cfg) {
    cfg = cfg || {};
    const fill = document.getElementById("progress-fill");
    const percent = document.getElementById("progress-percent");
    const status = document.getElementById("progress-status");

    const messages = (cfg.loadingMessages && cfg.loadingMessages.length)
      ? cfg.loadingMessages
      : DEFAULT_LOADING_MESSAGES;
    const interval = cfg.loadingMessageInterval || 4500;

    let msgIndex = 0;
    let finished = false;

    function showMessage(index) {
      if (finished || !messages.length) return;
      status.textContent = messages[index % messages.length];
    }

    function nextMessage() {
      if (finished) return;
      msgIndex = (msgIndex + 1) % messages.length;
      showMessage(msgIndex);
    }

    showMessage(0);
    const rotateTimer = setInterval(nextMessage, interval);

    function update(fraction) {
      const pct = Math.min(100, Math.max(0, Math.round(fraction * 100)));
      fill.style.width = pct + "%";
      percent.textContent = pct + "%";

      if (pct >= 100 && !finished) {
        finished = true;
        clearInterval(rotateTimer);
        status.textContent = cfg.extraDelayMessage || "Setting up your character... hang tight!";
      }
    }

    window.addEventListener("message", function (event) {
      const data = event.data;
      if (!data || !data.eventName) return;

      if (data.eventName === "loadProgress") {
        update(data.loadFraction || 0);
      }
    });
  }

  function boot() {
    const cfg = getConfig();
    if (!cfg) {
      document.getElementById("progress-status").textContent =
        "Config error — check web/config.js for syntax mistakes.";
      return;
    }

    applyTheme(cfg);
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
