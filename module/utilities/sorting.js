function sortResult(a,b)
{
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

// Sort items alphabetically
export function byNameAscending(itemA, itemB) {
  return sortResult(itemA.name.toLowerCase(), itemB.name.toLowerCase());
}

const skillMap = {
  Specialized: 1,
  Trained: 2,
  Practiced: 3,
  Inability: 4
}

// sort skills by skill rating
export function bySkillRating(itemA, itemB) {
  return sortResult(skillMap[itemA.system.basic.rating]||5, skillMap[itemB.system.basic.rating]||5);
}

// Sort items by level
export function byItemLevel(itemA, itemB) {
  return sortResult(itemA.system.basic.level, itemB.system.basic.level);
}

// Sort items by archive status
export function byArchiveStatus(itemA, itemB) {
  return sortResult(!!itemA.system.archived, !!itemB.system.archived);
}

// Sort items by indentified status
export function byIdentifiedStatus(itemA, itemB) {
  return sortResult(!itemA.system.basic.identified, !itemB.system.basic.identified);
}

// Sort item by favorite
export function byFavoriteStatus(itemA, itemB) {
  return sortResult(!itemA.system.favorite, !itemB.system.favorite);
}