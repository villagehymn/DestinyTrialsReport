// Destiny Inventory Bucket Definition

var BUCKET_HEAD = 3448274439;
var BUCKET_CHEST = 14239492;
var BUCKET_ARMS = 3551918588;
var BUCKET_LEGS = 20886954;
var BUCKET_ARTIFACT = 434908299;
var BUCKET_GHOST = 4023194814;
var BUCKET_CLASS_ITEM = 1585787867;

var BUCKET_PRIMARY_WEAPON = 1498876634;
var BUCKET_SPECIAL_WEAPON = 2465295065;
var BUCKET_HEAVY_WEAPON = 953998645;

var BUCKET_BUILD = 3284755031;

// Destiny Stat Definition

var STAT_INTELLECT = 144602215;
var STAT_DISCIPLINE = 1735777505;
var STAT_STRENGTH = 4244567218;
var STAT_LIGHT = 2391494160;

var statNames = {
  STAT_INTELLECT: 'Intellect',
  STAT_DISCIPLINE: 'Discipline',
  STAT_STRENGTH: 'Strength'
};

var STAT_BASE_DAMAGE = 4043523819;


var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];


// Grenade defs

var FIREBOLT_GRENADE = 2927723086;
var FUSION_GRENADE = 2995804739;
var VOIDWALL_GRENADE = 2576774201;
var STORM_GRENADE = 3347197644;
var VORTEX_GRENADE = 2008044721;
var ARCBOLT_GRENADE = 3078181438;
var SCATTER_GRENADE = 3252353493;
var SOLAR_GRENADE = 1397213608;
var TRIPMINE_GRENADE = 455260043;
var AXION_GRENADE = 243660113;
var SKIP_GRENADE = 328872098;

// Subclass Definitions

var SUNSINGER_CLASS = 3658182170;
var VOIDWALKER_CLASS = 3828867689;
var BLADEDANCER_CLASS = 2962927168;
var SUNBREAKER_CLASS = 21395672; //or 21395673
var NIGHTSTALKER_CLASS = 151296639; //or 151296640
var STORMCALLER_CLASS = 1256644900; //or 1256644901
var GUNSLINGER_CLASS = 1716862031;
var STRIKER_CLASS = 2455559914;
var DEFENDER_CLASS = 2007186000;

// Armor perks for hazards

var hazardQuickRevive = [
  40760096, // Light Beyond Nemesis (Warlock)
  2682002320, // Crest of Alpha Lupi (Titan)
  3821972036, // Crest of Alpha Lupi (Hunter)
  1190369844,
  1509404812,
  1760211262
];
var hazardGrenadeOnSpawn = [
  2289894117, // Lucky Raspberry (Hunter)
  2671461052, // Voidfang Vestments (Warlock)
  2819174431
];

var hazardDoubleGrenade = [
  2978872641 // The Armamentarium (Titan)
];

var hazardDoubleMelee = [
  405554470,
  1318675793,
  2340078883,
  2783259970,
  3406171126
];

hazardMiscArmorPerks = {
  40760096: 'Faster Revive',
  2682002320: 'Faster Revive',
  3821972036: 'Faster Revive',
  1190369844: 'Faster Revive',
  1509404812: 'Faster Revive',
  1760211262: 'Faster Revive',
  2978872641: 'Double Grenade',
  2289894117: 'Grenade on Spawn',
  2671461052: 'Grenade on Spawn',
  2819174431: 'Grenade on Spawn',
  405554470: 'Double Melee',
  1318675793: 'Double Melee',
  2340078883: 'Double Melee',
  2783259970: 'Double Melee',
  3406171126: 'Double Melee'
};

hazardMiscWeaponPerks = {
  77746637:   'Kills Grant Tracking',
  431159510:  'Third Eye',
  770631416:  'Third Eye',
  1485291076: 'Final Round (Burst)',
  1568304667: 'Luck in Chamber',
  2758635242: 'Increased Radar Resolution',
  3464328064: '+Damage when Surrounded',
  3505787429: 'Highlights Enemies',
  3752206822: 'Final Round',
  3921735041: 'Final Round',
  315800403:  'Precision Hits Return Ammo',
  661681055:  'Body Hits Increase Precision DMG',
  1026458383: 'Wounded Kills Regen HP',
  1279198574: '+RoF if Super Charged',
  1843659180: 'Increased Precision Damage',
  4271995221: 'Increased Precision Damage',
  2047535886: '+Melee Damage After Shooting',
  2417835318: 'Regen Health After Kill',
  2566491829: 'Bonus Precision Damage',
  //3523239750: 'Faster Reload when Last Standing',
  3911170550: 'Firefly',
  3031234337: '+Stats when Behind Cover',
  3695773985: 'Camouflage while aiming',
  3369212512: 'Precision Kills Blind (Chance)'
};

