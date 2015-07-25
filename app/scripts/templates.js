angular.module('trialsReportApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/fireteam/armor.html',
    "<div class=\"row ml-0 mr-0\" data-intro=\"Current equipped armor <br/><em>hover over image for the name</em>\" data-position=\"left\" data-class=\"green\">\n" +
    "  <div class=\"col-md-3 col-xs-3\" ng-repeat=\"armor in [player.armors.head, player.armors.arms, player.armors.chest, player.armors.legs] track by $index\">\n" +
    "    <div class=\"card\">\n" +
    "      <div class=\"front p-0\">\n" +
    "        <img popover=\"{{armor.armor.name}}\" popover-trigger=\"mouseenter\" class=\"img-responsive\" ng-src=\"{{armor.armor.icon}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/history.html',
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-3 pr-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Kills</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.kills.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-3 p-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Deaths</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.deaths.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-3 p-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Assists</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.assists.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-3 pl-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">K/D</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.killsDeathsRatio.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-4 pr-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Headshots<!-- (Sniper)--></h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.precisionKills.basic.displayValue\"><!-- ({{player.allStats.weaponKillsSniper.basic.displayValue || 0}})--></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-4 p-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Longest Life</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.longestSingleLife.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-4 pl-0\">\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h5 class=\"custom-font filled bg-danger\">Revives</h5>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 p-0 text-center\">\n" +
    "      <h4 class=\"mt-0\" ng-bind=\"player.allStats.resurrectionsPerformed.basic.displayValue\"></h4>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-6 {{$even ? '' : 'pl-0'}}\" ng-repeat=\"weapon in player.playerWeapons\">\n" +
    "    <div class=\"col-xs-6 text-center p-0\">\n" +
    "      <a class=\"icon icon-default\" popover=\"{{DestinyWeaponDefinition[weapon.referenceId].name}}\" popover-trigger=\"mouseenter\">\n" +
    "        <img class=\"img-responsive\" ng-src=\"{{DestinyWeaponDefinition[weapon.referenceId].icon || ''}}\">\n" +
    "      </a>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-6 text-center p-0\">\n" +
    "      <p class=\"text-left text-sm m-0 mt-10\">\n" +
    "        <strong>Kills:</strong>\n" +
    "        <span ng-bind=\"weapon.values.uniqueWeaponKills.basic.value\"></span>\n" +
    "      </p>\n" +
    "      <p class=\"text-left text-sm m-0\">\n" +
    "        <strong>Headshots:</strong>\n" +
    "        <span ng-bind=\"weapon.values.uniqueWeaponPrecisionKills.basic.value\"></span>\n" +
    "      </p>\n" +
    "      <p class=\"text-left text-sm m-0 mb-10\">\n" +
    "        <strong>HS Acc:</strong>\n" +
    "        <span ng-bind=\"weapon.values.uniqueWeaponKillsPrecisionKills.basic.displayValue\"></span>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-4 col-md-3 text-center\" style=\"height:120px\" ng-repeat=\"medal in player.medals\">\n" +
    "    <a class=\"icon\" popover=\"{{DestinyMedalDefinition[medal.id].statDescription}}\" popover-trigger=\"mouseenter\">\n" +
    "      <img class=\"img-responsive\" ng-src=\"{{('http://www.bungie.net' + DestinyMedalDefinition[medal.id].iconImage) || ''}}\">\n" +
    "    </a>\n" +
    "    <p class=\"text-sm\" ng-bind=\"DestinyMedalDefinition[medal.id].statName\"></p>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/info.html',
    "<div class=\"card-container emblem\" data-intro=\"Hovering over the playercard will reveal subclass perks\" data-position=\"left\" data-class=\"blue-grey\">\n" +
    "  <div class=\"card mb-0\" style=\"background-image: url('{{player.emblem}}'), url('{{player.background[0]}}'); background-repeat: no-repeat, no-repeat; background-position: left, right; background-size: 65px 65px, 100% 65px; height: 65px\">\n" +
    "    <div class=\"front p-0\" data-intro=\"Trials <strong>k/d</strong> and <strong>win %</strong> for this <strong>character</strong><br/>Flawless based on account lifetime, <strong>not</strong> weekly stat\" data-position=\"right\" data-class=\"green\">\n" +
    "      <p class=\"large mb-0\">\n" +
    "        <span ng-bind=\"player.name\"></span>\n" +
    "        <span ng-show=\"player.stats.killsDeathsRatio\" class=\"right pr-10\">\n" +
    "          <span class=\"hidden-xs\">K/D:</span>\n" +
    "          <span ng-bind=\"player.stats.killsDeathsRatio.basic.displayValue\"></span>\n" +
    "        </span>\n" +
    "      </p>\n" +
    "      <p class=\"mb-0\">\n" +
    "        <span ng-show=\"player.level && player.class.name\">\n" +
    "          <span class=\"hidden-xs\">Level</span>\n" +
    "          <span ng-bind=\"player.level\"></span>\n" +
    "          <span ng-bind=\"player.class.name\"></span>\n" +
    "        </span>\n" +
    "        <span ng-show=\"player.stats.activitiesEntered\" class=\"right pr-10\">\n" +
    "          Win<span class=\"hidden-xs\"> Avg</span>:\n" +
    "          <span ng-bind=\"((player.stats.activitiesWon.basic.value/player.stats.activitiesEntered.basic.value)*100).toFixed(0)\"></span>%\n" +
    "        </span>\n" +
    "      </p>\n" +
    "      <div class=\"mb-0 mr-0 ml-0 row\">\n" +
    "        <div class=\"col-md-6 col-md-offset-6 col-xs-6 col-xs-offset-6 text-right pr-0\">\n" +
    "          <span class=\"right text-white pr-10\" ng-show=\"player.lighthouse === false && !player.neverTrials\">Never Flawless</span>\n" +
    "          <span class=\"right text-white pr-10\" ng-show=\"player.lighthouse === true\">Flawless</span>\n" +
    "          <p class=\"text-center mb-0 pr-10\" ng-show=\"player.neverTrials\">No previous trials games</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"back\">\n" +
    "      <div class=\"col-md-12 col-xs-12\">\n" +
    "        <div class=\"col-md-6 col-xs-6\" ng-repeat=\"classNode in player.classNodes\">\n" +
    "          <a class=\"icon icon-white m-0\" style=\"margin-top:4px!important; margin-right:5px!important; width:25px; height:25px\" popover=\"{{classNode.description}}\" popover-trigger=\"mouseenter\">\n" +
    "            <img class=\"img-responsive\" ng-src=\"{{classNode.icon || ''}}\">\n" +
    "          </a>\n" +
    "          <span class=\"text-left text-sm text-white\" style=\"top:10px; position:absolute\" ng-bind=\"classNode.name\"></span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/maps.html',
    "<div class=\"row\">\n" +
    "  <div class=\"col-md-12 col-xs-12\">\n" +
    "    <table class=\"table table-striped\">\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th></th>\n" +
    "        <th>K</th>\n" +
    "        <th>D</th>\n" +
    "        <th>A</th>\n" +
    "        <th>W</th>\n" +
    "        <th>L</th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr ng-repeat=\"(key, value) in player.mapStats\">\n" +
    "        <td>{{DestinyTrialsDefinitions[key].activityName}}</td>\n" +
    "        <td>{{value.kills}}</td>\n" +
    "        <td>{{value.deaths}}</td>\n" +
    "        <td>{{value.assists}}</td>\n" +
    "        <td>{{value.wins}}</td>\n" +
    "        <td>{{value.losses}}</td>\n" +
    "      </tr>\n" +
    "      <tr>\n" +
    "        <td><strong>Total</strong></td>\n" +
    "        <td><strong>{{player.totals.kills}}</strong></td>\n" +
    "        <td><strong>{{player.totals.deaths}}</strong></td>\n" +
    "        <td><strong>{{player.totals.assists}}</strong></td>\n" +
    "        <td><strong>{{player.totals.wins}}</strong></td>\n" +
    "        <td><strong>{{player.totals.losses}}</strong></td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/player.html',
    "<ng-include src=\"infoPartial\"></ng-include>\n" +
    "\n" +
    "<tabset class=\"tabs-dark col-xs-12 p-0 mb-10\" justified=\"true\">\n" +
    "  <tab heading=\"Equipped\">\n" +
    "    <ng-include src=\"statPartial\"></ng-include>\n" +
    "    <ng-include src=\"'views/fireteam/weapons.html'\"></ng-include>\n" +
    "    <ng-include src=\"'views/fireteam/armor.html'\"></ng-include>\n" +
    "  </tab>\n" +
    "  <tab heading=\"Last Match\" analytics-on analytics-event=\"Click\" analytics-category=\"Last Match\">\n" +
    "    <ng-include src=\"'views/fireteam/history.html'\"></ng-include>\n" +
    "  </tab>\n" +
    "  <tab heading=\"Maps\" analytics-on analytics-event=\"Click\" analytics-category=\"Maps\">\n" +
    "    <ng-include src=\"'views/fireteam/maps.html'\"></ng-include>\n" +
    "  </tab>\n" +
    "</tabset>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12 hidden-xs hidden-sm\">\n" +
    "    <a class=\"btn btn-block btn-default bg-info dker\" href=\"http://destinytracker.com/destiny/trials/{{player.membershipType === 2 ? 'ps' : 'xbox'}}/{{player.name}}\" target=\"_blank\" type=\"button\" analytics-on analytics-event=\"Click\" analytics-category=\"DestinyTracker\" data-intro=\"Links to <strong>DestinyTracker</strong> for more detailed statistics based on all characters and maps\" data-position=\"bottom\">\n" +
    "       View DestinyTracker Stats\n" +
    "     </a>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/stats.html',
    "<div class=\"row ml-0 mr-0\" style=\"margin-top:-3px\">\n" +
    "  <div class=\"col-md-12 col-sm-12 col-xs-12 pl-0 pr-0\" data-intro=\"Bar size relative to the percentage of the sum<br/><em>hover over the icons for true percentage</em>\" data-position=\"left\" data-class=\"green\">\n" +
    "    <progress animate=\"true\" class=\"progress-striped not-rounded m-0\">\n" +
    "      <bar value=\"player.cIntPercent | number: 1\" popover=\"Intellect: {{player.int}} ({{player.intPercent}}%)\" popover-trigger=\"mouseenter\" type=\"greensea\">\n" +
    "        <span ng-show=\"player.cIntPercent >= 27\">Intellect {{player.intPercent}}%</span>\n" +
    "        <span ng-show=\"player.cIntPercent <  27 && player.cIntPercent >= 16\">Int {{player.intPercent}}%</span>\n" +
    "        <span ng-show=\"player.cIntPercent <  16\">Int</span>\n" +
    "      </bar>\n" +
    "      <bar value=\"player.cDisPercent | number: 1\" popover=\"Discipline: {{player.dis}} ({{player.disPercent}}%)\" popover-trigger=\"mouseenter\">\n" +
    "        <span ng-show=\"player.cDisPercent >= 27\">Discipline {{player.disPercent}}%</span>\n" +
    "        <span ng-show=\"player.cDisPercent <  27 && player.cDisPercent >= 16\">Dis {{player.disPercent}}%</span>\n" +
    "        <span ng-show=\"player.cDisPercent <  16\">Dis</span>\n" +
    "      </bar>\n" +
    "      <bar value=\"player.cStrPercent | number: 1\" popover=\"Strength: {{player.str}} ({{player.strPercent}}%)\" popover-trigger=\"mouseenter\" type=\"warning\">\n" +
    "        <span ng-show=\"player.cStrPercent >= 27\">Strength {{player.strPercent}}%</span>\n" +
    "        <span ng-show=\"player.cStrPercent <  27 && player.cStrPercent >= 16\">Str {{player.strPercent}}%</span>\n" +
    "        <span ng-show=\"player.cStrPercent <  16\">Str</span>\n" +
    "      </bar>\n" +
    "    </progress>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row ml-0 mr-0 mb-10\" data-intro=\"Match win/loss history<br/><em>hover over the icons for details</em>\" data-position=\"right\" data-class=\"red\">\n" +
    "  <div class=\"col-xs-12 pr-0 pl-0 text-center win-loss\">\n" +
    "    <i class=\"fa fa-circle mr-3 {{$index < 7 ? (player.pastActivities.length - $index ) > 18 ? 'hidden-xs' : '' : ''}}\" ng-repeat=\"str in player.pastActivities track by $index\" ng-class=\"str.standing === 0 ? 'win' : 'lose'\" popover=\"K/D: {{str.kd}} with {{str.kills}} kills\" popover-title=\"{{str.date | date : format : medium}}\" popover-trigger=\"mouseenter\"></i>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/fireteam/weapons.html',
    "<div data-intro=\"Weapon images and perks, border color displays damage element, grey if kinetic. </br> <em>Hover over image for weapon name</em>\" data-position=\"left\" data-class=\"blue\">\n" +
    "  <div class=\"row ml-0 mr-0\" style=\"height:130px\" ng-repeat=\"weapon in [player.weapons.primary, player.weapons.special, player.weapons.heavy] track by $index\">\n" +
    "    <div class=\"col-md-4 col-xs-4 pt-10\">\n" +
    "      <div class=\"card mb-0\">\n" +
    "        <div class=\"front p-0\">\n" +
    "          <img popover=\"{{weapon.weapon.name}}\" popover-trigger=\"mouseenter\" class=\"img-responsive weapon-img {{weapon.weapon.burnColor || 'kinetic-dmg'}}\" ng-src=\"{{weapon.weapon.icon}}\" alt=\"{{weapon.weapon.name}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-8 pt-10\">\n" +
    "      <div ng-if=\"!($first || $last)\" style=\"width:224px; height:105px; position:absolute; z-index:-1\" data-intro=\"Unlocked and active weapon perks <br/><em>hover over the icons for the desciption</em>\" data-position=\"right\" data-class=\"blue\"></div>\n" +
    "      <div class=\"row\" ng-repeat=\"node in weapon.nodes\" ng-show=\"node.name\">\n" +
    "        <div class=\"col-xs-2\">\n" +
    "          <a class=\"icon icon-default\" style=\"margin:0px; width:22px; height:22px\" popover=\"{{node.description}}\" popover-trigger=\"mouseenter\">\n" +
    "            <img class=\"img-responsive\" ng-src=\"{{node.icon || ''}}\">\n" +
    "          </a>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-10\">\n" +
    "          <span class=\"text-left text-sm\" ng-bind=\"node.name\"></span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('views/main.html',
    "<ng-include src=\"headerPartial\"></ng-include>\n" +
    "\n" +
    "<div class=\"container\" ng-hide=\"status\">\n" +
    "  <div class=\"row\">\n" +
    "    <div class=\"col-xs-12 col-md-4\" ng-if=\"fireteam[0].name\" ng-repeat=\"player in fireteam track by $index\">\n" +
    "      <div class=\"row ml-0 mr-0\" ng-show=\"$index === 0\">\n" +
    "        <div class=\"btn-group btn-group-justified\">\n" +
    "          <div class=\"btn-group\">\n" +
    "            <button class=\"btn btn-success\" type=\"button\" ng-click=\"refreshInventory()\" analytics-on analytics-event=\"Click\" analytics-category=\"Refresh Inventory\">\n" +
    "                    Refresh Inventory\n" +
    "            </button>\n" +
    "          </div>\n" +
    "          <div class=\"btn-group\">\n" +
    "            <button class=\"btn btn-default\" type=\"button\" ng-click=\"suggestRecentPlayers()\" analytics-on analytics-event=\"Click\" analytics-category=\"Suggest Recent Players\">\n" +
    "                    Suggest <span class=\"hidden-xs hidden-md\">Recent </span>Players\n" +
    "            </button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"row\" ng-hide=\"$index === 0\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "          <form class=\"form-horizontal\" role=\"form\" ng-submit=\"searchPlayerbyName(teammateName, platformValue, $index)\">\n" +
    "            <div class=\"input-group\">\n" +
    "              <div ng-show=\"recentPlayers\" class=\"input-group-btn\">\n" +
    "                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenuMobile{{($index)}}\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">\n" +
    "                  Recent Players\n" +
    "                  <span class=\"caret\"></span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuMobile{{$index}}\">\n" +
    "                  <li ng-repeat=\"player in recentPlayers track by $index\">\n" +
    "                    <a ng-bind=\"player.name\" ng-click=\"setRecentPlayer(player, ($parent.$index))\" analytics-on analytics-event=\"Click\" analytics-category=\"Recent From Dropdown\">\n" +
    "                    </a>\n" +
    "                  </li>\n" +
    "                </ul>\n" +
    "              </div>\n" +
    "              <input type=\"text\" class=\"form-control\" placeholder=\"Search for...\" ng-model=\"teammateName\">\n" +
    "              <span class=\"input-group-btn\">\n" +
    "                <button class=\"btn btn-default\" type=\"submit\">Search</button>\n" +
    "              </span>\n" +
    "            </div>\n" +
    "          </form>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"row\" style=\"height:18px\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "          <span class=\"label bg-danger\" style=\"margin-right:2px\" ng-repeat=\"hazard in player.weapons.hazards.concat(player.armors.hazards, player.classNodes.hazards) track by $index\" ng-bind=\"hazard\" popover=\"{{DestinyHazardDefinition[hazard]}}\" popover-trigger=\"mouseenter\">\n" +
    "          </span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <section class=\"tile tile-simple\">\n" +
    "        <div class=\"tile-body p-0\">\n" +
    "          <ng-include src=\"'views/fireteam/player.html'\"></ng-include>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!fireteam[0].name\" help-overlay=\"helpOverlay\" class=\"col-xs-12 col-md-4 col-md-offset-4 hidden-xs hidden-sm\" ng-repeat=\"player in [dummyFireteam] track by $index\">\n" +
    "      <div class=\"row\">\n" +
    "        <div ng-show=\"$index === 0\" class=\"col-xs-12\" popover=\"This button populates suggested fireteam members based on past trials history. Best for use in case our generated fireteam doesnt\n" +
    "             match up with the game, there is no way to look at current fireteams so we are pulling data from the previous played game.\" popover-placement=\"bottom\">\n" +
    "          <button class=\"btn btn-block btn-default\" type=\"button\">Suggest Recent Players</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"row\" style=\"height:18px\">\n" +
    "        <div class=\"col-xs-12 p-0 ml-15\" data-intro=\"Useful hazards about the player\" data-position=\"left\" data-class=\"red\">\n" +
    "          <span class=\"label bg-danger\" style=\"margin-right:2px\" ng-repeat=\"hazard in player.weapons.hazards.concat(player.armors.hazards, player.classNodes.hazards) track by $index\" ng-bind=\"hazard\" popover=\"{{DestinyHazardDefinition[hazard]}}\" popover-trigger=\"mouseenter\">\n" +
    "          </span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <section class=\"tile tile-simple\">\n" +
    "        <div class=\"tile-body p-0\">\n" +
    "          <ng-include src=\"playerPartial\"></ng-include>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<ng-include src=\"'views/shared/footer.html'\"></ng-include>"
  );


  $templateCache.put('views/shared/footer.html',
    "<footer class=\"footer\">\n" +
    "  <div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "      <div class=\"col-md-6 col-xs-6\">\n" +
    "        <h5 class=\"custom-font pt-10 text-left\">© 2015 DestinyTrialsReport</h5>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-6 col-xs-6 mt-5\">\n" +
    "        <form action=\"https://www.paypal.com/cgi-bin/webscr\" method=\"post\" class=\"text-right\" target=\"_top\">\n" +
    "          <input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">\n" +
    "          <input type=\"hidden\" name=\"hosted_button_id\" value=\"A3T6F2QDXUTCN\">\n" +
    "          <input type=\"image\" src=\"https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">\n" +
    "          <img alt=\"\" border=\"0\" src=\"https://www.paypalobjects.com/en_US/i/scr/pixel.gif\" width=\"1\" height=\"1\">\n" +
    "        </form>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</footer>"
  );


  $templateCache.put('views/shared/header.html',
    "<div class=\"header\">\n" +
    "  <div class=\"navbar navbar-default\" role=\"navigation\">\n" +
    "    <div class=\"container\">\n" +
    "      <a href=\"https://github.com/SteffanLong/DestinyTrialsReport\" target=\"_blank\" class=\"hidden-xs hidden-sm\"><img style=\"position:absolute; top:0; right:0; border:0\" src=\"https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png\"></a>\n" +
    "      <div class=\"row\">\n" +
    "        <div class=\"col-md-8 col-md-offset-2 col-xs-12 mt-20 mb-20\">\n" +
    "          <form class=\"form-horizontal\" role=\"form\" ng-submit=\"searchPlayerbyName(mainPlayer, platformValue, 0)\">\n" +
    "            <div class=\"onoffswitch labeled\">\n" +
    "              <input type=\"checkbox\" name=\"onoffswitch\" class=\"onoffswitch-checkbox\" id=\"platformSwitch\" ng-model=\"platformValue\">\n" +
    "              <label class=\"onoffswitch-label\" for=\"platformSwitch\">\n" +
    "                <span class=\"onoffswitch-inner\"></span>\n" +
    "                <span class=\"onoffswitch-switch\"></span>\n" +
    "              </label>\n" +
    "            </div>\n" +
    "            <div class=\"input-group\">\n" +
    "              <input type=\"text\" class=\"form-control\" placeholder=\"Enter a Guardian's name\" ng-model=\"mainPlayer\">\n" +
    "              <span class=\"input-group-btn\">\n" +
    "                <button class=\"btn btn-default\" type=\"submit\">Search</button>\n" +
    "              </span>\n" +
    "            </div>\n" +
    "          </form>\n" +
    "        </div>\n" +
    "        <!--<div class=\"col-md-1 hidden-xs mt-20 mb-20 pl-0\">-->\n" +
    "          <!--<a ng-if=\"fireteam[0].name && fireteam[0].membershipType\" class=\"btn btn-icon-only\">-->\n" +
    "            <!--<i class=\"fa fa-link\" ui-zeroclip zeroclip-copied=\"copiedMessage()\"-->\n" +
    "               <!--zeroclip-text=\"http://www.DestinyTrialsReport.com/{{platformValue ? 'ps' : 'xbox'}}/{{fireteam[0].name}}\"></i>-->\n" +
    "          <!--</a>-->\n" +
    "        <!--</div>-->\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"container\" ng-show=\"status\">\n" +
    "  <div class=\"text-center alert alert-warning\">\n" +
    "    <strong>{{status}}</strong>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);
