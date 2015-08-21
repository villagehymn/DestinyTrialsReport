'use strict';

function getExtendedStats(member, medals, allStats, wKills) {
  angular.forEach(member.extended.values, function (value, index) {
    if (index.substring(0, 6) === 'medals') {
      medals.push({
        id: index,
        count: value.basic.value
      });
    }else if (index.substring(0, 11) === 'weaponKills') {
      wKills.push({
        id: index,
        count: value.basic.value
      });
    }
    else {
      allStats[index] = value;
    }
  });
}

function setPlayer(membershipId, name, membershipType, characters, i, className, classType, stats) {
  return {
    id: membershipId,
    name: name,
    membershipId: membershipId,
    membershipType: membershipType,
    characterId: characters[i].characterBase.characterId,
    className: className,
    classType: classType,
    level: characters[i].characterLevel,
    int: stats.STAT_INTELLECT.value,
    dis: stats.STAT_DISCIPLINE.value,
    str: stats.STAT_STRENGTH.value,
    grimoire: characters[i].characterBase.grimoireScore,
    background: ['https://bungie.net' + characters[i].backgroundPath],
    emblem: 'https://bungie.net' + characters[i].emblemPath
  };
}

function setCharacter(characters, membershipId, membershipType, name){
  var cResult = [];
  for (var i = 0; i < characters.length; i++) {
    var stats = characters[i].characterBase.stats;
    var classType = characters[i].characterBase.classType;
    var className = classType === 0 ? 'Titan' : (classType === 2 ? 'Warlock' : 'Hunter');
    cResult.push(
      setPlayer(membershipId, name, membershipType, characters, i, className, classType, stats)
    );
  }
  return cResult;
}

function setActivityData(mapStats, mapHash, reversedAct, n, totals, pastActivities, $filter) {
  if (!angular.isObject(mapStats[mapHash])) {
    mapStats[mapHash] = {};
    mapStats[mapHash].kills = 0;
    mapStats[mapHash].deaths = 0;
    mapStats[mapHash].assists = 0;
    mapStats[mapHash].wins = 0;
    mapStats[mapHash].losses = 0;
  }
  mapStats[mapHash].kills += reversedAct[n].values.kills.basic.value;
  mapStats[mapHash].deaths += reversedAct[n].values.deaths.basic.value;
  mapStats[mapHash].assists += reversedAct[n].values.assists.basic.value;
  totals.kills += reversedAct[n].values.kills.basic.value;
  totals.deaths += reversedAct[n].values.deaths.basic.value;
  totals.assists += reversedAct[n].values.assists.basic.value;
  if (reversedAct[n].values.standing.basic.value === 0) {
    mapStats[mapHash].wins += 1;
    totals.wins += 1;
  } else {
    mapStats[mapHash].losses += 1;
    totals.losses += 1;
  }
  pastActivities.push({
    'id': reversedAct[n].activityDetails.instanceId,
    'standing': reversedAct[n].values.standing.basic.value,
    'date': $filter('date')(reversedAct[n].period, 'yyyy-MM-dd h:mm'),
    'dateAgo': moment(reversedAct[n].period).fromNow(),
    'kills': reversedAct[n].values.kills.basic.value,
    'kd': reversedAct[n].values.killsDeathsRatio.basic.displayValue,
    'deaths': reversedAct[n].values.deaths.basic.value,
    'assists': reversedAct[n].values.assists.basic.value
  });
}

