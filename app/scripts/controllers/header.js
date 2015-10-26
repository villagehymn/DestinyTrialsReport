'use strict';

angular.module('trialsReportApp')
  .controller('HeaderCtrl', function ($scope, $location, currentAccount, $sce, locationChanger, $routeParams, $modal) {

    if ('heatmapImage' in $scope.currentMap) {
      $scope.mapModal = {
        content: $sce.trustAsHtml(
          '<div class="map-modal">' +
            '<div class="map-modal__heatmap">' +
              '<img class="img-responsive" src="' + $scope.currentMap.heatmapImage + '" alt="Heatmap">' +
            '</div>' +
          '</div>'
        )
      };
    }

    var faqModal = $modal({ scope: $scope, contentTemplate: "app/views/modals/faq.html", show: false});

    $scope.showModal = function () {
      faqModal.$promise.then(faqModal.show);
    };

    if ($routeParams.playerName) {
      $scope.searchedPlayer = $routeParams.playerName;
    }

    $scope.togglePlatform = function () {
      $scope.platformValue = !$scope.platformValue;
    };

    $scope.searchMainPlayerbyName = function (name) {
      if (angular.isDefined(name)) {
        $location.path(($scope.platformValue ? '/ps/' : '/xbox/') + name);
      } else {
        if (angular.isDefined($scope.searchedPlayer)) {
          $location.path(($scope.platformValue ? '/ps/' : '/xbox/') + $scope.searchedPlayer);
        }
      }
    };

    function updateUrl($scope, locationChanger) {
      if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
        if ($scope.fireteam[2].membershipId) {
          var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';
          locationChanger.skipReload()
            .withoutRefresh(platformUrl + $scope.fireteam[0].name + '/' +
            $scope.fireteam[1].name + '/' + $scope.fireteam[2].name, true);
        }
      }
    }

    $scope.searchPlayerbyName = function (player, name, platform, index) {
      if (angular.isUndefined(name)) {
        return;
      }
      var url = '/Platform/Destiny/SearchDestinyPlayer/' + ($scope.platformValue ? 2 : 1) + '/' + name + '/';
      return currentAccount.getAccount(url)
        .then(function (player) {
          if (player) {
            if (angular.isDefined($scope.fireteam[1].name) || angular.isDefined($scope.fireteam[2].name)) {
              $scope.switchFocus();
              document.activeElement.blur();
              player.isTeammate = true;
            }
            currentAccount.getPlayerCard(player).then(function (teammate) {
              $scope.$evalAsync( $scope.fireteam[index] = teammate );
              $scope.$parent.focusOnPlayer = index + 1;
              if (!$scope.fireteam[0].activities) {
                $scope.fireteam[0].activities = {lastThree: {}};
              }
              currentAccount.compareLastMatchResults($scope.fireteam[index], $scope.fireteam[0].activities.lastThree);
              updateUrl($scope, locationChanger);
            });
          }
        });
    };

    $scope.refreshInventory = function (fireteam) {
      angular.forEach(fireteam, function (player, index) {
        currentAccount.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync($scope.fireteam[index] = teammate);
        });
      });
    };
  });
