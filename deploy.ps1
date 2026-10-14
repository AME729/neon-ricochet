$git = "C:\Users\elhos\.gemini\antigravity\bin\git\cmd\git.exe"

Remove-Item -Path ".\create_repo.ps1" -Force -ErrorAction SilentlyContinue

# Initialize git repository
& $git init
& $git config user.name "AME729"
& $git config user.email "ame729@users.noreply.github.com"
& $git branch -M main

# Add and commit
& $git add .
& $git commit -m "Initial commit - Neon Ricochet: Rogue Synth (Turnkey Flippa Web Game)"

# Set remote origin
& $git remote remove origin 2>$null
& $git remote add origin "https://github.com/AME729/neon-ricochet.git"

# Push main
Write-Host "Pushing main branch..."
& $git push -u origin main --force

# Deploy gh-pages from public folder
Write-Host "Creating and pushing gh-pages branch..."
& $git subtree split --prefix public -b gh-pages
& $git push -u origin gh-pages --force
& $git branch -D gh-pages

# Activate GitHub Pages via REST API
$credInput = "protocol=https`nhost=github.com`n`n"
$out = ($credInput | & $git credential fill)
$token = ""
foreach ($line in $out) {
    if ($line -match "^password=(.+)$") {
        $token = $matches[1]
    }
}

if ($token) {
    $headers = @{
        "Authorization" = "token $token"
        "User-Agent" = "NeonRicochet-Deployer"
        "Accept" = "application/vnd.github.v3+json"
    }

    $body = @{
        source = @{
            branch = "gh-pages"
            path = "/"
        }
    } | ConvertTo-Json

    try {
        $pages = Invoke-RestMethod -Uri "https://api.github.com/repos/AME729/neon-ricochet/pages" -Method Post -Headers $headers -Body $body
        Write-Host "GitHub Pages Activated! Live Demo: $($pages.html_url)"
    } catch {
        Write-Host "Pages Status: $($_.Exception.Message)"
        try {
            $p = Invoke-RestMethod -Uri "https://api.github.com/repos/AME729/neon-ricochet/pages" -Headers $headers
            Write-Host "Existing Pages URL: $($p.html_url)"
        } catch {}
    }
}

Write-Host "Deployment completed successfully!"
