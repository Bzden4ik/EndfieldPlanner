$ops = @("Laevatain","Snowshine","Xaihi","Lifeng","Gilberta","Yvonne","Arclight","Wulfgard","Perlica","Pogranichnik","Estella","Last Rite","Ardelia","Fluorite","Antal","Chen Qianyu","Akekuri","Avywenna","Ember","Da Pan","Alesh","Catcher")

foreach ($op in $ops) {
    Copy-Item "C:\Users\warfa\Downloads\Endfield\Персонажи\$op\${op}_Attributes.json" "C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\operators\$op\" -Force
    Write-Host "$op OK"
}
