'use strict';

var atts = ['kills', 'deaths', 'assists', 'precisionKills',
  'killsDeathsAssists', 'killsDeathsRatio', 'resurrectionsPerformed',
  'averageLifespan'];

var weaponAtts = ['uniqueWeaponKills', 'uniqueWeaponKillsPrecisionKills', 'uniqueWeaponPrecisionKills'];

function setOrIncrement(object, value, index) {
  if (object){
    object.count += value.basic.value;
  } else {
    object = {
      id: index,
      count: value.basic.value
    }
  }
}

function getExtendedStats(member, medals, abilityKills, extendedStats) {
  angular.forEach(member.extended.values, function (value, index) {
    if (index.substring(0, 6) === 'medals') {
      setOrIncrement(medals[index], value, index);
    }else if (index.substring(0, 11) === 'weaponKills') {
      setOrIncrement(abilityKills[index], value, index);
    }
    else {
      extendedStats[index] = value;
    }
  });
}

function setValuesFromAttributes(collection, values, attributes) {
  for (var a = 0; a < attributes.length; a++) {
    collection[attributes[a]] = values[attributes[a]].basic.value;
  }
}

function setReferenceId(extendedWeapons, e, weaponsUsed) {
  var referenceId = extendedWeapons[e].referenceId;
  weaponsUsed[referenceId] = {referenceId: referenceId};
  return referenceId;
}

function collectMatchData(extendedWeapons, weaponsUsed, allStats, values) {
  if (extendedWeapons) {
    for (var e = 0; e < extendedWeapons.length; e++) {
      var referenceId = setReferenceId(extendedWeapons, e, weaponsUsed);
      setValuesFromAttributes(weaponsUsed[referenceId], extendedWeapons[e].values, weaponAtts);
    }
  }
  setValuesFromAttributes(allStats, values, atts);
}

function sumValuesByAttribute(collection, attribute) {
  angular.forEach(collection, function (value, key) {
    if (key === 'kills'){
    }
    attribute[key] += value;
    if (key === 'kills'){
    }
  });
}

function sumExistingStats(allStats, fireTeam, player_id, weaponsUsed, medals, abilityKills, entries, i) {
  sumValuesByAttribute(allStats, fireTeam[player_id].allStats, player_id);
  angular.forEach(weaponsUsed, function (value, key) {
      if (fireTeam[player_id].weaponsUsed[key]) {
        for (var v = 0; v < weaponAtts.length; v++) {
          fireTeam[player_id].weaponsUsed[key][weaponAtts[v]] += value[weaponAtts[v]];
        }
      } else {
        fireTeam[player_id].weaponsUsed[key] = {referenceId: value.referenceId};
        for (var v = 0; v < weaponAtts.length; v++) {
          fireTeam[player_id].weaponsUsed[key][weaponAtts[v]] = value[weaponAtts[v]];
        }
      }
  });
  fireTeam[player_id].medals = medals;
  fireTeam[player_id].abilityKills = abilityKills;
  fireTeam[player_id].playerWeapons = entries[i].extended.weapons;
}

