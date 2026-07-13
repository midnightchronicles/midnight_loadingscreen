Config = {}

--[[
    THEME COLOURS — edit these to rebrand the whole loadscreen.
    Use hex (#e8a838) for solid colours.
    Use "R, G, B" (no rgb()) for *_rgb values — used for transparency tints.
    Use rgba(...) strings where noted.

    Default palette: "Sodium Streetlight" — warm amber accent on asphalt night.
]]

Config.Theme = {
    -- Main accent — progress bar, active tabs, primary controls
    accent = '#e8a838',
    accent_rgb = '232, 168, 56',

    -- Full-page background behind the slideshow
    background = '#0e0c0a',

    -- Panel surfaces (stats bar, staff panel, music player)
    glass_bg = 'rgba(20, 17, 13, 0.86)',
    glass_border = 'rgba(255, 255, 255, 0.08)',
    glass_highlight = 'rgba(255, 255, 255, 0.05)',

    -- Text
    text_primary = '#f2eee8',
    text_secondary = 'rgba(242, 238, 232, 0.78)',

    -- Top stats bar (solid surface; start/mid/end can match for a flat bar)
    stats_gradient_start = 'rgba(20, 17, 13, 0.92)',
    stats_gradient_mid = 'rgba(20, 17, 13, 0.92)',
    stats_gradient_end = 'rgba(20, 17, 13, 0.92)',

    -- Stat icon colours (top HUD)
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

    -- Side panel tabs
    tab_inactive_bg = 'rgba(255, 255, 255, 0.04)',
    tab_inactive_text = 'rgba(242, 238, 232, 0.55)',
    tab_active_bg = 'rgba(232, 168, 56, 0.1)',
    tab_active_text = 'rgba(242, 238, 232, 0.92)',
    tab_active_border = 'rgba(232, 168, 56, 0.22)',

    -- Side panel list items (staff rows, rules, updates)
    list_item_bg = 'rgba(255, 255, 255, 0.03)',
    list_item_border = 'rgba(255, 255, 255, 0.08)',
    list_item_hover_bg = 'rgba(255, 255, 255, 0.05)',

    -- Owner highlight card (neutral lift — role badge carries hierarchy)
    owner_card_bg = 'rgba(255, 255, 255, 0.04)',
    owner_card_border = 'rgba(255, 255, 255, 0.1)',
}
