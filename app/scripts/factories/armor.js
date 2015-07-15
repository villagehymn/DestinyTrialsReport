'use strict';

angular.module('trialsReportApp')
  .factory('armorStats', function($http) {
    var getData = function(items) {
      return $http({method:"GET", url: '/json/armor.json'}).then(function(data){
        var armors = [];
        armors.hazards = [];
        var hazardPerks = ['Light Beyond Nemesis', 'Crest of Alpha Lupi'];
        var grenadePerks = ['Lucky Raspberry', 'Voidfang Vestments'];
        var doubleNade = ['The Armamentarium'];
        //144602215 1735777505 4244567218
        var intellect = 0;
        var discipline = 0;
        var strength = 0;
        angular.forEach(items,function(item,index){
          var itemS = item.items[0];
          var aItem = data.data.items[itemS.itemHash];
          if (aItem) {
            if (hazardPerks.indexOf(aItem.name) > -1) {
              armors.hazards.push('Quick Revive');
            }else if (grenadePerks.indexOf(aItem.name) > -1){
              armors.hazards.push('Grenade on Spawn');
            }else if (doubleNade.indexOf(aItem.name) > -1){
              armors.hazards.push('Double Grenade');
            }
            angular.forEach(itemS.stats,function(stat,index){
              switch(stat.statHash) {
                case 144602215:
                  intellect += stat.value;
                  break;
                case 1735777505:
                  discipline += stat.value;
                  break;
                case 4244567218:
                  strength += stat.value;
                  break;
              }
            });
            armors[aItem.bucket] = aItem;
          }
        });
        return {armors: armors, int: intellect, dis: discipline, str: strength};
      });
    };

    return { getData: getData };
  });
