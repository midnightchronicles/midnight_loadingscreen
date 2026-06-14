Config = {}

--[[
    THEME COLOURS — edit these to rebrand the whole loadscreen.
    Use hex (#7c5cff) for solid colours.
    Use "R, G, B" (no rgb()) for *_rgb values — used for glows and transparency.
    Use rgba(...) strings where noted.
]]

Config.Theme = {
    -- Main accent — progress bar, buttons, highlights, owner card
    accent = '#7c5cff',
    accent_rgb = '124, 92, 255',

    -- Full-page background behind the slideshow
    background = '#0a0a14',

    -- Glass panels (stats bar, staff panel, music player)
    glass_bg = 'rgba(12, 11, 24, 0.62)',
    glass_border = 'rgba(255, 255, 255, 0.1)',
    glass_highlight = 'rgba(255, 255, 255, 0.14)',

    -- Text
    text_primary = '#f0f0f5',
    text_secondary = 'rgba(240, 240, 245, 0.6)',

    -- Top stats bar gradient
    stats_gradient_start = 'rgba(22, 18, 38, 0.78)',
    stats_gradient_mid = 'rgba(10, 10, 22, 0.55)',
    stats_gradient_end = 'rgba(16, 14, 32, 0.72)',

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
    tab_inactive_text = 'rgba(240, 240, 245, 0.55)',
    tab_active_bg = 'rgba(124, 92, 255, 0.18)',
    tab_active_text = '#7c5cff',
    tab_active_border = 'rgba(124, 92, 255, 0.45)',

    -- Side panel list items (staff rows, rules, updates)
    list_item_bg = 'rgba(255, 255, 255, 0.03)',
    list_item_border = 'rgba(255, 255, 255, 0.08)',
    list_item_hover_bg = 'rgba(124, 92, 255, 0.06)',

    -- Owner highlight card
    owner_card_bg = 'rgba(124, 92, 255, 0.1)',
    owner_card_border = 'rgba(124, 92, 255, 0.25)',
}
