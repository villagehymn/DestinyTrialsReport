'use strict';

var atts = ['kills', 'deaths', 'assists', 'precisionKills',
  'killsDeathsAssists', 'killsDeathsRatio', 'resurrectionsPerformed',
  'averageLifespan'];

var weaponAtts = ['uniqueWeaponKills', 'uniqueWeaponKillsPrecisionKills', 'uniqueWeaponPrecisionKills'];

function setOrIncrement(object, value, index) {
  if (object[index]){
    object[index].count += value.basic.value;
  }
  else {
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
    }
    else if (index.substring(0, 11) === 'weaponKills') {
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
      }
      else {
        fireTeam[player_id].weaponsUsed[key] = {referenceId: value.referenceId};
        for (var v = 0; v < weaponAtts.length; v++) {
          fireTeam[player_id].weaponsUsed[key][weaponAtts[v]] = value[weaponAtts[v]];
        }
      }
  });
  fireTeam[player_id].playerWeapons = entries[i].extended.weapons;
}

function addPlayerToFireteam(entries, i, fireTeam) {
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

angular.module('trialsReportApp')
  .factory('trialsStats', function ($http, $q) {

    var getData = function (player) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/trialsStats/' + player.membershipType + '/' + player.membershipId + '/' + player.characterId
      }).then(function (result) {
        if(!angular.isUndefined(result.data.stats)) {
          result.data.stats.activitiesWinPercentage = {
            'basic': {'value': +(100 * result.data.stats.activitiesWon.basic.value / result.data.stats.activitiesEntered.basic.value).toFixed()},
            'statId': 'activitiesWinPercentage'
          };
          result.data.stats.activitiesWinPercentage.basic.displayValue = result.data.stats.activitiesWinPercentage.basic.value + '%';
        }
        return result.data;
      });
    };

    var getTeamSummary = function (lastMatches, player) {
      return getMatchSummary(lastMatches, player.id)
    };

    var getPostGame = function (recentActivity, player) {
      return $http({
        method: 'GET',
        url: 'http://api2.destinytrialsreport.com/PostGameCarnageReport/' + recentActivity.id
      }).then(function (resultPostAct) {
        var dfd = $q.defer();
        player.lastThree[recentActivity.id].result = resultPostAct;
        dfd.resolve({result: resultPostAct, standing: recentActivity.standing, isMostRecent: recentActivity.mostRecent});

        return dfd.promise;
      }).catch(function () {});
    };

    var getFireteamFromActivitiy = function (recentActivity, id) {
      return $http({
        method: 'GET',
        url: 'http://api2.destinytrialsreport.com/PostGameCarnageReport/' + recentActivity.id
      }).then(function (resultPostAct) {
        var fireTeam = {};
        var data = resultPostAct.data.Response.data;
        var entries = data.entries, standing = recentActivity.standing;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].standing === standing) {
            var player_id = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);

            if (player_id !== angular.lowercase(id)) {
              addPlayerToFireteam(entries, i, fireTeam);
            }
          }
        }
        return fireTeam;
      }).catch(function () {});
    };

    var getMatchSummary = function (lastMatches, id) {
      var fireTeam = {}, matchStats = {}, recentMatches = [];
      angular.forEach(lastMatches, function (match, key) {
        if (lastMatches[key] && lastMatches[key].result) {
          var data = lastMatches[key].result.data.Response.data;
          var entries = data.entries, standing = lastMatches[key].standing;
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].standing === standing) {
              var values = entries[i].extended.values, medals = {},
                abilityKills = {}, allStats = {}, extendedStats = {},
                extendedWeapons = entries[i].extended.weapons, weaponsUsed = {};
              var player_id = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);
              if (player_id === angular.lowercase(id)) {
                collectMatchData(extendedWeapons, weaponsUsed, allStats, values);
                if (matchStats[player_id]) {
                  getExtendedStats(entries[i], matchStats[player_id].medals, matchStats[player_id].abilityKills, matchStats[player_id].extendedStats);
                  sumExistingStats(allStats, matchStats, player_id, weaponsUsed, entries, i);
                } else {
                  getExtendedStats(entries[i], medals, abilityKills, extendedStats);
                  matchStats[player_id] = {
                    allStats: allStats,
                    medals: medals,
                    abilityKills: abilityKills,
                    weaponsUsed: weaponsUsed,
                    extendedStats: extendedStats
                  };
                }
              } else {
                if (lastMatches[key].isMostRecent) {
                  addPlayerToFireteam(entries, i, fireTeam);
                }
              }
            }
          }
          var teamIndex = data.teams[0].standing.basic.value === standing ? 0 : 1;
          if (data.teams[teamIndex]) {
            recentMatches.push({
              standing: standing,
              team_score: data.teams[teamIndex].score.basic.value,
              enemy_score: data.teams[teamIndex == 0 ? 1 : 0].score.basic.value,
              dateAgo: moment(data.period).fromNow(),
              duration: data.entries[0].values.activityDurationSeconds.basic.displayValue
            });
            angular.forEach(matchStats, function (value) {
              value.recentMatches = recentMatches;
            });
          }
        }
      });
      return {fireTeam: fireTeam, matchStats: matchStats};
    };

    var getLastThree = function (player) {
      var collectMatches = function (player) {
          var dfd = $q.defer();
          if (player.searched) {
            player.lastThree[player.recentActivity.id].mostRecent = true;
          }
          dfd.resolve(player.lastThree);

          return dfd.promise;
        },
        postGameInParallel = function (previousMatches) {
          var methods = [];
          angular.forEach(previousMatches, function (value, key) {
            methods.push(getPostGame(previousMatches[key], player))
          });

          return $q.all(methods)
        },
        calculateMatchStats = function (postGames) {
          var dfd = $q.defer();
          dfd.resolve(getMatchSummary(postGames, player.id));

          return dfd.promise;
        },
        reportProblems = function (fault) {
          console.log(String(fault));
        };
      return collectMatches(player)
        .then(postGameInParallel)
        .then(calculateMatchStats)
        .catch(reportProblems);
    };

    return {
      getData: getData,
      getMatchSummary: getMatchSummary,
      getPostGame: getPostGame,
      getLastThree: getLastThree,
      getTeamSummary: getTeamSummary,
      getFireteamFromActivitiy: getFireteamFromActivitiy
    };
  });
