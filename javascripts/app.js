var app = angular.module('demoApp', ['multipleDatePickerX']);

app.controller('demoController', ['$scope', function ($scope) {
    $scope.logInfos = function (time, selected) {
        alert(moment(time).format('YYYY-M-DD') + ' has been ' + (selected ? '' : 'un') + 'selected');
    };

    $scope.logMonthChanged = function (newYear, oldYear) {
        alert('new year : ' + newYear.format('YYYY-M-DD') + ' || old year : ' + oldYear.format('YYYY-M-DD'));
    };

    $scope.doDate = function (event, date) {
        if (event.type == 'click') {
            alert(moment(date).format('YYYY-M-DD') + ' has been ' + (date.selected ? 'un' : '') + 'selected');
        } else {
            console.log(moment(date) + ' has been ' + event.type + 'ed')
        }
    };
    $scope.mode = "month";

    $scope.oneDayOff = [moment().date(14).valueOf()];


    $scope.highlightDates = [
        // {to: moment(2).valueOf(), css: 'off picker-off', selectable: false},
        {to: moment().date(18).valueOf(), from: moment().date(16).valueOf(), css: 'off picker-off', selectable: false},
        {to: moment().date(28).valueOf(), from: moment().date(29).valueOf(), css: 'off picker-off', selectable: false},
        {date: moment('02-01','MM-DD').valueOf(), css: 'holiday', selectable: false, title: 'Holiday time !'},
        {date: moment('04-01','MM-DD').valueOf(), css: 'off', selectable: false, title: 'We don\'t work today'},
        {date: moment('05-01','MM-DD').valueOf(), css: 'birthday', selectable: true, title: 'I\'m thir... i\'m 28, seriously, I mean ...'},
        {date: moment().date(2).valueOf(), css: 'holiday', selectable: false, title: 'Holiday time !'},
        {date: moment().date(14).valueOf(), css: 'off', selectable: false, title: 'We don\'t work today'},
        {date: moment().date(25).valueOf(), css: 'birthday', selectable: true,title: 'I\'m thir... i\'m 28, seriously, I mean ...'}
    ];
    $scope.selectedDays = [moment().date(4).valueOf(), moment().date(5).valueOf(), moment().date(8).valueOf()];
}]);