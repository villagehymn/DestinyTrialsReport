'use strict';

angular.module('trialsReportApp')
  .factory('currentAccount', function($http, requestUrl, $filter, toastr) {
    var path = requestUrl.url;
    var getAccount = function(name, platform) {
      return $http({method:'GET', url: path + 'Destiny/SearchDestinyPlayer/' + platform + '/' + name + '/'}).then(function(resultAcc){
        if (resultAcc.data.Response.length < 1){
          toastr.error('Player not found', 'Error');
          return;
        }
        var name = resultAcc.data.Response[0].displayName;
        var membershipType = resultAcc.data.Response[0].membershipType;
        var membershipId = resultAcc.data.Response[0].membershipId;
        return $http({method:'GET', url: path + 'Destiny/' + membershipType +'/Account/' + membershipId + '/?definitions=true'}).then(function(resultChar){
          var stats = resultChar.data.Response.data.characters[0].characterBase.stats;
          var int = stats.STAT_INTELLECT.value;
          var dis = stats.STAT_DISCIPLINE.value;
          var str = stats.STAT_STRENGTH.value;
          var allItems = resultChar.data.Response.definitions.items;
          var allPerks = resultChar.data.Response.definitions.perks;
          var allCharacters = resultChar.data.Response.data.characters;
          var characterId = resultChar.data.Response.data.characters[0].characterBase.characterId;
          //var equipment = resultChar.data.Response.data.characters[0].characterBase.peerView.equipment;
          var level = resultChar.data.Response.data.characters[0].characterLevel;
          var grimoire = resultChar.data.Response.data.characters[0].characterBase.grimoireScore;
          var background = ['http://bungie.net' + resultChar.data.Response.data.characters[0].backgroundPath];
          var emblem = 'http://bungie.net' + resultChar.data.Response.data.characters[0].emblemPath;
          var armors = [];
          var subClass = [];
          return {
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
            emblem: emblem,
            items: allItems,
            perks: allPerks,
            armors: armors,
            class: subClass
          };
        });
      }).catch(function(e, r){
      });
    };

    var getActivities = function(account) {
      return $http({method:'GET', url: path + 'Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterId  + '/?mode=14&count=100&definitions=true'}).then(function(resultAct){
        var activities = resultAct.data.Response.data.activities;
        var definitions = resultAct.data.Response.definitions;
        var maps = definitions.activities;
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player' , 'Error');
          return;
        }
        var pastActivities = [];
        var recentActivity = {'id': activities[0].activityDetails.instanceId, 'standing': activities[0].values.standing.basic.value};
        var streak = [];
        var totals = {};
        totals.kills = 0;
        totals.deaths = 0;
        totals.assists = 0;
        totals.wins = 0;
        totals.losses = 0;
        var mapStats = {};
        angular.forEach(activities.slice().reverse(),function(activity){
          var mapName = maps[activity.activityDetails.referenceId].activityName;
          if (!angular.isObject(mapStats[mapName])){
            mapStats[mapName] = {};
            mapStats[mapName].kills = 0;
            mapStats[mapName].deaths = 0;
            mapStats[mapName].assists = 0;
            mapStats[mapName].wins = 0;
            mapStats[mapName].losses = 0;
          }
          mapStats[mapName].kills += activity.values.kills.basic.value;
          mapStats[mapName].deaths += activity.values.deaths.basic.value;
          mapStats[mapName].assists += activity.values.assists.basic.value;
          totals.kills += activity.values.kills.basic.value;
          totals.deaths += activity.values.deaths.basic.value;
          totals.assists += activity.values.assists.basic.value;
          if (activity.values.standing.basic.value === 0) {
            mapStats[mapName].wins += 1;
            totals.wins += 1;
          } else {
            mapStats[mapName].losses += 1;
            totals.losses += 1;
          }
          pastActivities.push({'id': activity.activityDetails.instanceId,
            'standing': activity.values.standing.basic.value,
            'date': $filter('date')(activity.period, 'yyyy-MM-dd h:mm'), 'kills': activity.values.kills.basic.value,
            'kd': activity.values.killsDeathsRatio.basic.displayValue,
            'deaths': activity.values.deaths.basic.value, 'assists': activity.values.assists.basic.value});
        });
        console.log(mapStats);
        return angular.extend(account, {
          streak: streak,
          recentActivity: recentActivity,
          pastActivities: pastActivities.slice(0, 24),
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
        if (recentActivity.standing === 0){
          fireteamIndex = [0,1,2];
        }else {
          fireteamIndex = [3,4,5];
        }
        angular.forEach(fireteamIndex,function(idx) {
          var medals = [];
          var allStats = {};
          var entry = resultPostAct.data.Response.data.entries[idx];
          if (includeTeam){
            fireTeam.push(entry);
          }else {
            if (angular.lowercase(entry.player.destinyUserInfo.displayName) == angular.lowercase(name)) {
              angular.forEach(entry.extended.values,function(value,index){
                if (index.substring(0, 6) == "medals"){
                  medals.push({id: index,
                    count: value.basic.value});
                }else {
                  allStats[index] = value;
                }
              });
              entry.allStats = allStats;
              entry.medals = medals;
              entry.playerWeapons = entry.extended.weapons;
              fireTeam.push(entry);
            }
          }
        });
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
            angular.forEach(member.extended.values,function(value,index){
              if (index.substring(0, 6) == "medals"){
                medals.push({id: index,
                  count: value.basic.value});
              }else {
                allStats[index] = value;
              }
            });
            if (angular.lowercase(player.destinyUserInfo.displayName) !== angular.lowercase(name)) {
              fireTeam.push({
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
