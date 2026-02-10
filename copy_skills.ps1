$srcBase = 'C:\Users\warfa\Downloads\Endfield\Characters'
$dstBase = 'C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\operators'

$chars = Get-ChildItem $srcBase -Directory
foreach ($char in $chars) {
    $dst = Join-Path $dstBase $char.Name
    
    # Copy Potential JSON
    $potFile = Get-ChildItem $char.FullName -Filter '*_Potential.json'
    if ($potFile) {
        Copy-Item $potFile.FullName -Destination $dst -Force
        Write-Host "Copied: $($potFile.Name) -> $dst"
    }
    
    # Copy Token icon
    $tokenIcon = Get-ChildItem $char.FullName -Filter '*Token*'
    if ($tokenIcon) {
        Copy-Item $tokenIcon.FullName -Destination $dst -Force
        Write-Host "Copied: $($tokenIcon.Name) -> $dst"
    }
}
Write-Host 'Done!'
