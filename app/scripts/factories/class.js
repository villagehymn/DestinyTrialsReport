'use strict';

angular.module('trialsReportApp')
  .factory('classStats', function($http) {
    var getData = function(items, talentGrid, definitionItems) {
      //return $http({method:'GET', url: '/json/class.json'}).then(function(data){
        var background = [];
        var subClass = [];
        var classNodes = [];
        classNodes.hazards = [];
        var blink = false;
        angular.forEach(items,function(item){
          var itemS = item.items[0];
          //var cItem = data.data.items[itemS.itemHash];
          var cItem = classItems[itemS.itemHash];
          if (cItem) {
            subClass = {'name': cItem.name};
          }else if (itemS.itemLevel === 0 && definitionItems[itemS.itemHash].bucketTypeHash === 4274335291){
            background[0] = 'http://www.bungie.net' + definitionItems[itemS.itemHash].secondaryIcon;
            background[1] = 'http://www.bungie.net' + definitionItems[itemS.itemHash].icon;
          }
          if ([3828867689, 3658182170, 2962927168, 1716862031, 2455559914, 2007186000].indexOf(itemS.itemHash) > -1) {
            var hasFireboltGrenade = false; var hasVikingFuneral = false; var hasTouchOfFlame = false;
            angular.forEach(itemS.nodes,function(node,index){
              if (node.isActivated === true) {
                var nodeStep = talentGrid[itemS.talentGridHash].nodes[index];
                if (nodeStep.nodeHash === 835330335){ hasFireboltGrenade = true; }
                if (nodeStep.nodeHash === 1173110174){ hasVikingFuneral = true; }
                if (nodeStep.nodeHash === 527202181){ hasTouchOfFlame = true; }
                if ([1,3,6,8].indexOf(nodeStep.column) > -1) {
                  if (!(nodeStep.row === 0 && nodeStep.column === 3)) {
                    var noderStepper = nodeStep.steps[node.stepIndex];
                    classNodes.push({'name': noderStepper.nodeStepName, 'description': noderStepper.nodeStepDescription,
                      'icon': 'http://www.bungie.net' + noderStepper.icon });
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
          }
        });
        return {classNodes: classNodes, subClass: subClass, bg: background, blink: blink};
      //});
    };
    return { getData: getData };
  });