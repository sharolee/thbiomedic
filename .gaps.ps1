Set-Location D:\Projects\playground\thbiomedic
function GrepDist($label, $pattern) {
  $n = 0
  $where = ''
  Get-ChildItem dist\zh, dist\en -Recurse -Filter *.html | ForEach-Object {
    $m = Select-String -Path $_.FullName -Pattern $pattern
    if ($m) { $n += $m.Count; if (-not $where) { $where = $_.FullName.Replace((Get-Location).Path + '\','') } }
  }
  Write-Output ("{0,-30} hits={1,-5} first={2}" -f $label, $n, $where)
}
GrepDist 'category-nav/B14' 'category-nav|category-nav__'
GrepDist 'certificate carousel/B11' 'certificate|cert-card|cert__'
GrepDist 'video modal/B24' 'video-modal|data-video-modal'
GrepDist 'dialog element' '<dialog'
GrepDist 'lightbox/B10 B20' 'lightbox'
GrepDist 'search bar/B0.3' 'data-search-bar'
GrepDist 'drawer/A18' 'data-drawer'
GrepDist 'history timeline/B10,ID' 'timeline|history'
GrepDist 'breadcrumb/B19' 'breadcrumb'
GrepDist 'page banner/B8' 'banner'
GrepDist 'trust bar/B3' 'trust'
GrepDist 'coming-soon badge/B4' 'badge'
GrepDist 'global layout data/B12' 'stat|global-layout'
Write-Output '=== certificates.json entries ==='
foreach ($l in @('zh','en')) {
  $j = Get-Content ("src\content\$l\data\certificates.json") -Raw | ConvertFrom-Json
  $arr = $j.certificates
  if (-not $arr) { $arr = $j.PSObject.Properties.Value | Where-Object { $_ -is [Array] } | Select-Object -First 1 }
  Write-Output ("{0}: {1} entries" -f $l, (@($arr).Count))
}
Write-Output '=== products entries ==='
foreach ($l in @('zh','en')) {
  $j = Get-Content ("src\content\$l\data\products.json") -Raw | ConvertFrom-Json
  Write-Output ("{0}: keys={1}" -f $l, (($j.PSObject.Properties.Name) -join ','))
}
