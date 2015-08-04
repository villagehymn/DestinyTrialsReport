'use strict';

angular.module('trialsReportApp')
  .factory('classStats', function($analytics) {
    var getData = function(items, talentGrid) {
      var classNodes = [];
      classNodes.hazards = [];
      var subClass = [];
      var background = [];
      var blink = false;
      var hasFireboltGrenade = false;
      var hasFusionGrenade = false;
      var hasVikingFuneral = false;
      var hasTouchOfFlame = false;

      angular.forEach(items, function (item) {
        var itemS = item.items[0];
        var cItem = DestinyClassDefinition[itemS.itemHash];

        if (cItem) {
          subClass = {
            'name': cItem.name
          };

          angular.forEach(itemS.nodes, function (node, index) {
            if (node.isActivated === true) {
              var nodeStep = talentGrid[itemS.talentGridHash].nodes[index];
              if (itemS.itemHash === 3658182170) {
                if (nodeStep.nodeHash === 835330335) {
                  hasFireboltGrenade = true;
                }
                if (nodeStep.nodeHash === 834786008) {
                  hasFusionGrenade = true;
                }
                if (nodeStep.nodeHash === 1173110174) {
                  hasVikingFuneral = true;
                }
                if (nodeStep.nodeHash === 527202181) {
                  hasTouchOfFlame = true;
                }
              }

              if ([1, 3, 6, 8].indexOf(nodeStep.column) > -1) {
                if (!(nodeStep.row === 0 && nodeStep.column === 3)) {
                  var noderStepper = nodeStep.steps[node.stepIndex];
                  classNodes.push({
                    'name': noderStepper.nodeStepName,
                    'description': noderStepper.nodeStepDescription,
                    'icon': 'https://www.bungie.net' + noderStepper.icon
                  });
                }
              }

              if (itemS.itemHash === 2962927168 || itemS.itemHash === 3828867689) {
                if ((nodeStep.row === 3 && nodeStep.column === 2)) {
                  blink = true;
                }
              }
            }
          });

          if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
            classNodes.hazards.push('Superburn Grenade');
          }
        } else if (itemS.itemLevel === 0 && DestinyEmblemDefinitions[itemS.itemHash]) {
          background[0] = 'https://www.bungie.net' + DestinyEmblemDefinitions[itemS.itemHash].secondaryIcon;
          background[1] = 'https://www.bungie.net' + DestinyEmblemDefinitions[itemS.itemHash].icon;
        }
      });

      $analytics.eventTrack('classStats', {
        category: 'subclass',
        label: subClass.name
      });

      return {
        classNodes: classNodes,
        subClass: subClass,
        bg: background,
        blink: blink,
        hasFusionGrenade: hasFusionGrenade
      };
    };

    return {
      getData: getData
    };
  });
