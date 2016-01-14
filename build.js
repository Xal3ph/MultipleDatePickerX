grunt --force
git tag -d v1.0.5
git push origin :refs/tags/v1.0.5
git tag -a v1.0.5 -m "Multiple Date Picker X"
git push origin v1.0.5
bower cache clean
bower info multiple-date-picker-x
bower register multiple-date-picker-x git://github.com/Xal3ph/MultipleDatePickerX.git
