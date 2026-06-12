local EXTRA_DELAY_MS = 5000

local REQUEST_INTERVAL_MS = 2500

local function sendStatsToLoadscreen(stats)
    if not stats then return end

    SendLoadingScreenMessage(json.encode({
        eventName = 'serverStats',
        stats = stats,
    }))
end

RegisterNetEvent('midnight_loadingscreen:updateStats', sendStatsToLoadscreen)

CreateThread(function()
    ShutdownLoadingScreen()

    while not NetworkIsSessionStarted() do
        TriggerServerEvent('midnight_loadingscreen:requestStats')
        Wait(REQUEST_INTERVAL_MS)
    end

    Wait(EXTRA_DELAY_MS)

    ShutdownLoadingScreenNui()
end)
