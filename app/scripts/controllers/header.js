'use strict';

angular.module('trialsReportApp')
  .controller('HeaderCtrl', function ($scope, $location, playerCard, $sce) {
    $scope.mapModal = {
      content: $sce.trustAsHtml(
        '<div class="map-modal">' +
          '<div class="map-modal__intro" style="background-image: url(\'' + $scope.currentMap.headerImage + '\')">' +
            '<div class="map-modal__title">' + $scope.currentMap.activityName + '</div>' +
          '</div>' +
          '<div class="map-modal__heatmap">' +
            '<img class="img-responsive" src="' + $scope.currentMap.heatmapImage + '" alt="Heatmap">' +
          '</div>' +
        '</div>'
      )
    };

    $scope.searchPlayerbyName = function (name, platform) {
      if (angular.isDefined(name)) {
        $location.path((platform ? '/ps/' : '/xbox/') + name);
      }
    };

    $scope.refreshInventory = function (fireteam) {
      angular.forEach(fireteam, function (player, index) {
        playerCard.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync( $scope.fireteam[index] = teammate );
        });
      });
    };
  });
