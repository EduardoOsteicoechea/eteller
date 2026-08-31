# Recreate base + wave-task clones for eteller.
# Usage (from workspace root):
#   .\.eteller\scripts\bootstrap-clones.ps1
# Requires filled .eteller/workspace.config.md
# Clone folder name = basename of REPO_URL
# Note: PowerShell vars are case-insensitive - do not use $Eteller and $eteller.

$ErrorActionPreference = 'Stop'
$FrameworkRoot = Split-Path -Parent $PSScriptRoot
$Root = Split-Path -Parent $FrameworkRoot
$ConfigPath = Join-Path $FrameworkRoot 'workspace.config.md'

if (-not (Test-Path $ConfigPath)) {
    throw "Missing .eteller/workspace.config.md - copy workspace.config.example.md and fill it in."
}

function Get-ConfigValue([string]$key) {
    $line = Select-String -Path $ConfigPath -Pattern "^${key}:\s*(.+)$" | Select-Object -First 1
    if (-not $line) { return '' }
    return $line.Matches[0].Groups[1].Value.Trim()
}

function Get-RepoDirName([string]$repoUrl) {
    $name = $repoUrl.Trim().TrimEnd('/')
    $name = $name -replace '\.git$', ''
    $name = Split-Path -Leaf $name
    if ([string]::IsNullOrWhiteSpace($name)) {
        throw "Could not derive clone folder name from REPO_URL: $repoUrl"
    }
    return $name
}

$Repo = Get-ConfigValue 'REPO_URL'
$Integration = Get-ConfigValue 'INTEGRATION_BRANCH'
$RepoDir = Get-RepoDirName $Repo

if ([string]::IsNullOrWhiteSpace($Repo) -or [string]::IsNullOrWhiteSpace($Integration)) {
    throw ".eteller/workspace.config.md must set REPO_URL and INTEGRATION_BRANCH."
}

Write-Host "REPO_DIR (from REPO_URL): $RepoDir"

function Invoke-GitQuiet {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & git @GitArgs 1>$null 2>$null
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    return $code
}

function Ensure-Clone([string]$parentDir, [string]$branch) {
    $target = Join-Path $parentDir $RepoDir
    New-Item -ItemType Directory -Force -Path $parentDir | Out-Null

    if (Test-Path (Join-Path $target '.git')) {
        Write-Host "SKIP $parentDir (exists) -> $branch"
        Push-Location $target
        $null = Invoke-GitQuiet fetch origin
        $code = Invoke-GitQuiet checkout $branch
        if ($code -ne 0) { Pop-Location; throw "git checkout $branch failed in $target" }
        $code = Invoke-GitQuiet pull --ff-only origin $branch
        if ($code -ne 0) { Pop-Location; throw "git pull failed in $target" }
        Pop-Location
        return ,$target
    }

    Write-Host "CLONE $parentDir -> $branch"
    $code = Invoke-GitQuiet clone -b $branch $Repo $target
    if ($code -ne 0) { throw "git clone failed for $branch -> $target" }
    return ,$target
}

function Seed-TaskEteller([string]$clonePath, [string]$taskId, [string]$wave, [string]$branch) {
    $cloneEteller = Join-Path $clonePath '.eteller'
    $templates = Join-Path $FrameworkRoot 'templates\task\.eteller'
    New-Item -ItemType Directory -Force -Path $cloneEteller | Out-Null
    foreach ($name in @('task.md', 'state.md', 'progress.md')) {
        $dest = Join-Path $cloneEteller $name
        if (Test-Path $dest) { continue }
        $src = Join-Path $templates $name
        if (-not (Test-Path $src)) { continue }
        $text = Get-Content $src -Raw
        $text = $text.Replace('<task-id>', $taskId).Replace('wave-N', $wave).Replace('<branch>', $branch).Replace('<repo>', $RepoDir)
        Set-Content -Path $dest -Value $text -NoNewline
    }
    $reports = Join-Path $clonePath 'Reports'
    if (-not (Test-Path $reports)) {
        New-Item -ItemType Directory -Force -Path $reports | Out-Null
    }
}

function Seed-BaseEteller([string]$clonePath) {
    $cloneEteller = Join-Path $clonePath '.eteller'
    $src = Join-Path $FrameworkRoot 'templates\base\.eteller'
    $orchPath = Join-Path $cloneEteller 'orchestration.md'
    if (-not (Test-Path $orchPath)) {
        New-Item -ItemType Directory -Force -Path $cloneEteller | Out-Null
        Copy-Item (Join-Path $src 'orchestration.md') $cloneEteller -Force
        $wavesTpl = Join-Path $src 'waves'
        if (Test-Path $wavesTpl) {
            $wavesDest = Join-Path $cloneEteller 'waves'
            if (-not (Test-Path $wavesDest)) {
                Copy-Item $wavesTpl $wavesDest -Recurse -Force
            }
        }
    }
    $history = Join-Path $cloneEteller 'history'
    if (-not (Test-Path $history)) {
        New-Item -ItemType Directory -Force -Path $history | Out-Null
        $histTpl = Join-Path $src 'history'
        if (Test-Path $histTpl) {
            Copy-Item (Join-Path $histTpl '*') $history -Force
        }
    }
    $ws = Join-Path $cloneEteller 'worksession.txt'
    if (-not (Test-Path $ws)) {
        Copy-Item (Join-Path $src 'worksession.txt') $ws -Force
    }
}

$baseParent = Join-Path $Root 'base'
$baseClone = Ensure-Clone $baseParent $Integration
Seed-BaseEteller $baseClone

Write-Host ""
Write-Host "BASE READY: $baseClone ($Integration)"
Write-Host "HARD STOP: Do not invent waves/tasks. Ask the user for their story before Plan / Branches / Materialize."
Write-Host ""

$orch = Join-Path $baseClone '.eteller\orchestration.md'
$materialized = 0
if (Test-Path $orch) {
    $rows = Get-Content $orch | Where-Object { $_ -match '^\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*wave-' }
    foreach ($row in $rows) {
        if ($row -match '^\|\s*-+') { continue }
        if ($row -match '^\|\s*id\s*\|') { continue }
        $parts = $row.Split('|') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
        if ($parts.Count -lt 5) { continue }
        $taskId = $parts[0]
        $branch = $parts[1]
        $wave = $parts[2]
        $status = $parts[4].ToLowerInvariant()
        if ($taskId -eq '<task-id>' -or $taskId -like '<*' -or $taskId -like '*(none*') { continue }
        if ($status -eq 'closed' -or $status -like 'blocked*') {
            Write-Host "SKIP $status task $taskId"
            continue
        }
        if ($branch -eq 'TBD' -or $branch -like '<*') {
            Write-Host "SKIP task $taskId (branch not assigned)"
            continue
        }
        $parent = Join-Path $Root "waves\$wave\$taskId"
        $clone = Ensure-Clone $parent $branch
        Seed-TaskEteller $clone $taskId $wave $branch
        $materialized++
    }
} else {
    Write-Host "No orchestration.md yet under base - only base was bootstrapped."
}

if ($materialized -eq 0) {
    Write-Host "No open tasks in orchestration - waves/ not materialized (awaiting user story)."
}

Write-Host 'Done.'
