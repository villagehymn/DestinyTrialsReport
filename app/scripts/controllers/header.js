'use strict';

angular.module('trialsReportApp')
  .controller('HeaderCtrl', function ($scope, $location, currentAccount, $sce) {
    $scope.mapModal = {
      content: $sce.trustAsHtml(
        '<div class="map-modal">' +
          '<div class="map-modal__intro" style="background-image: url(\'https://www.bungie.net' + $scope.currentMap.pgcrImage + '\')">' +
            '<div class="map-modal__title">' + $scope.currentMap.name + '</div>' +
          '</div>' +
          '<div class="map-modal__heatmap">' +
            '<img class="img-responsive" src="' + $scope.currentMap.heatmapImage + '" alt="Heatmap">' + // todo: handle case where heatmapImage does not exist
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
        currentAccount.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync($scope.fireteam[index] = teammate);
        });
      });
    };
  });
