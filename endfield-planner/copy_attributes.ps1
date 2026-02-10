$source = "C:\Users\warfa\Downloads\Endfield\Оружия"
$dest = "C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\weapons"

Get-ChildItem -Path $source -Directory | ForEach-Object {
    $weaponName = $_.Name
    $destFolder = Join-Path $dest $weaponName
    
    if (Test-Path $destFolder) {
        $attrFile = Get-ChildItem -Path $_.FullName -Filter "*_Attributes.json" -ErrorAction SilentlyContinue
        if ($attrFile) {
            Copy-Item $attrFile.FullName -Destination $destFolder -Force
            Write-Host "Copied: $($attrFile.Name) to $weaponName"
        }
    }
}
