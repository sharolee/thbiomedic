Set-Location D:\Projects\playground\thbiomedic
Write-Output '=== 2018 in en dist contact html ==='
$en = Get-Content dist\en\contact\index.html -Raw
Write-Output ("en contact html contains '2018': " + ($en -match '2018'))
$m = [regex]::Matches($en, '[0-9\-+ ]{7,20}2018[0-9\- ]{0,6}')
$m | ForEach-Object { Write-Output ("  match: " + $_.Value) }
Write-Output '=== 2018 in zh dist contact html ==='
$zh = Get-Content dist\zh\contact\index.html -Raw
Write-Output ("zh contact html contains '2018': " + ($zh -match '2018'))
Write-Output '=== 2018 anywhere in src ==='
$hits = Get-ChildItem src -Recurse -File | Where-Object { Select-String -Path $_.FullName -SimpleMatch -Pattern '2018' -Quiet }
$hits | ForEach-Object { Write-Output ("  " + $_.FullName) }
Write-Output ('src hits: ' + $hits.Count)
