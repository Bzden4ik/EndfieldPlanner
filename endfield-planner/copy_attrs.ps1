$source = "C:\Users\warfa\Downloads\Endfield\Персонажи"
$target = "C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\operators"

$ops = "Laevatain","Snowshine","Xaihi","Endministrator","Lifeng","Gilberta","Yvonne","Arclight","Wulfgard","Perlica","Pogranichnik","Estella","Last Rite","Ardelia","Fluorite","Antal","Chen Qianyu","Akekuri","Avywenna","Ember","Da Pan","Alesh","Catcher"

foreach ($op in $ops) {
    $tdir = "$target\$op"
    New-Item -ItemType Directory -Path $tdir -Force | Out-Null
    $sfile = "$source\$op\${op}_Attributes.json"
    $tfile = "$tdir\${op}_Attributes.json"
    if (Test-Path $sfile) {
        Copy-Item $sfile $tfile -Force
        Write-Host "OK: $op"
    }
}
