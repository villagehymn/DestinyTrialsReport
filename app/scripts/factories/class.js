'use strict';

function setNodeDescription(noderStepper) {
  return {
    'name': noderStepper.nodeStepName,
    'description': noderStepper.nodeStepDescription,
    'icon': 'https://www.bungie.net' + noderStepper.icon
  };
}

function setClassNode(nodeStep, classNodes, nodeArray, type) {
  if (nodeArray.indexOf(nodeStep.column) > -1) {
    var condition = type === 'weaponKillsGrenade' || 'all' ? !(nodeStep.row === 0 && nodeStep.column === 3) : (nodeStep.row === 0);
    if (condition) {
      var noderStepper = nodeStep.steps;
      if (type === 'all') {
        classNodes.push(setNodeDescription(noderStepper));
      } else {
        classNodes.abilities[type] = setNodeDescription(noderStepper);
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
              if (itemS.itemHash === 3658182170) {
                hasFireboltGrenade = nodeStep.nodeHash === 835330335;
                hasFusionGrenade = nodeStep.nodeHash === 834786008;
                hasVikingFuneral = nodeStep.nodeHash === 1173110174;
                hasTouchOfFlame = nodeStep.nodeHash === 527202181;
              }
              setClassNode(nodeStep, classNodes, [1], 'weaponKillsGrenade');
              setClassNode(nodeStep, classNodes, [3], 'weaponKillsSuper');
              setClassNode(nodeStep, classNodes, [4], 'weaponKillsMelee');
              setClassNode(nodeStep, classNodes, [1, 3, 6, 8], 'all');

              if (itemS.itemHash === 2962927168 || itemS.itemHash === 3828867689) {
                blink = (nodeStep.row === 3 && nodeStep.column === 2);
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