function setPlayerStats(data, player) {
  if (data[player.id]) {
    player.allStats = data[player.id].allStats;
    player.recentMatches = data[player.id].recentMatches;
    player.abilityKills = data[player.id].abilityKills;
    player.medals = data[player.id].medals;
    player.weaponsUsed = data[player.id].weaponsUsed;
    player.fireTeam = data;
  }
}
angular.module('trialsReportApp')
  .factory('trialsStats', function ($http, $q) {

    var getData = function (player) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/trialsStats/' + player.membershipType + '/' + player.membershipId + '/' + player.characterId
      }).then(function (result) {
        return result.data;
      });
    };

    var getPostGame = function (recentActivity) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/PostGameCarnageReport/' + recentActivity.id + '/'
      }).then(function (resultPostAct) {
        return {result: resultPostAct, standing: recentActivity.standing};
      }).catch(function () {});
    };

    var getMatchSummary = function (lastMatches, id) {
      var fireTeam = {};
      var recentMatches = [];
      for (var m = 0; m < lastMatches.length; m++) {
        var data = lastMatches[m].result.data.Response.data;
        var entries = data.entries;
        var standing = lastMatches[m].standing;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].standing === standing) {
            var values = entries[i].extended.values;
            var medals = {}, abilityKills = {}, allStats = {}, extendedStats = {};
            var extendedWeapons = entries[i].extended.weapons;
            var weaponsUsed = {};
            getExtendedStats(entries[i], medals, abilityKills, extendedStats);
            collectMatchData(extendedWeapons, weaponsUsed, allStats, values);
            var player_id = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);
            if (player_id === angular.lowercase(id)) {
              if (fireTeam[player_id]) {
                sumExistingStats(allStats, fireTeam, player_id, weaponsUsed, medals, abilityKills, entries, i);
              } else {
                fireTeam[player_id] = {
                  allStats: allStats,
                  medals: medals,
                  abilityKills: abilityKills,
                  weaponsUsed: weaponsUsed
                };
              }
            } else {
              var teammateId = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);
              if (fireTeam[teammateId]) {
                sumExistingStats(allStats, fireTeam, teammateId, weaponsUsed, medals, abilityKills, entries, i);
              } else {
                fireTeam[teammateId] = {
                  id: entries[i].player.destinyUserInfo.membershipId,
                  name: entries[i].player.destinyUserInfo.displayName,
                  membershipId: entries[i].player.destinyUserInfo.membershipId,
                  membershipType: entries[i].player.destinyUserInfo.membershipType,
                  emblem: 'http://www.bungie.net' + entries[i].player.destinyUserInfo.iconPath,
                  characterId: entries[i].characterId,
                  level: entries[i].player.characterLevel,
                  class: entries[i].player.characterClass,
                  allStats: allStats,
                  medals: medals,
                  abilityKills: abilityKills,
                  weaponsUsed: weaponsUsed
                };
              }
            }
          }
        }
        var teamIndex = data.teams[0].standing.basic.value === standing ? 0 : 1;
        recentMatches.push({
          standing: standing,
          team_score: data.teams[teamIndex].score.basic.value,
          enemy_score: data.teams[teamIndex == 0 ? 1 : 0].score.basic.value,
          dateAgo: moment(data.period).fromNow(),
          duration: data.entries[0].values.activityDurationSeconds.basic.displayValue
        });
        angular.forEach(fireTeam, function (value, key) {
          value.recentMatches = recentMatches;
        });
      }
      return fireTeam;
    };

    var getLastFive = function (player) {
      var collectMatches = function (player) {
          var dfd = $q.defer();
          var lastThree = [
            {
              'id': player.lastThree[0].activityDetails.instanceId,
              'standing': player.lastThree[0].values.standing.basic.value
            },
            {
              'id': player.lastThree[1].activityDetails.instanceId,
              'standing': player.lastThree[1].values.standing.basic.value
            },
            {
              'id': player.lastThree[2].activityDetails.instanceId,
              'standing': player.lastThree[2].values.standing.basic.value
            }
          ];
          dfd.resolve(lastThree);

          return dfd.promise;
        },
        parallelLoad = function (previousMatches) {
          var methods = [];
          for (var i = 0; i < previousMatches.length; i++) {
            methods.push(getPostGame(previousMatches[i]))
          }
          return $q.all(methods)
            .then($q.spread(function (match1, match2, match3) {
              var data = getMatchSummary([match1, match2, match3], player.id);
              setPlayerStats(data, player);
            })
          );
        },
        reportProblems = function (fault) {
          console.log(String(fault));
        };
      return collectMatches(player)
        .then(function(inventory) {
          parallelLoad(inventory);
          return player;
        })
        .catch(reportProblems);
    };

    return {
      getData: getData,
      getMatchSummary: getMatchSummary,
      getPostGame: getPostGame,
      getLastFive: getLastFive
    };
  });
