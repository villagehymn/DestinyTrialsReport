'use strict';

function populateClassNode(noderStepper) {
  return {
    'name': noderStepper.nodeStepName,
    'description': noderStepper.nodeStepDescription,
    'icon': 'https://www.bungie.net' + noderStepper.icon
  };
}

function setClassNode(nodeStep, classNodes, nodeArray, type, skipFirstAndLast) {
  if (nodeArray.indexOf(nodeStep.column) > -1) {
    var condition = skipFirstAndLast ? !(nodeStep.row === 0 && nodeStep.column === 3) : (nodeStep.row === 0);
    if (condition) {
      var noderStepper = nodeStep.steps;
      if (type === 'all') {
        classNodes.push(populateClassNode(noderStepper));
      } else {
        classNodes.abilities[type] = populateClassNode(noderStepper);
      }
    }
  }
}

angular.module('trialsReportApp')
  .factory('classStats', function($analytics) {
    var getData = function(items) {
      var classNodes = [];
      classNodes.abilities = {};
      classNodes.hazards = [];
      var subClass = [], background = [], blink = false,
        hasFireboltGrenade = false, hasFusionGrenade = false,
        hasVikingFuneral = false, hasTouchOfFlame = false;
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
              if (itemS.itemHash === SUNSINGER_CLASS) {
                switch (nodeStep.nodeHash) {
                  case FIREBOLT_GRENADE:
                    hasFireboltGrenade = true;
                    break;
                  case FUSION_GRENADE:
                    hasFusionGrenade = true;
                    break;
                  case VIKING_FUNERAL:
                    hasVikingFuneral = true;
                    break;
                  case TOUCH_OF_FLAME:
                    hasTouchOfFlame = true;
                    break;
                }
              }
              setClassNode(nodeStep, classNodes, [1], 'weaponKillsGrenade', true);
              setClassNode(nodeStep, classNodes, [3], 'weaponKillsSuper', false);
              setClassNode(nodeStep, classNodes, [4], 'weaponKillsMelee', false);
              setClassNode(nodeStep, classNodes, [1, 3, 6, 8], 'all', true);

              if (itemS.itemHash === VOIDWALKER_CLASS || itemS.itemHash === BLADEDANCER_CLASS) {
                blink = (nodeStep.row === 3 && nodeStep.column === 2);
              }
            }
          }

          if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
            classNodes.hazards.push('Superburn Grenade');
          }
        } else if (itemS.itemLevel === 0 && DestinyEmblemDefinitions[itemS.itemHash]) {
          background[0] = DestinyEmblemDefinitions[itemS.itemHash].secondaryIcon;
          background[1] = DestinyEmblemDefinitions[itemS.itemHash].icon;
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
