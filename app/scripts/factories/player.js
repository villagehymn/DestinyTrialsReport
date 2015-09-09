'use strict';

function setMapBasedStats(mapStats, mapHash, reversedAct, n, totals) {
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
}

function setPastActivities(reversedAct, n, pastActivities) {
  pastActivities.push({
    'id': reversedAct[n].activityDetails.instanceId,
    'standing': reversedAct[n].values.standing.basic.value,
    'date': reversedAct[n].period,
    'dateAgo': moment(reversedAct[n].period).fromNow(),
    'kills': reversedAct[n].values.kills.basic.value,
    'kd': reversedAct[n].values.killsDeathsRatio.basic.displayValue,
    'deaths': reversedAct[n].values.deaths.basic.value,
    'assists': reversedAct[n].values.assists.basic.value
  });
}

function setLastThreeMatches(lastThree, activities) {
  for (var l = 0; l < 3; l++) {
    if (activities[l]){
      lastThree[activities[l].activityDetails.instanceId] = {
        'id': activities[l].activityDetails.instanceId,
        'standing': activities[l].values.standing.basic.value
      }
    }
  }
}

function setMapReturnStreak(reversedAct, pastActivities, streak, recentActivity, mapStats, totals) {
  for (var n = 0; n < reversedAct.length; n++) {
    setPastActivities(reversedAct, n, pastActivities);
    setMapBasedStats(mapStats, reversedAct[n].activityDetails.referenceId, reversedAct, n, totals);
    reversedAct[n].values.standing.basic.value === recentActivity.standing ? streak++ : streak = 0;
  }
  return streak;
}

function setActivityData(activities) {
  var lastThree = {}, reversedAct = activities.slice().reverse(),
    mapStats = {}, totals = {};
  totals.kills = 0;
  totals.deaths = 0;
  totals.assists = 0;
  totals.wins = 0;
  totals.losses = 0;
  var pastActivities = [], streak = 0;
  var recentActivity = {
    'id': activities[0].activityDetails.instanceId,
    'standing': activities[0].values.standing.basic.value
  };
  streak = setMapReturnStreak(reversedAct, pastActivities, streak, recentActivity, mapStats, totals);
  setLastThreeMatches(lastThree, activities);
  return {
    lastTwentyFive: pastActivities,
    recentActivity: recentActivity,
    streak: streak,
    lastThree: lastThree,
    mapStats: mapStats,
    totals: totals
  };
}

function setStatPercentage(player) {
  if (player.characterInfo && player.characterInfo.stats) {
    var stats = ['STAT_INTELLECT', 'STAT_DISCIPLINE', 'STAT_STRENGTH'];
    for (var s = 0; s < stats.length; s++) {
      var value = player.characterInfo.stats[stats[s]].value;
      var normalized = value > 170 ? 170 : value;
      var tiers = [];

      var remaining = value;
      for (var t = 0; t < 5; t++) {
        remaining -= tiers[t] = remaining > 34 ? 34 : remaining;
      }

      player.characterInfo.stats[stats[s]] = {
        name: statNames[stats[s]],
        value: value,
        percentage: +(100 * normalized / 170).toFixed(),
        tier: Math.floor(normalized / 34),
        tiers: tiers
      };
    }
  }
}

angular.module('trialsReportApp')
  .factory('Player', function () {

    function Player(data, name, character) {
      this.name = name;
      this.membershipId = data.membershipId;
      this.membershipType = data.membershipType;
      if (character.characterBase) {
        this.emblem = this.setEmblem(character.emblemPath, character.backgroundPath);
        this.characterInfo = this.setCharacterInfo(character);
        this.grimoire = character.characterBase.grimoireScore;
      } else {
        this.characterInfo = {characterId: character.characterId}
      }
    }

    Player.prototype.setCharacterInfo = function (character) {
      return {
        characterId: character.characterBase.characterId,
        className: className[character.characterBase.classType],
        classType: character.characterBase.classType,
        level: character.characterLevel,
        stats: character.characterBase.stats
      }
    };

    Player.prototype.setEmblem = function (icon, background) {
      return {
        icon: 'https://bungie.net' + icon,
        background: 'https://bungie.net' + background
      }
    };

    Player.prototype.setActivities = function (player, activities) {
      player.activities = setActivityData(activities);
      return player
    };

    Player.prototype.setInventory = function (player, weapons, armor, classItems) {
      player.inventory = {
        weapons: weapons.weapons,
        armor: armor.armors,
        classNodes: classItems.classNodes
      };
      if (player.characterInfo) {
        player.characterInfo.subclassName = classItems.subClass.name;
      }
      setStatPercentage(player, armor);
      player.emblem = this.setEmblem(classItems.bg[1], classItems.bg[0]);
      if (classItems.blink && weapons.shotgun) {
        player.inventory.weapons.hazards.push('Blink Shotgun');
      }
      if (classItems.hasFusionGrenade && armor.hasStarfireProtocolPerk) {
        player.inventory.armors.hazards.push('Double Grenade');
      }
      return player
    };


    Player.build = function (data, name, character) {
      var player = new Player(data, name, character);
      if (data.characters) {
        var characters = [];
        for (var i = 0; i < data.characters.length; i++) {
          characters.push(new Player(data, name, data.characters[i]))
        }
        player.characters = characters;
      }
      return player;
    };

    return Player;
  });
