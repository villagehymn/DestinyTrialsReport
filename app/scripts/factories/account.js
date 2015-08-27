'use strict';

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

function setPastActivities(mapStats, mapHash, reversedAct, n, totals, pastActivities, $filter) {
  if (!angular.isObject(mapStats[mapHash])) {
    mapStats[mapHash] = {};
    mapStats[mapHash].kills = 0;
    mapStats[mapHash].deaths = 0;
    mapStats[mapHash].assists = 0;
    mapStats[mapHash].wins = 0;
    mapStats[mapHash].losses = 0;
  }
  var statAttributes = ['kills', 'deaths', 'assists'];
  for (var m = 0; m < statAttributes.length; m++) {
    mapStats[mapHash][statAttributes[m]] += reversedAct[n].values[statAttributes[m]].basic.value;
    totals[statAttributes[m]] += reversedAct[n].values[statAttributes[m]].basic.value;
  }
  if (reversedAct[n].values.standing.basic.value === 0) {
    mapStats[mapHash].wins += 1;
    totals.wins += 1;
  }
  else {
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

function setMapReturnStreak(reversedAct, mapStats, totals, pastActivities, $filter, streak, recentActivity) {
  for (var n = 0; n < reversedAct.length; n++) {
    var mapHash = reversedAct[n].activityDetails.referenceId;
    setPastActivities(mapStats, mapHash, reversedAct, n, totals, pastActivities, $filter);
    reversedAct[n].values.standing.basic.value === recentActivity.standing ? streak++ : streak = 0;
  }
  return streak;
}

function setLastThreeMatches(lastThree, activities) {
  for (var l = 0; l < 3; l++) {
    lastThree[activities[l].activityDetails.instanceId] = {
      'id': activities[l].activityDetails.instanceId,
      'standing': activities[l].values.standing.basic.value
    }
  }
}

function setActivityData(activities, $filter) {
  var mapStats = {}, lastThree = {}, reversedAct = activities.slice().reverse();
  var pastActivities = [], streak = 0, totals = {};
  var recentActivity = {
    'id': activities[0].activityDetails.instanceId,
    'standing': activities[0].values.standing.basic.value
  };
  totals.kills = 0;
  totals.deaths = 0;
  totals.assists = 0;
  totals.wins = 0;
  totals.losses = 0;
  streak = setMapReturnStreak(reversedAct, mapStats, totals, pastActivities, $filter, streak, recentActivity);
  setLastThreeMatches(lastThree, activities);
  return {
    pastActivities: pastActivities,
    recentActivity: recentActivity,
    streak: streak,
    totals: totals,
    mapStats: mapStats,
    lastThree: lastThree
  };
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
        var response = resultAcc.data.Response[0];
        return getCharacters(response.membershipType, response.membershipId, response.displayName);
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
        var __ret = setActivityData(activities, $filter);
        var pastActivities = __ret.pastActivities, recentActivity = __ret.recentActivity,
          streak = __ret.streak, totals = __ret.totals, mapStats = __ret.mapStats,
          lastThree = __ret.lastThree;
        return angular.extend(account, {
          recentActivity: recentActivity,
          pastActivities: pastActivities.reverse().slice(0, 24).reverse(),
          allActivities: pastActivities,
          lastThree: lastThree,
          winStreak: {'length': streak, 'type': recentActivity.standing},
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

    return {
      getAccount: getAccount,
      getActivities: getActivities,
      getLastTwentyOne: getLastTwentyOne,
      getCharacters: getCharacters
    };
  });
