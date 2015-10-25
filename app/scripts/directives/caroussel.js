'use strict';

angular.module('trialsReportApp')
  .directive('caroussel', ['$customSwipe', function($customSwipe) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs, ctrl) {
        var startX;
        var startTransformX;
        var container = $('.players').first();
        var active = false;
        $customSwipe.bind(ele, {
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
              container.css('transform', 'translate3d(' + (startTransformX + (delta / 2)) + 'px, 0px, 0px)');
              container.css('-webkit-transform', 'translate3d(' + (startTransformX + (delta / 2)) + 'px, 0px, 0px)');
              container.css('-ms-transform', 'translate3d(' + (startTransformX + (delta / 2)) + 'px, 0px, 0px)');
            }
          },
          end: function(coords) {
            var delta = coords.x - startX;
            container.removeAttr('style');
            active = false;
          }
        }, 0)
      }
    };
  }]);
