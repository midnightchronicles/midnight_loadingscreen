local EXTRA_DELAY_MS = 5000

local REQUEST_INTERVAL_MS = 2500

local isLoadscreenActive = true

local function sendToLoadscreen(payload)
    if not isLoadscreenActive then return end

    SendLoadingScreenMessage(json.encode(payload))
end

local function sendStatsToLoadscreen(stats)
    if not stats then return end

    sendToLoadscreen({
        eventName = 'serverStats',
        stats = stats,
    })
end

RegisterNetEvent('midnight_loadingscreen:updateStats', sendStatsToLoadscreen)

CreateThread(function()
    ShutdownLoadingScreen()

    if Config and Config.Theme then
        sendToLoadscreen({
            eventName = 'applyTheme',
            theme = Config.Theme,
        })
    end

    while not NetworkIsSessionStarted() do
        TriggerServerEvent('midnight_loadingscreen:requestStats')
        Wait(REQUEST_INTERVAL_MS)
    end

    Wait(EXTRA_DELAY_MS)

    isLoadscreenActive = false
    TriggerServerEvent('midnight_loadingscreen:loadscreenClosed')
    ShutdownLoadingScreenNui()
end)
