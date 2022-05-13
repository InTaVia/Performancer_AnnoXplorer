/* export const typeArray = ["PER", "LOC", "ORG", "EVT", "WRK", "WVL", "CNC"]; //the succession of the annotation types

export const typeColors = {
  PER: "228, 26, 28",
  LOC: "55, 126, 184",
  ORG: "77, 175, 74",
  EVT: "255, 127, 0",
  WRK: "166, 86, 40",
  WVL: "247, 129, 191",
  CNC: "152, 78, 163",
  default: "black",
}; */

//JENA: HARDCODED FOR ODENSE
export const typeArray = ["PER", "LOC", "ORG", "MISC"]; //the succession of the annotation types

//JENA: HARDCODED FOR ODENSE
// export const typeColors = {
//   PER: "228, 26, 28",
//   LOC: "55, 126, 184",
//   ORG: "77, 175, 74",
//   MISC: "255, 127, 0",
//   default: "black",
// };

//MB: HARDCODED FOR ODENSE
export const typeColors = {
  PER: "215, 25, 28",
  LOC: "253, 174, 97",
  ORG: "171, 221, 164",
  MISC: "43, 131, 186",
  default: "black",
};



export const stopWords = [
  //source: http://members.unine.ch/jacques.savoy/clef/germanST.txt
  "a",
  "ab",
  "aber",
  "aber",
  "ach",
  "acht",
  "achte",
  "achten",
  "achter",
  "achtes",
  "ag",
  "alle",
  "allein",
  "allem",
  "allen",
  "aller",
  "allerdings",
  "alles",
  "allgemeinen",
  "als",
  "also",
  "am",
  "an",
  "andere",
  "anderen",
  "andern",
  "anders",
  "au",
  "auch",
  "auch",
  "auf",
  "aus",
  "ausser",
  "außer",
  "ausserdem",
  "außerdem",
  "b",
  "bald",
  "bei",
  "beide",
  "beiden",
  "beim",
  "beispiel",
  "bekannt",
  "bereits",
  "besonders",
  "besser",
  "besten",
  "bin",
  "bis",
  "bisher",
  "bist",
  "c",
  "d",
  "da",
  "dabei",
  "dadurch",
  "dafür",
  "dagegen",
  "daher",
  "dahin",
  "dahinter",
  "damals",
  "damit",
  "danach",
  "daneben",
  "dank",
  "dann",
  "daran",
  "darauf",
  "daraus",
  "darf",
  "darfst",
  "darin",
  "darüber",
  "darum",
  "darunter",
  "das",
  "dasein",
  "daselbst",
  "dass",
  "daß",
  "dasselbe",
  "davon",
  "davor",
  "dazu",
  "dazwischen",
  "dein",
  "deine",
  "deinem",
  "deiner",
  "dem",
  "dementsprechend",
  "demgegenüber",
  "demgemäss",
  "demgemäß",
  "demselben",
  "demzufolge",
  "den",
  "denen",
  "denn",
  "denn",
  "denselben",
  "der",
  "deren",
  "derjenige",
  "derjenigen",
  "dermassen",
  "dermaßen",
  "derselbe",
  "derselben",
  "des",
  "deshalb",
  "desselben",
  "dessen",
  "deswegen",
  "d.h.",
  "dich",
  "die",
  "diejenige",
  "diejenigen",
  "dies",
  "diese",
  "dieselbe",
  "dieselben",
  "diesem",
  "diesen",
  "dieser",
  "dieses",
  "dir",
  "doch",
  "dort",
  "drei",
  "drin",
  "dritte",
  "dritten",
  "dritter",
  "drittes",
  "du",
  "durch",
  "durchaus",
  "dürfen",
  "dürft",
  "durfte",
  "durften",
  "e",
  "eben",
  "ebenso",
  "ehrlich",
  "ei",
  "eigen",
  "eigene",
  "eigenen",
  "eigener",
  "eigenes",
  "ein",
  "einander",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "einige",
  "einigen",
  "einiger",
  "einiges",
  "einmal",
  "eins",
  "elf",
  "en",
  "ende",
  "endlich",
  "entweder",
  "er",
  "Ernst",
  "erst",
  "erste",
  "ersten",
  "erster",
  "erstes",
  "es",
  "etwa",
  "etwas",
  "euch",
  "f",
  "früher",
  "fünf",
  "fünfte",
  "fünften",
  "fünfter",
  "fünftes",
  "für",
  "g",
  "gab",
  "ganz",
  "ganze",
  "ganzen",
  "ganzer",
  "ganzes",
  "gar",
  "gedurft",
  "gegen",
  "gegenüber",
  "gehabt",
  "gehen",
  "geht",
  "gekannt",
  "gekonnt",
  "gemacht",
  "gemocht",
  "gemusst",
  "genug",
  "gerade",
  "gern",
  "gesagt",
  "geschweige",
  "gewesen",
  "gewollt",
  "geworden",
  "gibt",
  "ging",
  "gleich",
  "gott",
  "gross",
  "groß",
  "grosse",
  "große",
  "grossen",
  "großen",
  "grosser",
  "großer",
  "grosses",
  "großes",
  "gut",
  "gute",
  "guter",
  "gutes",
  "h",
  "habe",
  "haben",
  "habt",
  "hast",
  "hat",
  "hatte",
  "hätte",
  "hatten",
  "hätten",
  "heisst",
  "her",
  "heute",
  "hier",
  "hin",
  "hinter",
  "hoch",
  "i",
  "ich",
  "ihm",
  "ihn",
  "ihnen",
  "ihr",
  "ihre",
  "ihrem",
  "ihren",
  "ihrer",
  "ihres",
  "im",
  "immer",
  "in",
  "indem",
  "infolgedessen",
  "ins",
  "irgend",
  "ist",
  "j",
  "ja",
  "ja",
  "jahr",
  "jahre",
  "jahren",
  "je",
  "jede",
  "jedem",
  "jeden",
  "jeder",
  "jedermann",
  "jedermanns",
  "jedoch",
  "jemand",
  "jemandem",
  "jemanden",
  "jene",
  "jenem",
  "jenen",
  "jener",
  "jenes",
  "jetzt",
  "k",
  "kam",
  "kann",
  "kannst",
  "kaum",
  "kein",
  "keine",
  "keinem",
  "keinen",
  "keiner",
  "kleine",
  "kleinen",
  "kleiner",
  "kleines",
  "kommen",
  "kommt",
  "können",
  "könnt",
  "konnte",
  "könnte",
  "konnten",
  "kurz",
  "l",
  "lang",
  "lange",
  "lange",
  "leicht",
  "leide",
  "lieber",
  "los",
  "m",
  "machen",
  "macht",
  "machte",
  "mag",
  "magst",
  "mahn",
  "man",
  "manche",
  "manchem",
  "manchen",
  "mancher",
  "manches",
  "mann",
  "mehr",
  "mein",
  "meine",
  "meinem",
  "meinen",
  "meiner",
  "meines",
  "mensch",
  "menschen",
  "mich",
  "mir",
  "mit",
  "mittel",
  "mochte",
  "möchte",
  "mochten",
  "mögen",
  "möglich",
  "mögt",
  "morgen",
  "muss",
  "muß",
  "müssen",
  "musst",
  "müsst",
  "musste",
  "mussten",
  "n",
  "na",
  "nach",
  "nachdem",
  "nahm",
  "natürlich",
  "neben",
  "nein",
  "neue",
  "neuen",
  "neun",
  "neunte",
  "neunten",
  "neunter",
  "neuntes",
  "nicht",
  "nichts",
  "nie",
  "niemand",
  "niemandem",
  "niemanden",
  "noch",
  "nun",
  "nur",
  "o",
  "ob",
  "oben",
  "oder",
  "offen",
  "oft",
  "ohne",
  "Ordnung",
  "p",
  "q",
  "r",
  "recht",
  "rechte",
  "rechten",
  "rechter",
  "rechtes",
  "richtig",
  "rund",
  "s",
  "sa",
  "sache",
  "sagt",
  "sagte",
  "sah",
  "satt",
  "schlecht",
  "Schluss",
  "schon",
  "sechs",
  "sechste",
  "sechsten",
  "sechster",
  "sechstes",
  "sehr",
  "sei",
  "seid",
  "seien",
  "sein",
  "seine",
  "seinem",
  "seinen",
  "seiner",
  "seines",
  "seit",
  "seitdem",
  "selbst",
  "selbst",
  "sich",
  "sie",
  "sieben",
  "siebente",
  "siebenten",
  "siebenter",
  "siebentes",
  "sind",
  "so",
  "solang",
  "solche",
  "solchem",
  "solchen",
  "solcher",
  "solches",
  "soll",
  "sollen",
  "sollte",
  "sollten",
  "sondern",
  "sonst",
  "sowie",
  "später",
  "statt",
  "t",
  "tag",
  "tage",
  "tagen",
  "tat",
  "teil",
  "tel",
  "tritt",
  "trotzdem",
  "tun",
  "u",
  "über",
  "überhaupt",
  "übrigens",
  "uhr",
  "um",
  "und",
  "und?",
  "uns",
  "unser",
  "unsere",
  "unserer",
  "unter",
  "v",
  "vergangenen",
  "viel",
  "viele",
  "vielem",
  "vielen",
  "vielleicht",
  "vier",
  "vierte",
  "vierten",
  "vierter",
  "viertes",
  "vom",
  "von",
  "vor",
  "w",
  "wahr?",
  "während",
  "währenddem",
  "währenddessen",
  "wann",
  "war",
  "wäre",
  "waren",
  "wart",
  "warum",
  "was",
  "wegen",
  "weil",
  "weit",
  "weiter",
  "weitere",
  "weiteren",
  "weiteres",
  "welche",
  "welchem",
  "welchen",
  "welcher",
  "welches",
  "wem",
  "wen",
  "wenig",
  "wenig",
  "wenige",
  "weniger",
  "weniges",
  "wenigstens",
  "wenn",
  "wer",
  "werde",
  "werden",
  "werdet",
  "wessen",
  "wie",
  "wieder",
  "will",
  "willst",
  "wir",
  "wird",
  "wirklich",
  "wirst",
  "wo",
  "wohl",
  "wollen",
  "wollt",
  "wollte",
  "wollten",
  "worden",
  "wurde",
  "würde",
  "wurden",
  "würden",
  "x",
  "y",
  "z",
  "z.b",
  "zehn",
  "zehnte",
  "zehnten",
  "zehnter",
  "zehntes",
  "zeit",
  "zu",
  "zuerst",
  "zugleich",
  "zum",
  "zunächst",
  "zur",
  "zurück",
  "zusammen",
  "zwanzig",
  "zwar",
  "zwei",
  "zweite",
  "zweiten",
  "zweiter",
  "zweites",
  "zwischen",
  "zwölf",
];

export const language = "de"; //(main) language of the text

export const key = function (d) {
  //identification of the tokens/bins
  return d.id;
};