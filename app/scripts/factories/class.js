'use strict';

angular.module('trialsReportApp')
  .factory('classStats', function($analytics) {
    var getData = function(items) {
      var classNodes = [];
      classNodes.abilities = {};
      classNodes.hazards = [];
      var subClass = [];
      var background = [];
      var blink = false;
      var hasFireboltGrenade = false;
      var hasFusionGrenade = false;
      var hasVikingFuneral = false;
      var hasTouchOfFlame = false;

      for (var n = 0; n < items.length; n++) {
        var itemS = items[n];
        var cItem = DestinyClassDefinition[itemS.itemHash];
        if (cItem) {
          subClass = {
            'name': cItem.name
          };

          for (var i = 0; i < itemS.nodes.length; i++) {
            if (itemS.nodes[i].isActivated === true) {
              var nodeStep = itemS.nodes[i];
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

              if ([1].indexOf(nodeStep.column) > -1) {
                if (!(nodeStep.row === 0 && nodeStep.column === 3)) {
                  var noderStepper = nodeStep.steps;
                  classNodes.abilities.weaponKillsGrenade = {
                    'name': noderStepper.nodeStepName,
                    'description': noderStepper.nodeStepDescription,
                    'icon': 'https://www.bungie.net' + noderStepper.icon
                  };
                }
              }

              if ([3].indexOf(nodeStep.column) > -1) {
                if (nodeStep.row === 0) {
                  var noderStepper = nodeStep.steps;
                  classNodes.abilities.weaponKillsSuper = {
                    'name': noderStepper.nodeStepName,
                    'description': noderStepper.nodeStepDescription,
                    'icon': 'https://www.bungie.net' + noderStepper.icon
                  };
                }
              }

              if ([4].indexOf(nodeStep.column) > -1) {
                if (nodeStep.row === 0) {
                  var noderStepper = nodeStep.steps;
                  classNodes.abilities.weaponKillsMelee = {
                    'name': noderStepper.nodeStepName,
                    'description': noderStepper.nodeStepDescription,
                    'icon': 'https://www.bungie.net' + noderStepper.icon
                  };
                }
              }

              if ([1, 3, 6, 8].indexOf(nodeStep.column) > -1) {
                if (!(nodeStep.row === 0 && nodeStep.column === 3)) {
                  var noderStepper = nodeStep.steps;
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
          }

          if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
            classNodes.hazards.push('Superburn Grenade');
          }
        } else if (itemS.itemLevel === 0 && DestinyEmblemDefinitions[itemS.itemHash]) {
          background[0] = 'https://www.bungie.net' + DestinyEmblemDefinitions[itemS.itemHash].secondaryIcon;
          background[1] = 'https://www.bungie.net' + DestinyEmblemDefinitions[itemS.itemHash].icon;
        }
      }

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
