
$ErrorActionPreference = "SilentlyContinue"

$root = Get-Location
$output = Join-Path $root "EVENTEASE_PROJECT_SNAPSHOT.txt"

$excludeDirs = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".vite",
    "coverage"
)

$excludeFiles = @(
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml"
)

$includeExtensions = @(
    ".js", ".jsx", ".ts", ".tsx",
    ".css", ".scss",
    ".json", ".html",
    ".md", ".txt",
    ".ps1"
)

"EVENTEASE PROJECT SNAPSHOT" | Set-Content $output
"Generated: $(Get-Date)" | Add-Content $output
"Project root: $root" | Add-Content $output

"`n========== PROJECT FILE TREE ==========" | Add-Content $output

$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $relative = $_.FullName.Substring($root.Path.Length).TrimStart("\")
    $parts = $relative -split "\\"

    ($parts | Where-Object { $excludeDirs -contains $_ }).Count -eq 0 -and
    ($excludeFiles -notcontains $_.Name) -and
    ($includeExtensions -contains $_.Extension)
}

foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Path.Length).TrimStart("\")
    $relative | Add-Content $output
}

"`n========== FILE CONTENTS ==========" | Add-Content $output

foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Path.Length).TrimStart("\")

    "`n`n==================================================" | Add-Content $output
    "FILE: $relative" | Add-Content $output
    "==================================================" | Add-Content $output

    if ($file.Length -gt 300000) {
        "[SKIPPED: File larger than 300 KB]" | Add-Content $output
        continue
    }

    if ($file.Length -eq 0) {
        "[EMPTY FILE]" | Add-Content $output
        continue
    }

    Get-Content -LiteralPath $file.FullName -Raw | Add-Content $output
}

Write-Host ""
Write-Host "Project inventory generated successfully!" -ForegroundColor Green
Write-Host "Output: $output" -ForegroundColor Cyan
Write-Host "Files included: $($files.Count)"
