/*
 @author : Xal3ph
 @date: December 2015
 @version: 1.0.3

 @description:  multipleDatePickerX is an based on the Angular directive "multipleDatePicker" to show a simple calendar allowing user to select multiple dates.
 It's more complicated than the simple version.  It allows for multiple calendars, different calendar modes, it requires more advanced libraries (qtip) and does
 some more things than the original plugin.
 */
angular.module('multipleDatePickerX', [])
    .factory('multipleDatePickerXBroadcast', ['$rootScope', function ($rootScope) {
        var sharedService = {};

        sharedService.calendarId = null;
        sharedService.message = '';

        sharedService.resetOrder = function (calendarId) {
            this.message = 'reset';
            this.calendarId = calendarId;
            this.broadcastItem();
        };

        sharedService.broadcastItem = function () {
            $rootScope.$broadcast('handlemultipleDatePickerXBroadcast');
        };

        return sharedService;
    }])
    .directive('multipleDatePickerX', ['$log', 'multipleDatePickerXBroadcast', function ($log, multipleDatePickerXBroadcast) {
        "use strict";
        return {
            restrict: 'AE',
            scope: {
                /*
                 * Type : String/Long (avoid 0 value)
                 * Will be used to identified calendar when using broadcast messages
                 * */
                calendarId: '=?',
                /*
                 * Type: String/Long (avoid 0 value)
                 * Will be used to determine number of calendars/years to display
                 * */
                count: '=?',
                countRowMax: '=?',
                mode: '=?',
                /*
                 * DEPRECATED : use dateClick
                 * Type: function(timestamp, boolean)
                 * Will be called when un/select a date
                 * Param timestamp will be the date at midnight
                 * */
                callback: '&',
                dateClick: '=?',
                dateHover: '=?',
                /*
                 * Type: moment date
                 * Month to be displayed
                 * Default is current month
                 * */
                calendar: '=?',
                /*
                 * Type: function(newYear, oldYear)
                 * Will be called when Year changed
                 * Param newYear/oldYear will be the month day of year
                 * */
                calendarChanged: '=?',
                /*
                 * Type: array of milliseconds timestamps
                 * Days already selected
                 * */
                datesSelected: '=?',
                /*
                 * DEPRECATED : use highlightDays
                 * Type: array of milliseconds timestamps
                 * Days not selectables
                 * */
                datesOff: '=?',
                /*
                 * Type: array of objects cf doc
                 * Days highlights
                 * */
                highlightDates: '=?',
                /*
                 * Type: boolean
                 * Set all months off
                 * */
                allDatesOff: '=?',
                /*
                 * Type: string
                 * CSS classes to apply to days of next/previous months
                 * */
                cssDaysOfSurroundingMonths: '=?',
                /*
                 * Type: boolean
                 * if true can't go back in months before today's month
                 * */
                disallowBackPastYears: '=',
                /*
                 * Type: boolean
                 * if true can't go in futur months after today's month
                 * */
                disallowGoFuturYears: '=',
                /*
                 * Type: boolean
                 * if true none of the '<' '>' will show
                 * */
                hideButtons: '=?',
                /*
                 * Type: string
                 * Either 'unit' (default) or 'range'
                 * */
                selectionMode: '=?',
                /*
                 * Type: any type moment can parse
                 * If filled will disable all days before this one (not included)
                 * */
                disableDaysBefore: '=?',
                /*
                 * Type: any type moment can parse
                 * If filled will disable all days after this one (not included)
                 * */
                disableDaysAfter: '=?',
                leftArrowContent: '=?',
                rightArrowContent: '=?'
            },
            templateUrl: 'template/multiple-date-picker-template.html',
            link: function (scope, element, attr) {

                /*utility functions*/
                var checkNavigationButtons = function () {
                        var today = moment(),
                            previousCalendar = moment(scope.calendar).subtract(1, scope.mode),
                            nextCalendar = moment(scope.calendar).add(1, scope.mode);
                        scope.disableBackButton = scope.disallowBackPastYears && today.isAfter(previousCalendar, scope.mode);
                        scope.disableNextButton = scope.disallowGoFuturYears && today.isBefore(nextCalendar, scope.mode);
                    },
                    getDaysOfWeek = function () {
                        /*To display days of week names in moment.lang*/
                        var momentDaysOfWeek = moment().localeData()._weekdaysMin,
                            days = [];

                        for (var i = 1; i < 7; i++) {
                            days.push(momentDaysOfWeek[i]);
                        }

                        if (scope.sundayFirstDay) {
                            days.splice(0, 0, momentDaysOfWeek[0]);
                        } else {
                            days.push(momentDaysOfWeek[0]);
                        }

                        return days;
                    };

                /*scope functions*/
                scope.$watch('datesSelected', function (newValue) {
                    if (newValue) {
                        var momentDates = [];
                        newValue.map(function (timestamp) {
                            momentDates.push(moment(timestamp));
                        });
                        scope.convertedDaysSelected = momentDates;
                        scope.generate();
                    }
                }, true);

                scope.$watch('datesOff', function (value) {
                    if (value !== undefined) {
                        $log.warn('datesOff option deprecated since version 1.1.6, please use highlightDates');
                    }
                    scope.generate();
                }, true);

                scope.$watch('highlightDates', function () {
                    scope.generate();
                }, true);

                scope.$watch('allDatesOff', function () {
                    scope.generate();
                }, true);

                scope.$watch('mode', function () {
                    scope.init();
                }, true);

                scope.$watch('calendar', function () {
                    scope.generate();
                }, true);


                scope.init = function(){

                    //default values
                    scope.mode = scope.mode || 'month';
                    switch(scope.mode){
                        case 'year':
                            scope.topRowDateFormat = 'YYYY';
                            scope.dateFormat = 'MMM';
                            scope.modeDate = 'month';
                            break;
                        case 'month':
                            scope.topRowDateFormat = 'MMMM YYYY';
                            scope.dateFormat = 'D';
                            scope.modeDate = 'day';
                            break;
                        default:
                            scope.topRowDateFormat = 'MMMM YYYY';
                            scope.dateFormat = 'D';
                            scope.modeDate = 'day';
                            break;
                    }

                    scope.calendar = scope.calendar || moment().startOf(scope.mode);
                    scope.days = [];
                    scope.convertedDaysSelected = scope.convertedDaysSelected || [];
                    scope.datesOff = scope.datesOff || [];
                    scope.disableBackButton = false;
                    scope.disableNextButton = false;
                    scope.rightArrowContent = '>';
                    scope.leftArrowContent = '<';



                    scope.daysOfWeek = getDaysOfWeek();
                    scope.cssDaysOfSurroundingYears = scope.cssDaysOfSurroundingYears || 'picker-empty';
                    scope.hideButtons = scope.hideButtons || false;
                    scope.selectionMode = scope.selectionMode || 'unit';
                    scope.Math = Math;



                    scope.count = scope.count || 1;
                    scope.countRowMax = scope.countRowMax || 2;
                    scope.calendars = [];
                    for (var i = 0; i < scope.count; ++i){
                        scope.calendars[i] = moment().startOf(scope.mode).add(i,scope.mode);
                    }
                    scope.generate();
                };

                /**
                 * Called when user clicks a date
                 * @param Event event the click event
                 * @param Moment momentDate a moment object extended with selected and isSelectable booleans
                 * @see #momentDate
                 * @callback dateClick
                 * @callback callback deprecated
                 */
                scope.toggleDay = function (event, momentDate) {
                    event.preventDefault();

                    var prevented = false;

                    event.preventDefault = function () {
                        prevented = true;
                    };

                    if (typeof scope.dateClick == 'function') {
                        scope.dateClick(event, momentDate);
                    }

                    if (momentDate.selectable && !prevented) {
                        momentDate.selected = !momentDate.selected;

                        if (momentDate.selected) {
                            scope.convertedDaysSelected.push(momentDate);
                        } else {
                            scope.convertedDaysSelected = scope.convertedDaysSelected.filter(function (date) {
                                return date.valueOf() !== momentDate.valueOf();
                            });
                        }

                        if (typeof(scope.callback) === "function") {
                            $log.warn('callback option deprecated, please use dateClick');
                            scope.callback({timestamp: momentDate.valueOf(), selected: momentDate.selected});
                        }
                    }
                };

                /**
                 * Hover day
                 * @param Event event
                 * @param Moment day
                 */
                scope.hoverDay = function (event, day) {
                    event.preventDefault();
                    var prevented = false;

                    event.preventDefault = function () {
                        prevented = true;
                    };

                    if (typeof scope.dateHover == 'function') {
                        scope.dateHover(event, day);
                    }

                    if (!prevented) {
                        day.hover = event.type === 'mouseover' ? true : false;
                    }
                };

                /*Navigate to previous month*/
                scope.previous = function () {
                    if (!scope.disableBackButton) {
                      var oldCalendar = moment(scope.calendar);
                      scope.calendar.subtract(1,scope.mode);

                      for (var i = 0; i < scope.count; ++i){
                        scope.calendars[i] = moment(scope.calendar.clone().add(i,scope.mode));
                      }

                      if (typeof scope.calendarChanged == 'function') {
                          scope.calendarChanged(scope.calendar, oldCalendar);
                      }
                      scope.generate();
                    }
                };

                /*Navigate to next month*/
                scope.next = function () {
                    if (!scope.disableNextButton) {
                      var oldCalendar = moment(scope.calendar);
                      scope.calendar.add(1,scope.mode);

                      for (var i = 0; i < scope.count; ++i){
                        scope.calendars[i] = moment(scope.calendar.clone().add(i,scope.mode));
                      }

                      if (typeof scope.calendarChanged == 'function') {
                          scope.calendarChanged(scope.calendar, oldCalendar);
                      }
                      scope.generate();
                    }
                };

                /*Check if the date is off : unselectable*/
                scope.isDayOff = function (scope, date) {
                    return scope.allDatesOff ||
                        (!!scope.disableDaysBefore && moment(date).isBefore(scope.disableDaysBefore, 'day')) ||
                        (!!scope.disableDaysAfter && moment(date).isAfter(scope.disableDaysAfter, 'day')) ||
                        (angular.isArray(scope.datesOff) && scope.datesOff.some(function (dayOff) {
                            return date.isSame(dayOff, scope.modeDate);
                        })) ||
                        (angular.isArray(scope.highlightDates) && scope.highlightDates.some(function (highlightDay) {
                            return date.isSame(highlightDay.date, scope.modeDate) && !highlightDay.selectable;
                        }));
                };

                /*Check if the date is selected*/
                scope.isSelected = function (scope, date) {
                    return scope.convertedDaysSelected.some(function (d) {
                        return date.isSame(d, scope.modeDate);
                    });
                };

                /*Generate the calendar*/
                scope.generate = function () {
                    var now = moment(),
                        highlightDateFilter = function(d){
                            return (d.date && date.isSame(d.date, scope.modeDate)) ||
                              (!d.to && d.from && (date.isAfter(d.from, scope.modeDate) || date.isSame(d.from, scope.modeDate))) ||
                              (!d.from && d.to && date.isBefore(d.to, scope.modeDate) || date.isSame(d.to, scope.modeDate)) || 
                              (d.from && (date.isAfter(d.from, scope.modeDate) || date.isSame(d.from, scope.modeDate)) && 
                                d.to && (date.isBefore(d.to, scope.modeDate) || date.isSame(d.from, scope.modeDate)));
                        };

                    for (var c = 0; c < scope.calendars.length; ++c){
                        var monthsOfYear = moment().locale( scope.displayLocale || '').localeData()._monthsShort,
                            months = [],
                            nodes = [];
                        if(scope.mode == 'year'){
                            nodes = monthsOfYear;
                        }
                        else {
                            var days = new Date(scope.calendars[c].get('year'), (scope.calendars[c].get('month')+1), 0).getDate();
                            for(var d = 0; d < days; ++d){
                                nodes[d] = moment(scope.calendars[c].get('year')+'-'+(scope.calendars[c].get('month')+1)+'-'+(d+1), 'YYYY-MM-D');
                            }
                        }

                        for (var l = 0; l < nodes.length; ++l){
                            var date = nodes[l];
                            if(scope.mode == 'year'){
                                date = moment('1 ' + nodes[l]+' '+scope.calendars[c].year());
                            }

                            if(angular.isArray(scope.highlightDates)){
                                var hlDay;
                                if((hlDay = scope.highlightDates.filter(highlightDateFilter)[0])){
                                  for(var key in hlDay){
                                    if(key!= 'date'){
                                      date[key] = hlDay[key];
                                    }
                                  }
                                }
                            }
                            date.selectable = !scope.isDayOff(scope, date);
                            date.selected = scope.isSelected(scope, date);
                            date.today = date.isSame(now, 'day');
                            months.push(date);
                        }

                        if(!scope.months){
                            scope.months = [];
                        }
                        scope.months[c] = months;

                    }
                    checkNavigationButtons();
                };

                scope.init();
            }
        };
    }]);