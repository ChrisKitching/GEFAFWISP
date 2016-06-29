// A lookup table of names for the builtin maps.
let BUILTIN_NAMES:Map<string, string> = new Map<string, string>([
  ["scmp_001", "Burial Mounds"],
  ["scmp_002", "Concord Lake"],
  ["scmp_003", "Drake's Ravine"],
  ["scmp_004", "Emerald Crater"],
  ["scmp_005", "Gentleman's Reef"],
  ["scmp_006", "Ian's Cross"],
  ["scmp_007", "Open Palms"],
  ["scmp_008", "Seraphim Glaciers"],
  ["scmp_009", "Seton's Clutch"],
  ["scmp_010", "Sung Island"],
  ["scmp_011", "The Great Void"],
  ["scmp_012", "Theta Passage"],
  ["scmp_013", "Winter Duel"],
  ["scmp_014", "The Bermuda Locket"],
  ["scmp_015", "Fields Of Isis"],
  ["scmp_016", "Canis River"],
  ["scmp_017", "Syrtis Major"],
  ["scmp_018", "Sentry Point"],
  ["scmp_019", "Finn's Revenge"],
  ["scmp_020", "Roanoke Abyss"],
  ["scmp_021", "Alpha 7 Quarantine"],
  ["scmp_022", "Artic Refuge"],
  ["scmp_023", "Varga Pass"],
  ["scmp_024", "Crossfire Canal"],
  ["scmp_025", "Saltrock Colony"],
  ["scmp_026", "Vya-3 Protectorate"],
  ["scmp_027", "The Scar"],
  ["scmp_028", "Hanna oasis"],
  ["scmp_029", "Betrayal Ocean"],
  ["scmp_030", "Frostmill Ruins"],
  ["scmp_031", "Four-Leaf Clover"],
  ["scmp_032", "The Wilderness"],
  ["scmp_033", "White Fire"],
  ["scmp_034", "High Noon"],
  ["scmp_035", "Paradise"],
  ["scmp_036", "Blasted Rock"],
  ["scmp_037", "Sludge"],
  ["scmp_038", "Ambush Pass"],
  ["scmp_039", "Four-Corners"],
  ["scmp_040", "The Ditch"],
  ["x1mp_001", "Crag Dunes"],
  ["x1mp_002", "Williamson's Bridge"],
  ["x1mp_003", "Snoey Triangle"],
  ["x1mp_004", "Haven Reef"],
  ["x1mp_005", "The Dark Heart"],
  ["x1mp_006", "Daroza's Sanctuary"],
  ["x1mp_007", "Strip Mine"],
  ["x1mp_008", "Thawing Glacier"],
  ["x1mp_009", "Liberiam Battles"],
  ["x1mp_010", "Shards"],
  ["x1mp_011", "Shuriken Island"],
  ["x1mp_012", "Debris"],
  ["x1mp_014", "Flooded Strip Mine"],
  ["x1mp_017", "Eye Of The Storm"]
]);

export function getPrettyMapName(name:string) {
    if (BUILTIN_NAMES.has(name)) {
        return BUILTIN_NAMES.get(name);
    }

    // TODO #9: We need a proper pretty name field in the API. Isn't this in map metadata?!
    // Cut of ZePatcher version number stupidity, and string-parse the zipname into something that
    // can laughably be described as a pretty name.
    let pretty = name.slice(0, name.indexOf(".v0"));
    return pretty.replace("_", " ");
}
