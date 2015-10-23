'use strict';

angular.module('trialsReportApp')
  .directive('ngMobileClick', [function () {
    return function (scope, element, attributes) {
      element.bind('touchstart click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        scope.$apply(attributes['ngMobileClick']);
      });
    };
  }]);
