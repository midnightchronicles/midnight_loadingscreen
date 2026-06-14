fx_version 'cerulean'
game 'gta5'

author 'Midnight'
description 'Midnight Loading Screen'
version '1.0.2'

loadscreen 'web/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

shared_script 'config.lua'

-- community_bridge is optional at runtime; ensure it in server.cfg before this resource for job/staff counts

client_script 'client/client.lua'
server_scripts {
    'server/version_check.lua',
    'server/server.lua',
}

files {
    'web/index.html',
    'web/style.css',
    'web/script.js',
    'web/config.js',
    'web/sound/*.mp3',
    'web/sound/*.mp4',
}
