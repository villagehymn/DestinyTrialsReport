'use strict';

angular.module('trialsReportApp')
  .factory('armorStats', function($http) {
    var getData = function(items) {
      var armors = [];
      armors.hazards = [];
      var hazardPerks = ['Light Beyond Nemesis', 'Crest of Alpha Lupi'];
      var grenadePerks = ['Lucky Raspberry', 'Voidfang Vestments'];
      var doubleNade = ['The Armamentarium'];
      var intellect = 0;
      var discipline = 0;
      var strength = 0;
      angular.forEach(items,function(item){
        var itemS = item.items[0];
        var aItem = DestinyArmorDefinition[itemS.itemHash];

        if (aItem) {
          if (hazardPerks.indexOf(aItem.name) > -1) {
            armors.hazards.push('Quick Revive');
          }else if (grenadePerks.indexOf(aItem.name) > -1){
            armors.hazards.push('Grenade on Spawn');
          }else if (doubleNade.indexOf(aItem.name) > -1){
            armors.hazards.push('Double Grenade');
          }
          angular.forEach(itemS.stats,function(stat){
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
          switch (aItem.bucket) {
            case 'BUCKET_HEAD':
              armors.head = {'armor': aItem};
              break;
            case 'BUCKET_ARMS':
              armors.arms = {'armor': aItem};
              break;
            case 'BUCKET_CHEST':
              armors.chest = {'armor': aItem};
              break;
            case 'BUCKET_LEGS':
              armors.legs = {'armor': aItem};
              break;
          }
        }
      });
      return {armors: armors, int: intellect, dis: discipline, str: strength};
    };
    return { getData: getData };
  });
