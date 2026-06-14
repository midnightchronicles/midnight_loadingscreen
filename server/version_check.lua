local RESOURCE_NAME = GetCurrentResourceName()
local PREFIX = ('^5[%s]^7'):format(RESOURCE_NAME)
local GITHUB_REPO = 'midnightchronicles/midnight_loadingscreen'

local function normalizeVersion(version)
    if not version or version == '' then
        return '0.0.0'
    end

    return tostring(version):gsub('^[vV]', ''):match('^%s*(.-)%s*$') or '0.0.0'
end

local function parseVersionParts(version)
    local parts = {}

    for part in normalizeVersion(version):gmatch('%d+') do
        parts[#parts + 1] = tonumber(part) or 0
    end

    if #parts == 0 then
        parts[1] = 0
    end

    return parts
end

local function compareVersions(current, latest)
    local currentParts = parseVersionParts(current)
    local latestParts = parseVersionParts(latest)
    local maxLength = math.max(#currentParts, #latestParts)

    for i = 1, maxLength do
        local currentPart = currentParts[i] or 0
        local latestPart = latestParts[i] or 0

        if currentPart < latestPart then
            return -1
        end

        if currentPart > latestPart then
            return 1
        end
    end

    return 0
end

local function getCurrentVersion()
    return normalizeVersion(GetResourceMetadata(RESOURCE_NAME, 'version', 0) or '0.0.0')
end

local function decodeHtml(text)
    if not text then return '' end

    text = text:gsub('&lt;', '<')
    text = text:gsub('&gt;', '>')
    text = text:gsub('&amp;', '&')
    text = text:gsub('&quot;', '"')
    text = text:gsub('&#39;', "'")
    text = text:gsub('<br%s*/?>', '\n')
    text = text:gsub('<[^>]+>', '')

    return text
end

local function parseAtomTimestamp(value)
    if not value then return 0 end

    local year, month, day, hour, min, sec = value:match('(%d+)%-(%d+)%-(%d+)T(%d+):(%d+):(%d+)')
    if not year then return 0 end

    return os.time({
        year = tonumber(year),
        month = tonumber(month),
        day = tonumber(day),
        hour = tonumber(hour),
        min = tonumber(min),
        sec = tonumber(sec),
    })
end

local function parseLatestRelease(xml)
    if not xml or xml == '' then return nil end

    local latestRelease = nil
    local latestUpdated = 0

    for entry in xml:gmatch('<entry>(.-)</entry>') do
        local title = entry:match('<title>([^<]+)</title>')
        local updated = entry:match('<updated>([^<]+)</updated>')
        local content = entry:match('<content[^>]*>(.-)</content>')
            or entry:match('<summary[^>]*>(.-)</summary>')
            or ''

        local updatedAt = parseAtomTimestamp(updated)
        if title and updatedAt >= latestUpdated then
            latestUpdated = updatedAt
            latestRelease = {
                version = title,
                description = decodeHtml(content),
            }
        end
    end

    return latestRelease
end

local function printReleaseDescription(body)
    if not body or body == '' then
        print(('%s ^3No release description provided.^7'):format(PREFIX))
        return
    end

    print(('%s ^3New update description:^7'):format(PREFIX))

    for line in tostring(body):gmatch('[^\r\n]+') do
        local trimmed = line:match('^%s*(.-)%s*$')
        if trimmed ~= '' then
            print(('%s   %s'):format(PREFIX, trimmed))
        end
    end
end

local function runVersionCheck()
    local currentVersion = getCurrentVersion()
    local releasesUrl = ('https://github.com/%s/releases'):format(GITHUB_REPO)
    local feedUrl = ('https://github.com/%s/releases.atom'):format(GITHUB_REPO)

    PerformHttpRequest(feedUrl, function(statusCode, response)
        if statusCode ~= 200 or not response or response == '' then
            print(('%s ^3Version check failed (HTTP %s). Skipping update check.^7'):format(
                PREFIX,
                tostring(statusCode)
            ))
            return
        end

        local release = parseLatestRelease(response)
        if not release or not release.version then
            print(('%s ^3Version check failed (no releases found). Skipping update check.^7'):format(PREFIX))
            return
        end

        local latestVersion = normalizeVersion(release.version)

        if compareVersions(currentVersion, latestVersion) >= 0 then
            print(('%s ^2You\'re up to date!^7 Current version: ^2%s^7'):format(PREFIX, currentVersion))
            return
        end

        print(('%s ^1Your current version is outdated!^7'):format(PREFIX))
        print(('%s Current version: ^1%s^7 | Update version: ^2%s^7'):format(PREFIX, currentVersion, latestVersion))
        printReleaseDescription(release.description)
        print(('%s ^3Download:^7 %s'):format(PREFIX, releasesUrl))
    end, 'GET')
end

CreateThread(function()
    Wait(500)
    runVersionCheck()
end)