angular.module('trialsReportApp')
  .factory('currentAccount', function ($http, $filter, toastr) {
    var getAccount = function (sName, platform) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + sName + '/'
      }).then(function (resultAcc) {
        if (resultAcc.data.Response.length < 1) {
          toastr.error('Player not found', 'Error');
          return;
        }
        var name = resultAcc.data.Response[0].displayName;
        var membershipType = resultAcc.data.Response[0].membershipType;
        var membershipId = resultAcc.data.Response[0].membershipId;
        return getCharacters(membershipType, membershipId, name);
      }).catch(function () {});
    };

    var getCharacters = function (membershipType, membershipId, name) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/' + membershipType + '/Account/' + membershipId + '/'
      }).then(function (resultChar) {
        var allCharacters = setCharacter(resultChar.data.Response.data.characters, membershipId, membershipType, name);
        var player = allCharacters[0];
        player.otherCharacters = allCharacters;
        return player;
      }).catch(function () {});
    };

    var getActivities = function (account, count) {
      var aCount = count > 0 ? '&count='+ count : '&count=25';
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterId + '/?mode=14' + aCount
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player', 'Error');
          return account;
        }
        var pastActivities = [];
        var recentActivity = {
          'id': activities[0].activityDetails.instanceId,
          'standing': activities[0].values.standing.basic.value
        };
        var streak = 0;
        var totals = {};
        totals.kills = 0;
        totals.deaths = 0;
        totals.assists = 0;
        totals.wins = 0;
        totals.losses = 0;
        var mapStats = {};
        var reversedAct = activities.slice().reverse();
        for (var n = 0; n < reversedAct.length; n++) {
          var mapHash = reversedAct[n].activityDetails.referenceId;
          setActivityData(mapStats, mapHash, reversedAct, n, totals, pastActivities, $filter);
          reversedAct[n].values.standing.basic.value === recentActivity.standing ? streak++ : streak = 0;
        }

        return angular.extend(account, {
          recentActivity: recentActivity,
          pastActivities: pastActivities.reverse().slice(0, 24).reverse(),
          allActivities: pastActivities,
          lastThree: [activities[0], activities[1], activities[2]],
          winStreak: { 'length': streak, 'type' : recentActivity.standing  },
          mapStats: mapStats,
          totals: totals
        });
      }).catch(function () {});
    };

    var getLastTwentyOne = function (account, character) {
      var allPastActivities = [];
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + character.characterId + '/?mode=14&count=21'
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          return;
        }
        angular.forEach(activities.slice().reverse(), function (activity, index) {
          if (index % 5 === 0) {
            allPastActivities.push({
              'id': activity.activityDetails.instanceId,
              'standing': activity.values.standing.basic.value
            });
          }
        });
        return allPastActivities;
      }).catch(function () {});
    };

    var getPostGame = function (recentActivity) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/PostGameCarnageReport/' + recentActivity.id + '/'
      }).then(function (resultPostAct) {
        return resultPostAct;
      }).catch(function () {});
    };

    var getMatchSummary = function (recentActivity, id) {
      var fireTeam = {};
      return getPostGame(recentActivity)
        .then(function (lastMatch) {
          var entries = lastMatch.data.Response.data.entries;
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].standing === recentActivity.standing) {
                var medals = [], wKills = [], allStats = {};
                getExtendedStats(entries[i], medals, allStats, wKills);
              if (angular.lowercase(entries[i].player.destinyUserInfo.membershipId) === angular.lowercase(id)) {
                entries[i].allStats = allStats;
                entries[i].medals = medals;
                entries[i].wKills = wKills;
                entries[i].playerWeapons = entries[i].extended.weapons;
                fireTeam[angular.lowercase(entries[i].player.destinyUserInfo.membershipId)] = entries[i];
              } else {
                var teamMate = {
                  id: entries[i].player.destinyUserInfo.membershipId,
                  name: entries[i].player.destinyUserInfo.displayName,
                  membershipId: entries[i].player.destinyUserInfo.membershipId,
                  membershipType: entries[i].player.destinyUserInfo.membershipType,
                  emblem: 'http://www.bungie.net' + entries[i].player.destinyUserInfo.iconPath,
                  characterId: entries[i].characterId,
                  medals: medals,
                  wKills: wKills,
                  allStats: allStats,
                  playerWeapons: entries[i].extended.weapons,
                  level: entries[i].player.characterLevel,
                  class: entries[i].player.characterClass
                };
                fireTeam[angular.lowercase(teamMate.id)] = teamMate;
              }
            }
          }
          return fireTeam;
      }).catch(function () {});
    };

    return {
      getAccount: getAccount,
      getActivities: getActivities,
      getMatchSummary: getMatchSummary,
      getLastTwentyOne: getLastTwentyOne,
      getCharacters: getCharacters,
      getPostGame: getPostGame
    };
  });
