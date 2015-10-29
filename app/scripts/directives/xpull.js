'use strict';

angular.module('trialsReportApp')
  .directive("ngXpull", function() {
    return function(scope, elm, attr) {
      return $(elm[0]).xpull({
        'callback': function() {
          return scope.$apply(attr.ngXpull);
        }
      });
    };
  });

