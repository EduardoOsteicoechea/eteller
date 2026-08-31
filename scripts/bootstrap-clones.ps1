# Recreate base + wave-task clones for eteller.
# Usage (from eteller root):
#   .\scripts\bootstrap-clones.ps1
# Requires filled workspace.config.md
# Optional: reads base/<REPO_DIR_NAME>/.eteller/orchestration.md for open tasks

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$ConfigPath = Join-Path $Root 'workspace.config.md'

if (-not (Test-Path $ConfigPath)) {
    throw "Missing workspace.config.md — copy workspace.config.example.md and fill it in."
}

function Get-ConfigValue([string]$key) {
    $line = Select-String -Path $ConfigPath -Pattern "^${key}:\s*(.+)$" | Select-Object -First 1
    if (-not $line) { return '' }
    return $line.Matches[0].Groups[1].Value.Trim()
}

$Repo = Get-ConfigValue 'REPO_URL'
$Integration = Get-ConfigValue 'INTEGRATION_BRANCH'
$RepoDir = Get-ConfigValue 'REPO_DIR_NAME'

if ([string]::IsNullOrWhiteSpace($Repo) -or
    [string]::IsNullOrWhiteSpace($Integration) -or
    [string]::IsNullOrWhiteSpace($RepoDir)) {
    throw "workspace.config.md must set REPO_URL, INTEGRATION_BRANCH, and REPO_DIR_NAME."
}

function Ensure-Clone([string]$parentDir, [string]$branch) {
    $target = Join-Path $parentDir $RepoDir
    New-Item -ItemType Directory -Force -Path $parentDir | Out-Null

    if (Test-Path (Join-Path $target '.git')) {
        Write-Host "SKIP $parentDir (exists) -> $branch"
        Push-Location $target
        git fetch origin
        git checkout $branch
        git pull --ff-only origin $branch
        Pop-Location
        return $target
    }

    Write-Host "CLONE $parentDir -> $branch"
    git clone -b $branch $Repo $target
    return $target
}

function Seed-TaskEteller([string]$clonePath, [string]$taskId, [string]$wave, [string]$branch) {
    $eteller = Join-Path $clonePath '.eteller'
    $templates = Join-Path $Root 'templates\task\.eteller'
    if (-not (Test-Path $eteller)) {
        New-Item -ItemType Directory -Force -Path $eteller | Out-Null
        Copy-Item (Join-Path $templates '*') $eteller -Force
        foreach ($name in @('task.md', 'state.md', 'progress.md')) {
            $p = Join-Path $eteller $name
            if (Test-Path $p) {
                $text = Get-Content $p -Raw
                $text = $text.Replace('<task-id>', $taskId).Replace('wave-N', $wave).Replace('<branch>', $branch).Replace('<REPO_DIR_NAME>', $RepoDir)
                Set-Content -Path $p -Value $text -NoNewline
            }
        }
    }
    $reports = Join-Path $clonePath 'Reports'
    if (-not (Test-Path $reports)) {
        New-Item -ItemType Directory -Force -Path $reports | Out-Null
    }
}

function Seed-BaseEteller([string]$clonePath) {
    $eteller = Join-Path $clonePath '.eteller'
    if (-not (Test-Path $eteller)) {
        $src = Join-Path $Root 'templates\base\.eteller'
        New-Item -ItemType Directory -Force -Path $eteller | Out-Null
        Copy-Item (Join-Path $src 'orchestration.md') $eteller -Force
        $wavesTpl = Join-Path $src 'waves'
        if (Test-Path $wavesTpl) {
            Copy-Item $wavesTpl (Join-Path $eteller 'waves') -Recurse -Force
        }
    }
}

# Base
$baseParent = Join-Path $Root 'base'
$baseClone = Ensure-Clone $baseParent $Integration
Seed-BaseEteller $baseClone

# Open tasks from orchestration.md (simple table parser)
$orch = Join-Path $baseClone '.eteller\orchestration.md'
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
        if ($taskId -eq '<task-id>' -or $taskId -like '<*') { continue }
        if ($status -eq 'closed') {
            Write-Host "SKIP closed task $taskId"
            continue
        }
        $parent = Join-Path $Root "waves\$wave\$taskId"
        $clone = Ensure-Clone $parent $branch
        Seed-TaskEteller $clone $taskId $wave $branch
    }
} else {
    Write-Host "No orchestration.md yet under base — only base was bootstrapped."
}

Write-Host 'Done.'
