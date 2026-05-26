/**
 * Determine the scope label for a shared issue based on how much location
 * detail has been provided.
 *
 *  flat  provided → Flat-specific  (only residents of that flat)
 *  floor provided → Floor-level    (all flats on that floor of the block)
 *  block provided → Block communal (entire block — stairwells, corridors etc.)
 *  else           → Building-wide
 */
export function getIssueScope(location = {}) {
  const { building, block, floor, flat } = location;

  if (flat && flat !== "")
    return {
      key:   "flat",
      label: "Flat-specific",
      desc:  [flat, block && `Block ${block}`, building].filter(Boolean).join(" · "),
    };

  if (floor && floor !== "")
    return {
      key:   "floor",
      label: "Floor-level",
      desc:  [floor, block && `Block ${block}`, building].filter(Boolean).join(" · "),
    };

  if (block && block !== "")
    return {
      key:   "block",
      label: "Block communal area",
      desc:  [`Block ${block}`, building].filter(Boolean).join(" · "),
    };

  if (building && building !== "")
    return {
      key:   "building",
      label: "Building-wide",
      desc:  building,
    };

  return { key: "site", label: "Site-wide", desc: "All residents on site" };
}

/**
 * Return the subset of `allUsers` who are affected by a shared issue at
 * the given location, excluding the primary requester.
 *
 * Scoping rules (narrowest wins):
 *   flat  → exact flat match within building + block
 *   floor → floor match within building + block
 *   block → all users in that block of that building
 *   else  → all users in that building
 */
export function computeAffectedUsers(location = {}, allUsers = [], excludeEmail = null) {
  const { building, block, floor, flat } = location;

  if (!building) return [];

  return allUsers.filter((u) => {
    // Must have residential data
    if (!u.building) return false;
    // Skip agents
    if (u.isAgent) return false;
    // Skip the primary requester
    if (excludeEmail && u.email === excludeEmail) return false;
    // Must be in the same building
    if (u.building !== building) return false;
    // Must be in the same block (if block is specified)
    if (block && u.block !== block) return false;

    // Narrow by flat first, then floor, then block-wide
    if (flat && flat !== "") return u.flat === flat;
    if (floor && floor !== "") return u.floor === floor;
    return true; // block-wide (or building-wide if no block)
  });
}
