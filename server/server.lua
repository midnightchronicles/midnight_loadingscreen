local JOB_POLICE = 'police'
local JOB_EMS = 'ambulance'
local JOB_MECHANIC = 'mechanic'

local UPDATE_INTERVAL_MS = 1250

local Framework = nil
local ConnectingLicenses = {} -- [license] = true
local SourceToLicense = {} -- [source] = license

local function isFrameworkReady(fw)
    if not fw then return false end

    local ok, resourceName = pcall(fw.GetResourceName, fw)
    return ok and type(resourceName) == 'string' and resourceName ~= ''
end

local function getFramework()
    if Framework and isFrameworkReady(Framework) then
        return Framework
    end

    Framework = nil

    if GetResourceState('community_bridge') ~= 'started' then
        return nil
    end

    local ok, bridge = pcall(function()
        return exports['community_bridge']:Bridge()
    end)

    if not ok or not bridge or not bridge.Framework then
        return nil
    end

    local fw = bridge.Framework
    if not isFrameworkReady(fw) then
        return nil
    end

    Framework = fw
    return Framework
end

local function safeCall(fn, ...)
    local ok, result = pcall(fn, ...)
    if ok then return result end
    return nil
end

local function isPlayerLoaded(fw, src)
    if not fw or not src or src <= 0 then return false end
    return safeCall(fw.GetPlayer, fw, src) ~= nil
end

local function getConnectionKey(src)
    if not src or src <= 0 then return nil end
    return GetPlayerIdentifierByType(src, 'license')
        or GetPlayerIdentifierByType(src, 'license2')
        or GetPlayerIdentifierByType(src, 'steam')
        or GetPlayerIdentifierByType(src, 'discord')
        or ('src:' .. tostring(src))
end

local function markConnecting(src)
    local key = getConnectionKey(src)
    if not key then return end

    ConnectingLicenses[key] = true
    SourceToLicense[src] = key
end

local function clearConnecting(src)
    local key = SourceToLicense[src] or getConnectionKey(src)
    if key then
        ConnectingLicenses[key] = nil
    end
    SourceToLicense[src] = nil
end

local function safeJobCount(fw, job)
    local count = safeCall(fw.GetJobCount, fw, job)
    if type(count) == 'number' then
        return count
    end

    local players = safeCall(fw.GetPlayersByJob, fw, job)
    if type(players) ~= 'table' then
        return 0
    end

    local total = 0
    for _ in pairs(players) do
        total = total + 1
    end
    return total
end

local function collectServerStats()
    local stats = {
        players = 0,
        police = 0,
        ems = 0,
        mechanic = 0,
        staff = 0,
        connecting = 0,
    }

    local fw = getFramework()
    local connected = GetPlayers()

    if not fw then
        stats.connecting = #connected
        return stats
    end

    local countedConnecting = {}

    for i = 1, #connected do
        local src = tonumber(connected[i])
        if src then
            if isPlayerLoaded(fw, src) then
                stats.players = stats.players + 1
                clearConnecting(src)

                if safeCall(fw.GetIsFrameworkAdmin, fw, src) then
                    stats.staff = stats.staff + 1
                end
            else
                local key = getConnectionKey(src)
                if key then
                    ConnectingLicenses[key] = nil

                    if not countedConnecting[key] then
                        countedConnecting[key] = true
                        stats.connecting = stats.connecting + 1
                    end
                end
            end
        end
    end

    -- Early join phase (not in GetPlayers yet) — one count per license only
    for key, _ in pairs(ConnectingLicenses) do
        if not countedConnecting[key] then
            countedConnecting[key] = true
            stats.connecting = stats.connecting + 1
        end
    end

    stats.police = safeJobCount(fw, JOB_POLICE)
    stats.ems = safeJobCount(fw, JOB_EMS)
    stats.mechanic = safeJobCount(fw, JOB_MECHANIC)

    return stats
end

local function sendStatsToPlayer(src)
    TriggerClientEvent('midnight_loadingscreen:updateStats', src, collectServerStats())
end

local function broadcastStats()
    TriggerClientEvent('midnight_loadingscreen:updateStats', -1, collectServerStats())
end

AddEventHandler('playerConnecting', function(_, _, deferrals)
    markConnecting(source)

    deferrals.handover({
        serverStats = collectServerStats(),
        theme = Config.Theme,
    })
end)

AddEventHandler('playerDropped', function()
    clearConnecting(source)
end)

AddEventHandler('community_bridge:Server:OnPlayerLoaded', function(src)
    clearConnecting(src)
end)

RegisterNetEvent('midnight_loadingscreen:requestStats', function()
    sendStatsToPlayer(source)
end)

CreateThread(function()
    while true do
        broadcastStats()
        Wait(UPDATE_INTERVAL_MS)
    end
end)
