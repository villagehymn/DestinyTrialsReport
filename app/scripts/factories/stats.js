'use strict';

var atts = ['kills', 'deaths', 'assists', 'precisionKills',
  'killsDeathsAssists', 'killsDeathsRatio', 'resurrectionsPerformed',
  'averageLifespan'];

var weaponAtts = ['uniqueWeaponKills', 'uniqueWeaponKillsPrecisionKills', 'uniqueWeaponPrecisionKills'];

function setOrIncrement(object, value, index) {
  if (object[index]){
    object[index].count += value.basic.value;
  } else {
    object[index] = {
      id: index,
      count: value.basic.value
    }
  }
}

function getExtendedStats(member, medals, abilityKills) {
  angular.forEach(member.extended.values, function (value, index) {
    if (index.substring(0, 6) === 'medals') {
      setOrIncrement(medals, value, index);
    } else if (index.substring(0, 11) === 'weaponKills') {
      setOrIncrement(abilityKills, value, index);
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
    attribute[key] += value;
  });
}

function sumExistingStats(allStats, fireTeam, player_id, weaponsUsed, entries, i) {
  sumValuesByAttribute(allStats, fireTeam[player_id].allStats);
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

    var getTeamSummary = function (lastMatches, player) {
      var data = getMatchSummary(lastMatches, player.id);
      setPlayerStats(data, player);
    };

    var getPostGame = function (recentActivity, player) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/PostGameCarnageReport/' + recentActivity.id + '/'
      }).then(function (resultPostAct) {
        player.lastThree[recentActivity.id].result = resultPostAct;
        return {result: resultPostAct, standing: recentActivity.standing};
      }).catch(function () {});
    };

    var getMatchSummary = function (lastMatches, id) {
      var fireTeam = {};
      var recentMatches = [];
      for (var m = 0; m < lastMatches.length; m++) {
        if (lastMatches[m]) {
          var data = lastMatches[m].result.data.Response.data;
          var entries = data.entries;
          var standing = lastMatches[m].standing;
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].standing === standing) {
              var values = entries[i].extended.values, medals = {},
                abilityKills = {}, allStats = {}, extendedStats = {},
                extendedWeapons = entries[i].extended.weapons, weaponsUsed = {};
              var player_id = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);

              if (player_id === angular.lowercase(id)) {
                collectMatchData(extendedWeapons, weaponsUsed, allStats, values);
                if (fireTeam[player_id]) {
                  getExtendedStats(entries[i], fireTeam[player_id].medals, fireTeam[player_id].abilityKills, fireTeam[player_id].extendedStats);
                  sumExistingStats(allStats, fireTeam, player_id, weaponsUsed, entries, i);
                } else {
                  getExtendedStats(entries[i], medals, abilityKills, extendedStats);
                  fireTeam[player_id] = {
                    allStats: allStats,
                    medals: medals,
                    abilityKills: abilityKills,
                    weaponsUsed: weaponsUsed,
                    extendedStats: extendedStats
                  };
                }
              } else {
                var teammateId = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);
                fireTeam[teammateId] = {
                  id: entries[i].player.destinyUserInfo.membershipId,
                  name: entries[i].player.destinyUserInfo.displayName,
                  membershipId: entries[i].player.destinyUserInfo.membershipId,
                  membershipType: entries[i].player.destinyUserInfo.membershipType,
                  emblem: 'http://www.bungie.net' + entries[i].player.destinyUserInfo.iconPath,
                  characterId: entries[i].characterId,
                  level: entries[i].player.characterLevel,
                  class: entries[i].player.characterClass
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
        angular.forEach(fireTeam, function (value) {
          value.recentMatches = recentMatches;
        });
      }
      return fireTeam;
    };

    var getLastFive = function (player) {
      var collectMatches = function (player) {
          var dfd = $q.defer();
          dfd.resolve(player.lastThree);

          return dfd.promise;
        },
        parallelLoad = function (previousMatches) {
          var methods = [];
          angular.forEach(previousMatches, function (value, key) {
            methods.push(getPostGame(previousMatches[key], player))
          });
          return $q.all(methods)
            .then($q.spread(function (match1, match2, match3) {
              getTeamSummary([match1, match2, match3], player);
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
      getLastFive: getLastFive,
      getTeamSummary: getTeamSummary
    };
  });
