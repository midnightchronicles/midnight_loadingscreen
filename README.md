# Midnight Loading Screen

Custom FiveM loadscreen with live server stats, background slideshow, music player, and staff panel.
---

## Discord
https://discord.gg/8YpYsafebn
---

## Showcase
https://www.youtube.com/watch?v=rdxRVXlv1TY
---

## DEPENDENCIES
https://github.com/TheOrderFivem/community_bridge/releases
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

## Configuration

| File | What to edit |
|------|----------------|
| **`config.lua`** | All colours / theme |
| **`web/config.js`** | Server name, images, music, staff, owners |

---

## Version checker

On server start, the resource automatically compares your installed version (`version` in `fxmanifest.lua`) against the latest [GitHub release](https://github.com/midnightchronicles/midnight_loadingscreen/releases). No config needed.

---

## Theme colours — `config.lua`

Edit **`config.lua`** at the resource root to rebrand the entire loadscreen. No CSS knowledge needed.

Restart the resource after changing colours (`ensure midnight_loadingscreen`).

---

## Quick config — `web/config.js`

Everything except colours is in **`web/config.js`**.

### Server name

```js
serverName: "YourServerName",
```

### Background images

Any public image URL or local file (if added to `fxmanifest.lua` `files`). URLs containing `CHANGE-ME` or `placeholder` are ignored; if every image fails, a solid fallback background is used instead.

```js
backgroundImages: [
  "https://your-cdn.com/image1.png",
  "https://your-cdn.com/image2.webp",
],
```

To use local images: place in `web/images/`, add `'web/images/*.png'` to `fxmanifest.lua`, then use `"images/yourfile.png"`.

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
| Extra time on loadscreen after 100% | `client/client.lua` | `EXTRA_DELAY_MS = 5000` — allows character selection to load behind the screen without the map showing in between |
| Advanced layout tweaks              | `web/style.css`     | Only needed for structural changes; colours are in `config.lua` |

---

## Troubleshooting

- **Stats show 0 or stay on "..."** — Live counts need `community_bridge` and a server restart. Job counts appear after the first stats payload.
- **Music not playing** — Confirm files exist in `web/sound/`, names match `config.js`, and restart the resource.
- **Images not loading** — Broken URLs fall back to letter avatars (staff) or a solid background (slideshow). Replace `CHANGE-ME` URLs in `config.js`.
- **Job counts wrong** — Update job name constants in `server/server.lua` to match your framework jobs.

---

## Credits

- Midnight Chronicles loading screen
- Community Bridge integration for live server stats
