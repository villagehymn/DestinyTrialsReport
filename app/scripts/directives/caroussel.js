'use strict';

angular.module('trialsReportApp')
  .directive('caroussel', ['$swipe', function($swipe) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs, ctrl) {
        var startX;
        var startTransformX;
        $swipe.bind(ele, {
          start: function (coords) {
            $('.players').css('transition', 'none');
            $('.players').css('-webkit-transition', 'none');
            startX = coords.x;
            startTransformX = parseFloat($('.players').css('transform').split(',')[4]);
            if (isNaN(startTransformX)) {
              startTransformX = 0;
            }
          },
          move: function(coords) {
            var delta = coords.x - startX;
            $('.players').css('transform', 'translateX(' + (startTransformX + (delta / 3)) + 'px)');
            $('.players').css('-webkit-transform', 'translateX(' + (startTransformX + (delta / 3)) + 'px)');
            $('.players').css('-ms-transform', 'translateX(' + (startTransformX + (delta / 3)) + 'px)');
          },
          end: function(coords) {
            $('.players').removeAttr('style');
          }
        })
      }
    };
  }]);
