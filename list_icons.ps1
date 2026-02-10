Get-ChildItem 'C:\Users\warfa\Downloads\Endfield\Characters' -Recurse -Filter '*Token*' | ForEach-Object {
    Write-Host "$($_.Directory.Name) -> $($_.Name)"
}
