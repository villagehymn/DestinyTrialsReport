// Destiny Inventory Bucket Definition

var BUCKET_HEAD = 3448274439;
var BUCKET_CHEST = 14239492;
var BUCKET_ARMS = 3551918588;
var BUCKET_LEGS = 20886954;

var BUCKET_PRIMARY_WEAPON = 1498876634;
var BUCKET_SPECIAL_WEAPON = 2465295065;
var BUCKET_HEAVY_WEAPON = 953998645;

// Destiny Stat Definition

var STAT_INTELLECT = 144602215;
var STAT_DISCIPLINE = 1735777505;
var STAT_STRENGTH = 4244567218;
var STAT_LIGHT = 2391494160;

var STAT_BASE_DAMAGE = 4043523819;


var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];

// Weapon perks to avoid

var avoidNodes = [
  'Ascend', 'Reforge Ready', 'Void Damage', 'Arc Damage', 'Solar Damage', 'Kinetic Damage', 'Hive Disruptor', 'Oracle Disruptor',
  'Lich Bane', 'Disciplinarian', 'Demotion', 'Mutineer', 'Dreg Burn', 'Shank Burn', 'Vandal Burn', 'Aspect Swap', 'Burgeoning Hunger',
  'Cannibalism', 'Dark Breaker', 'Upgrade Damage', 'Ice Breaker'
];

// Armor perks for hazards

var hazardQuickRevive = [
  40760096, // Light Beyond Nemesis (Warlock)
  2682002320, // Crest of Alpha Lupi (Titan)2272644374
  2272644374,
  3821972036 // Crest of Alpha Lupi (Hunter)
];
var hazardGrenadeOnSpawn = [
  2289894117, // Lucky Raspberry (Hunter)
  2671461052 // Voidfang Vestments (Warlock)
];
var hazardDoubleGrenade = [
  2978872641 // The Armamentarium (Titan)
];

var className = [
  'Titan',
  'Warlock',
  'Hunter'
];

// Subclass Definitions

var SUNSINGER_CLASS = 3658182170;
var VOIDWALKER_CLASS = 3828867689;
var BLADEDANCER_CLASS = 2962927168;

// Class nodes definitions

var FIREBOLT_GRENADE = 835330335;
var FUSION_GRENADE = 834786008;
var VIKING_FUNERAL = 1173110174;
var TOUCH_OF_FLAME = 527202181;
