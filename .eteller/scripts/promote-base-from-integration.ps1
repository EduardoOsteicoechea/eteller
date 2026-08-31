# Promote base ← integration after wave close / validation.
# Usage (from workspace root):
#   .\.eteller\scripts\promote-base-from-integration.ps1
# Requires user confirmation that merges + builds + IT/smoke are done in integration/.
# Fast-forward only: refuses if base cannot ff to integration HEAD.

$ErrorActionPreference = 'Stop'
$FrameworkRoot = Split-Path -Parent $PSScriptRoot
$Root = Split-Path -Parent $FrameworkRoot
$ConfigPath = Join-Path $FrameworkRoot 'workspace.config.md'

function Get-ConfigValue([string]$key) {
    $line = Select-String -Path $ConfigPath -Pattern "^${key}:\s*(.+)$" | Select-Object -First 1
    if (-not $line) { return '' }
    return $line.Matches[0].Groups[1].Value.Trim()
}

function Get-RepoDirName([string]$repoUrl) {
    $name = $repoUrl.Trim().TrimEnd('/')
    $name = $name -replace '\.git$', ''
    return (Split-Path -Leaf $name)
}

$Repo = Get-ConfigValue 'REPO_URL'
$IntegrationBranch = Get-ConfigValue 'INTEGRATION_BRANCH'
$RepoDir = Get-RepoDirName $Repo

if ([string]::IsNullOrWhiteSpace($Repo) -or [string]::IsNullOrWhiteSpace($IntegrationBranch)) {
    throw ".eteller/workspace.config.md must set REPO_URL and INTEGRATION_BRANCH."
}

$integrationClone = Join-Path $Root "integration\$RepoDir"
$baseClone = Join-Path $Root "base\$RepoDir"

if (-not (Test-Path (Join-Path $integrationClone '.git'))) {
    throw "Missing integration clone: $integrationClone — run bootstrap-clones.ps1 first."
}
if (-not (Test-Path (Join-Path $baseClone '.git'))) {
    throw "Missing base clone: $baseClone — run bootstrap-clones.ps1 first."
}

Write-Host "Pulling integration ($IntegrationBranch)..."
Push-Location $integrationClone
git fetch origin
git checkout $IntegrationBranch
git pull --ff-only origin $IntegrationBranch
$integrationHead = (git rev-parse HEAD).Trim()
$integrationShort = (git rev-parse --short HEAD).Trim()
Pop-Location

Write-Host "Promoting base to $integrationShort ($integrationHead)..."
Push-Location $baseClone
git fetch origin
git checkout $IntegrationBranch
# Match remote + local integration tip (same branch)
git merge --ff-only $integrationHead
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "base cannot fast-forward to integration HEAD. Resolve manually; do not force mid-investigation."
}
$baseShort = (git rev-parse --short HEAD).Trim()
Pop-Location

Write-Host "PROMOTE OK: base=$baseShort == integration=$integrationShort"
Write-Host "Record history on integration/ and ask before the next wave."
