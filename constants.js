// Constants //

const ddrag_ver = "9.14.1";
const ddrag_url = "https://ddragon.leagueoflegends.com/cdn/" + ddrag_ver + "/img/champion/";

const fade_duration = 300;                  // Fade in/out duration in milliseconds
const cached_lifespan = 3 * 60 * 1000;      // Cached request lifespan in milliseconds

const session_id = generateUuid();

const region_strs = [
  'EUW',
  'EUNE',
  'NA',
  'KR',
  'OCE',
  'BR',
  'RU',
  'LAN',
  'LAS',
  'JP',
  'TR',
  // 'SG', // singapore
  // 'ID', // indonesia
  // 'PH', // the phillipines
  // 'TW', // taiwan
  // 'VN', // vietnam
  // 'TH', // thailand
];

const date_form = { 'weekday': 'long', 'year': 'numeric', 'month': 'long', 'day': 'numeric' };
const time_form = { 'hour': 'numeric', 'minute': '2-digit', 'hour12': true };

const team_li = 0; // Indexes of each feature in req_data
const role_li = 1;
const cid_li = 2;
const name_li = 3;

const ch_cid_li = 0; // Indexes of each feature in champ_list
const ch_id_li = 1;
const ch_name_li = 2;

const timezone_offsets = [
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
];
const timezone_default = 5;
const curr_offset = (new Date()).getTimezoneOffset() / 60;


// Globals

var request_cache = {};



var images = [];
function preload() {
  for (var i = 0; i < arguments.length; i++) {
    images[i] = new Image();
    images[i].src = preload.arguments[i];
  }
}

preload(
  "img/bell_on_white.png",
  "img/bell_off_white.png",
  "img/vol_on_white.png",
  "img/vol_off_white.png"
)

