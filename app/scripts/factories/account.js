'use strict';

angular.module('trialsReportApp')
  .factory('currentAccount', function($http, requestUrl, $filter, toastr) {
    var path = requestUrl.url;

    function getExtendedStats(member, medals, allStats) {
      angular.forEach(member.extended.values, function (value, index) {
        if (index.substring(0, 6) == "medals") {
          medals.push({
            id: index,
            count: value.basic.value
          });
        } else {
          allStats[index] = value;
        }
      });
    }

    var getAccount = function(sName, platform) {
      return $http({method:'GET', url: path + 'Destiny/SearchDestinyPlayer/' + platform + '/' + sName + '/'}).then(function(resultAcc){
        if (resultAcc.data.Response.length < 1){
          toastr.error('Player not found', 'Error');
          return;
        }
        var name = resultAcc.data.Response[0].displayName;
        var membershipType = resultAcc.data.Response[0].membershipType;
        var membershipId = resultAcc.data.Response[0].membershipId;
        return $http({method:'GET', url: path + 'Destiny/' + membershipType +'/Account/' + membershipId + '/'}).then(function(resultChar){
          var stats = resultChar.data.Response.data.characters[0].characterBase.stats;
          var int = stats.STAT_INTELLECT.value;
          var dis = stats.STAT_DISCIPLINE.value;
          var str = stats.STAT_STRENGTH.value;
          var allCharacters = resultChar.data.Response.data.characters;
          var characterId = resultChar.data.Response.data.characters[0].characterBase.characterId;
          var level = resultChar.data.Response.data.characters[0].characterLevel;
          var grimoire = resultChar.data.Response.data.characters[0].characterBase.grimoireScore;
          var background = ['http://bungie.net' + resultChar.data.Response.data.characters[0].backgroundPath];
          var emblem = 'http://bungie.net' + resultChar.data.Response.data.characters[0].emblemPath;
          return {
            id: membershipId,
            name: name,
            membershipId: membershipId,
            membershipType: membershipType,
            characterId: characterId,
            allCharacters: allCharacters,
            level: level,
            int: int,
            dis: dis,
            str: str,
            grimoire: grimoire,
            background: background,
            emblem: emblem
          };
        });
      }).catch(function(e, r){
      });
    };

    var getActivities = function(account) {
      return $http({method:'GET', url: path + 'Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterId  + '/?mode=14&count=100'}).then(function(resultAct){
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player' , 'Error');
          return;
        }
        var pastActivities = [];
        var recentActivity = {'id': activities[0].activityDetails.instanceId, 'standing': activities[0].values.standing.basic.value};
        var totals = {};
        totals.kills = 0;
        totals.deaths = 0;
        totals.assists = 0;
        totals.wins = 0;
        totals.losses = 0;
        var mapStats = {};
        angular.forEach(activities.slice().reverse(),function(activity){
          var mapHash = activity.activityDetails.referenceId;
          if (!angular.isObject(mapStats[mapHash])){
            mapStats[mapHash] = {};
            mapStats[mapHash].kills = 0;
            mapStats[mapHash].deaths = 0;
            mapStats[mapHash].assists = 0;
            mapStats[mapHash].wins = 0;
            mapStats[mapHash].losses = 0;
          }
          mapStats[mapHash].kills += activity.values.kills.basic.value;
          mapStats[mapHash].deaths += activity.values.deaths.basic.value;
          mapStats[mapHash].assists += activity.values.assists.basic.value;
          totals.kills += activity.values.kills.basic.value;
          totals.deaths += activity.values.deaths.basic.value;
          totals.assists += activity.values.assists.basic.value;
          if (activity.values.standing.basic.value === 0) {
            mapStats[mapHash].wins += 1;
            totals.wins += 1;
          } else {
            mapStats[mapHash].losses += 1;
            totals.losses += 1;
          }
          pastActivities.push({'id': activity.activityDetails.instanceId,
            'standing': activity.values.standing.basic.value,
            'date': $filter('date')(activity.period, 'yyyy-MM-dd h:mm'), 'kills': activity.values.kills.basic.value,
            'kd': activity.values.killsDeathsRatio.basic.displayValue,
            'deaths': activity.values.deaths.basic.value, 'assists': activity.values.assists.basic.value});
        });
        return angular.extend(account, {
          recentActivity: recentActivity,
          pastActivities: pastActivities.reverse().slice(0, 24).reverse(),
          allActivities: pastActivities,
          mapStats: mapStats,
          totals: totals
        });
      }).catch(function(e, r){
      });
    };

    var getLastTwentyOne = function(account, character) {
      var allPastActivities = [];
      return $http({method:'GET', url: path + 'Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + character.characterBase.characterId  + '/?mode=14&count=21'}).then(function(resultAct){
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          return;
        }
        angular.forEach(activities.slice().reverse(),function(activity,index){
          if (index % 3 === 0 ){
            allPastActivities.push({'id': activity.activityDetails.instanceId,
              'standing': activity.values.standing.basic.value});
          }
        });
        return allPastActivities;
      }).catch(function(e, r){ });
    };


    var getMatchSummary = function(recentActivity, name, includeTeam) {
      return $http({method:'GET', url: path + 'Destiny/Stats/PostGameCarnageReport/' + recentActivity.id + '/'}).then(function(resultPostAct) {
        var fireTeam = [];
        var fireteamIndex = [];
        //console.log(resultPostAct.data.Response.data.entries);
        //if (recentActivity.standing === 0){
        //  fireteamIndex = [0,1,2];
        //}else {
        //  fireteamIndex = [3,4,5];
        //}
        angular.forEach(resultPostAct.data.Response.data.entries,function(entry) {
          if (entry.standing === recentActivity.standing){
            var medals = [];
            var allStats = {};
            if (includeTeam){
              fireTeam.push(entry);
            }else {
              if (angular.lowercase(entry.player.destinyUserInfo.displayName) == angular.lowercase(name)) {
                getExtendedStats(entry, medals, allStats);
                entry.allStats = allStats;
                entry.medals = medals;
                entry.playerWeapons = entry.extended.weapons;
                fireTeam.push(entry);
              }
            }
          }
        });
        //angular.forEach(fireteamIndex,function(idx) {
        //  var medals = [];
        //  var allStats = {};
        //  var entry = resultPostAct.data.Response.data.entries[idx];
        //  if (includeTeam){
        //    fireTeam.push(entry);
        //  }else {
        //    if (angular.lowercase(entry.player.destinyUserInfo.displayName) == angular.lowercase(name)) {
        //      getExtendedStats(entry, medals, allStats);
        //      entry.allStats = allStats;
        //      entry.medals = medals;
        //      entry.playerWeapons = entry.extended.weapons;
        //      fireTeam.push(entry);
        //    }
        //  }
        //});
        return fireTeam;
      }).catch(function(e, r){
      });
    };

    var getFireteam = function(recentActivity, name) {
      var fireTeam = [];
      var playerMedals = [];
      var playerWeapons = [];
      var playerAllStats = {};
      return getMatchSummary( recentActivity, name, true )
        .then( function( lastMatch )
        {
          angular.forEach(lastMatch,function(member) {
            var player = member.player;
            var medals = [];
            var allStats = {};
            getExtendedStats(member, medals, allStats);
            if (angular.lowercase(player.destinyUserInfo.displayName) !== angular.lowercase(name)) {
              fireTeam.push({
                id: player.destinyUserInfo.membershipId,
                name: player.destinyUserInfo.displayName,
                membershipId: player.destinyUserInfo.membershipId,
                membershipType: player.destinyUserInfo.membershipType,
                emblem: 'http://www.bungie.net/' + player.destinyUserInfo.iconPath,
                characterId: member.characterId,
                medals: medals,
                allStats: allStats,
                prevousWeapons: member.extended.weapons,
                level: player.characterLevel,
                class: player.characterClass
              });
            }else{
              playerAllStats = allStats;
              playerMedals = medals;
              playerWeapons = member.extended.weapons;
            }
          });
          return {fireTeam: fireTeam, medals: playerMedals, playerWeapons: playerWeapons, playerAllStats: playerAllStats};
        });
      };
    return { getAccount: getAccount, getActivities: getActivities, getMatchSummary: getMatchSummary, getFireteam: getFireteam, getLastTwentyOne: getLastTwentyOne };
  });
