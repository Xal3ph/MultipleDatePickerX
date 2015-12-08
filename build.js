grunt --force
git tag -d v1.3.5
git push origin :refs/tags/v1.3.5
git tag -a v1.3.5 -m "Multiple Date Picker X"
git push origin v1.3.5
bower cache clean
bower info multiple-month-picker
