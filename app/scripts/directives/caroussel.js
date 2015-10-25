'use strict';

angular.module('trialsReportApp')
  .directive('caroussel', ['$swipe', function($swipe) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs, ctrl) {
        var startX;
        var startTransformX;
        var container = $('.players').first();
        var active = false;
        $swipe.bind(ele, {
          start: function (coords) {
            if (window.innerWidth <= 960) {
              active = true;
              container.css('transition', 'none');
              container.css('-webkit-transition', 'none');
              startX = coords.x;
              startTransformX = parseFloat(container.css('transform').split(',')[4]);
              if (isNaN(startTransformX)) {
                startTransformX = 0;
              }
            }
          },
          move: function(coords) {
            if (active) {
              var delta = coords.x - startX;
              container.css('transform', 'translateX(' + (startTransformX + (delta / 2)) + 'px)');
              container.css('-webkit-transform', 'translateX(' + (startTransformX + (delta / 2)) + 'px)');
              container.css('-ms-transform', 'translateX(' + (startTransformX + (delta / 2)) + 'px)');
            }
          },
          end: function(coords) {
            container.removeAttr('style');
            active = false;
          }
        })
      }
    };
  }]);
