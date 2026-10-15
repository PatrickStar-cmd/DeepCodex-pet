# Install the native Codex pet without changing the active selection.
[CmdletBinding()]
param(
    [string]$CodexHome = $(if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }),
    [switch]$StaticIdle
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $repoRoot 'pet.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.spriteVersionNumber -ne 2 -or [string]::IsNullOrWhiteSpace($manifest.displayName) -or $manifest.spritesheetPath -ne 'assets/spritesheet.png') {
    throw 'The manifest must describe a named v2 pet with assets/spritesheet.png.'
}
$selectedSpritePath = $manifest.spritesheetPath
$selectedSha256 = $manifest.sha256
if ($StaticIdle) {
    if ([string]::IsNullOrWhiteSpace($manifest.staticSpritesheetPath) -or [string]::IsNullOrWhiteSpace($manifest.staticSha256)) {
        throw 'This package has no static-idle variant.'
    }
    $selectedSpritePath = $manifest.staticSpritesheetPath
    $selectedSha256 = $manifest.staticSha256
}
$spritePath = Join-Path $repoRoot $selectedSpritePath
$spriteBytes = [IO.File]::ReadAllBytes($spritePath)
$signature = [BitConverter]::ToString($spriteBytes, 0, 8)
$width = [uint32]$spriteBytes[16] * 16777216 + [uint32]$spriteBytes[17] * 65536 + [uint32]$spriteBytes[18] * 256 + $spriteBytes[19]
$height = [uint32]$spriteBytes[20] * 16777216 + [uint32]$spriteBytes[21] * 65536 + [uint32]$spriteBytes[22] * 256 + $spriteBytes[23]
if ($signature -ne '89-50-4E-47-0D-0A-1A-0A' -or $width -ne 1536 -or $height -ne 2288 -or $spriteBytes[25] -ne 6) {
    throw 'Expected a 1536 x 2288 RGBA PNG.'
}
if ((Get-FileHash -LiteralPath $spritePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $selectedSha256) {
    throw 'Sprite SHA-256 does not match pet.json. Run node scripts/validate-dot.mjs.'
}
$petDirectory = Join-Path ([IO.Path]::GetFullPath($CodexHome)) 'pets/deepcodex-lanlan'
$installedManifest = Join-Path $petDirectory 'pet.json'
# Preserve the stable directory ID across display-name changes.
if (Test-Path -LiteralPath $installedManifest) {
    $backupDirectory = Join-Path $petDirectory ('backups/' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    Copy-Item -LiteralPath $installedManifest -Destination (Join-Path $backupDirectory 'pet.json')
    $installedSprite = Join-Path $petDirectory 'assets/spritesheet.png'
    if (Test-Path -LiteralPath $installedSprite) {
        Copy-Item -LiteralPath $installedSprite -Destination (Join-Path $backupDirectory 'spritesheet.png')
    }
}
New-Item -ItemType Directory -Path (Join-Path $petDirectory 'assets') -Force | Out-Null
Copy-Item -LiteralPath $spritePath -Destination (Join-Path $petDirectory 'assets/spritesheet.png') -Force
$nativeManifest = [ordered]@{
    displayName = $manifest.displayName
    description = $manifest.description
    spriteVersionNumber = $manifest.spriteVersionNumber
    spritesheetPath = $manifest.spritesheetPath
}
$json = ($nativeManifest | ConvertTo-Json) + [Environment]::NewLine
[IO.File]::WriteAllText($installedManifest, $json, [Text.UTF8Encoding]::new($false))
$stored = Get-Content -LiteralPath $installedManifest -Raw -Encoding UTF8 | ConvertFrom-Json
if ($stored.displayName -ne $manifest.displayName -or (Get-FileHash -LiteralPath (Join-Path $petDirectory $stored.spritesheetPath) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $selectedSha256) {
    throw 'Installed pet verification failed.'
}
Write-Output "Installed: $($stored.displayName)"
Write-Output "Idle animation: $(if ($StaticIdle) { 'Static compatibility' } else { 'Smooth APNG when provided by this package' })"
Write-Output "Pet ID: custom:deepcodex-lanlan"
Write-Output "Directory: $petDirectory"
Write-Output 'Choose this pet in Codex Pets settings, then choose Pet for the dot appearance.'
