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

**Up to date** (server console):

```
[midnight_loadingscreen] You're up to date! Current version: 1.0.1
```

**Outdated** (server console):

```
[midnight_loadingscreen] Your current version is outdated!
[midnight_loadingscreen] Current version: 1.0.0 | Update version: 1.0.2
[midnight_loadingscreen] New update description:
[midnight_loadingscreen]   <text from the GitHub release description>
[midnight_loadingscreen] Download: https://github.com/midnightchronicles/midnight_loadingscreen/releases
```

When you publish a new release on GitHub, bump `version` in `fxmanifest.lua` after updating the resource files.

---

## Theme colours — `config.lua`

Edit **`config.lua`** at the resource root to rebrand the entire loadscreen. No CSS knowledge needed.

```lua
Config.Theme = {
    accent = '#7c5cff',           -- Progress bar, buttons, glows
    accent_rgb = '124, 92, 255',  -- Same colour as R, G, B (for transparency)

    background = '#0a0a14',       -- Page background

    glass_bg = 'rgba(12, 11, 24, 0.62)',
    glass_border = 'rgba(255, 255, 255, 0.1)',
    glass_highlight = 'rgba(255, 255, 255, 0.14)',

    text_primary = '#f0f0f5',
    text_secondary = 'rgba(240, 240, 245, 0.6)',

    -- Top stats bar
    stats_gradient_start = 'rgba(22, 18, 38, 0.78)',
    stats_gradient_mid = 'rgba(10, 10, 22, 0.55)',
    stats_gradient_end = 'rgba(16, 14, 32, 0.72)',

    -- Stat icon colours
    police = '#6ba8f7',
    police_rgb = '91, 156, 245',
    ems = '#f48fb1',
    ems_rgb = '240, 98, 146',
    mechanic = '#ffca68',
    mechanic_rgb = '255, 183, 77',
    staff_stat = '#8fd694',
    staff_stat_rgb = '129, 199, 132',
    connecting = '#4dd0e1',
    connecting_rgb = '77, 208, 225',

    -- Side panel tabs (Staff Team / Rules / Updates)
    tab_inactive_bg = 'rgba(255, 255, 255, 0.04)',
    tab_inactive_text = 'rgba(240, 240, 245, 0.55)',
    tab_active_bg = 'rgba(124, 92, 255, 0.18)',
    tab_active_text = '#7c5cff',
    tab_active_border = 'rgba(124, 92, 255, 0.45)',

    -- Side panel cards (staff, rules, updates)
    list_item_bg = 'rgba(255, 255, 255, 0.03)',
    list_item_border = 'rgba(255, 255, 255, 0.08)',
    list_item_hover_bg = 'rgba(124, 92, 255, 0.06)',
    owner_card_bg = 'rgba(124, 92, 255, 0.1)',
    owner_card_border = 'rgba(124, 92, 255, 0.25)',
}
```

Restart the resource after changing colours (`ensure midnight_loadingscreen`).

---

## Quick config — `web/config.js`

Everything except colours is in **`web/config.js`**.

### Server name

```js
serverName: "YourServerName",
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

Use the **Staff Team** tab in the left panel to view owners and staff. Long lists scroll inside the panel with a hidden scrollbar.

### Rules (unlimited)

Shown on the **Rules** tab. Add as many as you need.

```js
rules: [
  {
    title: "No Random Deathmatch",
    text: "Do not attack players without a valid roleplay reason.",
  },
  {
    title: "Respect Staff",
    text: "Listen to staff decisions and report issues properly.",
  },
],
```

### Updates (unlimited)

Shown on the **Updates** tab. `date` is optional.

```js
updates: [
  {
    title: "Housing Update",
    text: "New housing interiors and furniture options are now live.",
    date: "Jun 2026",
  },
],
```

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
| Extra time on loadscreen after 100% | `client/client.lua` | `EXTRA_DELAY_MS = 5000` — allows character selection to load behind the screen without the map showing in between |
| Advanced layout tweaks              | `web/style.css`     | Only needed for structural changes; colours are in `config.lua` |

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