var hazardDoubleGrenadeByPerk = {
  280851997: SCATTER_GRENADE,
  4109126941: SCATTER_GRENADE,
  469911339: FUSION_GRENADE,
  3471016318: FUSION_GRENADE,
  3544054727: SOLAR_GRENADE,
  1170991030: TRIPMINE_GRENADE,
  1351885744: AXION_GRENADE,
  1617397024: SKIP_GRENADE
};

var hazardBurnDefense = {
  1723656171: 'Solar',
  2095340230: 'Void',
  539512168: 'Arc'
};

var hazardIncreasedArmor = {
  3944665868: [BLADEDANCER_CLASS, STORMCALLER_CLASS, STRIKER_CLASS],
  671224739:  [SUNSINGER_CLASS, SUNBREAKER_CLASS, GUNSLINGER_CLASS],
  1028572792: [VOIDWALKER_CLASS, NIGHTSTALKER_CLASS, DEFENDER_CLASS]
};

var RELOAD_PRIMARY = 1844502900;
var RELOAD_SPECIAL = 765056859;
var RELOAD_HEAVY = 1094584227;

var RELOAD_SCOUT = 2129333927;
var RELOAD_PULSE = 177663318;
var RELOAD_AUTO = 3187783240;
var RELOAD_HAND_CANNON = 3241361759;

var RELOAD_SHOTGUN = 4090945472;
var RELOAD_SNIPER = 4111868508;
var RELOAD_FUSION = 1359068529;

var RELOAD_MACHINE = 836377941;
var RELOAD_LAUNCHER = 1938590973;

var itemPerkToBucket = {
  1844502900: 'primary',
  765056859: 'special',
  1094584227: 'heavy'
};

var reloadPerksToItemType = {
  2129333927:   14,
  1394084296:   14,
  177663318:    13,
  2482846307:   13,
  3187783240:   6,
  3031176193:   6,
  1175838572:   9,
  3241361759:   9,
  4090945472:   7,
  4111868508:   12,
  1359068529:   11,
  3689182788:   17,
  836377941:    8,
  1938590973:   10
};

var itemTypeToBucket = {
  6: 'primary',
  9: 'primary',
  13: 'primary',
  14: 'primary',
  7: 'special',
  11: 'special',
  12: 'special',
  17: 'special',
  8: 'heavy',
  10: 'heavy'
};

var className = [
  'Titan',
  'Warlock',
  'Hunter'
];

// Match summary weapon kill definitions

var weaponKills = {
  weaponKillsHandCannon: 'Hand Cannon',
  weaponKillsPulseRifle: 'Pulse Rifle',
  weaponKillsScoutRifle: 'Scout Rifle',
  weaponKillsAutoRifle: 'Auto Rifle',
  weaponKillsSniper: 'Sniper Rifle',
  weaponKillsShotgun: 'Shotgun',
  weaponKillsFusionRifle: 'Fusion Rifle',
  weaponKillsRocketLauncher: 'Launcher',
  weaponKillsMachinegun: 'Machine Gun',
  weaponKillsSideArm: 'Sidearm',
  weaponKillsSword: 'Sword'
};

// Class nodes definitions
var VIKING_FUNERAL = 2443566286;
var TOUCH_OF_FLAME = 2233737290;

// Cooldowns

var cooldownsSuperA  = ['5:00', '4:46', '4:31', '4:15', '3:58', '3:40'];
var cooldownsSuperB  = ['5:30', '5:14', '4:57', '4:39', '4:20', '4:00'];
var cooldownsGrenade = ['1:00', '0:55', '0:49', '0:42', '0:34', '0:25'];
var cooldownsMelee   = ['1:00', '0:55', '0:49', '0:42', '0:34', '0:25'];
