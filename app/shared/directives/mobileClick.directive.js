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
  }])
  .directive('basicClick', function($parse) {
    return {
      compile: function(elem, attr) {
        var fn = $parse(attr.basicClick);
        return function(scope, elem) {
          elem.on('click', function(e) {
            fn(scope, {$event: e});
            scope.$apply();
          });
        };
      }
    };
  });
