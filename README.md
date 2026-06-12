# Midnight Loading Screen

Custom FiveM loadscreen with live server stats, background slideshow, music player, and staff panel.

---

## Installation

1. Copy the `midnight_loadingscreen` folder into your server `resources` directory.
2. Add to `server.cfg`:

```cfg
ensure community_bridge # Required for live job/staff stats (start before the loadscreen)

ensure midnight_loadingscreen

# Optional — hides the default FiveM busy spinner on the loadscreen
setr sv_showBusySpinnerOnLoadingScreen false
```

3. Restart the server.

---

## Quick config — `web/config.js`

Most customization is done in **`web/config.js`**.

### Server name & theme

```js
serverName: "YourServerName",

accentColor: "#7c5cff",        // Purple accent (hex)
accentColorRgb: "124, 92, 255", // Same colour as R,G,B — used for glows
```

### Background images

Any public image URL or local file (if added to `fxmanifest.lua` `files`).

```js
backgroundImages: [
  "https://your-cdn.com/image1.png",
  "https://your-cdn.com/image2.webp",
],
```

To use local images: place in `web/images/`, add `'web/images/*.png'` to `fxmanifest.lua`, then use `"images/yourfile.png"`.

### Loading messages (quotes) — `web/script.js`

```js
loadingMessages: [
  "Hold tight, friend...",
  "Teaching peds how to jaywalk...",
  "Almost there... probably",
],
extraDelayMessage: "Setting up your character... hang tight!",
```

### Owners (1–2)

```js
owners: [
  {
    name:  "Lee Soldon",
    role:  "Owner",
    image: "https://example.com/avatar.png",
  },
  // Optional second owner (max 2):
  // {
  //   name:  "Co-Owner Name",
  //   role:  "Co-Owner",
  //   image: "https://example.com/avatar2.png",
  // },
],
```

### Staff list (unlimited)

Shown below owners in the left panel. List scrolls if there are many entries.

```js
staff: [
  {
    name:  "staff name",
    role:  "staff role",
    image: "https://example.com/staff1.png",
  },
  {
    name:  "Another Staff",
    role:  "Moderator",
    image: "https://example.com/staff2.png",
  },
],
```

> **Note:** This is your **display** staff list. The **Staff** number in the top stats bar is the live count of **admins currently online** (from Community Bridge), not this list.

---

## Music tracks

Audio must be **local files** in `web/sound/` (not external URLs).

### Step 1 — Add files

Put up to **2** tracks in `web/sound/`:

```
web/sound/track1.mp3
web/sound/track2.mp3
```

For video with sound, use `.mp4` and set `sound: "mp4"` in config. MP4 is untested — use at your own risk.

### Step 2 — Edit `web/config.js`

```js
sound: "mp3",   // "mp3" = audio only  |  "mp4" = video with sound
tracks: [
  { file: "track1.mp3", title: "Artist - Song Name" },
  { file: "track2.mp3", title: "Artist - Song Name" },
],
```

| Field   | Description                                              |
|---------|----------------------------------------------------------|
| `file`  | Filename only (e.g. `track1.mp3`) — do not include `sound/` |
| `title` | Label shown in the music player                          |

---

## Live stats bar (top)

Requires **Community Bridge** and your framework (e.g. QBX) running.

| Stat                    | Source                                              |
|-------------------------|-----------------------------------------------------|
| Online                  | Players fully loaded in the server                  |
| Police / EMS / Mechanic   | Job counts (`police`, `ambulance`, `mechanic`)      |
| Staff                   | Players with framework admin                        |
| Connecting              | Players still loading in (not fully in server yet)  |

Job names are set in `server/server.lua` if your server uses different names:

```lua
local JOB_POLICE = 'police'
local JOB_EMS = 'ambulance'
local JOB_MECHANIC = 'mechanic'
```

---

## Other tweaks

| What                               | File                 | Notes                                                                 |
|------------------------------------|----------------------|-----------------------------------------------------------------------|
| Extra time on loadscreen after 100% | `client/client.lua`  | `EXTRA_DELAY_MS = 5000` — allows character selection to load behind the screen without the map showing in between |
| Colours / layout                   | `web/style.css`      | Glass panels, stats bar, etc.                                         |

---

## Troubleshooting

- **Stats show 0 / dashes** — Ensure `community_bridge` starts before this resource. Check server console for script errors.
- **Music not playing** — Confirm files exist in `web/sound/`, names match `config.js`, and restart the resource.
- **Images not loading** — Check URL is public HTTPS, or local path is in `fxmanifest.lua` `files`.
- **Job counts wrong** — Update job name constants in `server/server.lua` to match your framework jobs.

---

## Credits

- Midnight Chronicles loading screen
- Community Bridge integration for live server stats
