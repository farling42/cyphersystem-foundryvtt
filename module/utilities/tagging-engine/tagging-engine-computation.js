export async function archiveItems(actor, taggingData) {
  const updates = [];
  let active = (taggingData.item.type === "recursion" && taggingData.item.system.active) ? taggingData.item.system.active : !taggingData.item.system.active;

  if (game.keyboard.isModifierActive("Alt")) {
    if (taggingData.item.type === "tag")
      active = !active;
    else if (taggingData.item.type === "recursion")
      return;
  }

  await taggingData.item.update({ "system.active": active });
  if (taggingData.disableItem) {
    await taggingData.disableItem.update({ "system.active": !active });
  }

  const activeTags = [];

  actor.items.filter(item => (item.type === "tag" || item.type === "recursion") && item.system.active)
    .forEach(item => activeTags.push(item._id));

  // Skip tag & recursion items
  for (const item of actor.items.filter(item => (item.type !== "tag" && item.type !== "recursion" && !item.system.isTeen))) {
    // Create tag & recursion arrays
    let tagArray = (Array.isArray(item.flags?.cyphersystem?.tags)) ? item.flags.cyphersystem.tags : [];
    let recursionArray = (Array.isArray(item.flags?.cyphersystem?.recursions)) ? item.flags.cyphersystem.recursions : [];
    let tagsAndRecursionArray = tagArray.concat(recursionArray);

    // Don’t do anything if no tags are set
    if (tagsAndRecursionArray.length == 0) continue;

    let tagFound = activeTags.some(r => tagsAndRecursionArray.includes(r));
    updates.push({ _id: item.id, "system.archived": !tagFound });
  }

  return updates;
}

export async function applyRecursion(actor, item) {
  // If the character is an unlinked token
  if (!actor?.actorLink) {
    actor = actor.actor;
  }

  // If the actor is in a compendium
  if (actor?.pack) {
    actor = await game.packs.get(actor.pack).getDocument(actor._id);
  }

  let focus = game.keyboard.isModifierActive("Alt") ? actor.system.basic.focus : item.system.basic.focus;

  await actor.update({
    "system.basic.focus": focus,
    "system.basic.additionalSentence": game.i18n.localize("CYPHERSYSTEM.OnRecursion") + " " + item.name,
    "system.settings.general.additionalSentence.active": true
  });

  // Notify about translation
  ui.notifications.info(game.i18n.format("CYPHERSYSTEM.PCTranslatedToRecursion", { actor: actor.name, recursion: item.name }));
}

export async function changeTagStats(actor, statChanges) {
  // If the character is an unlinked token
  if (actor?.actorLink) actor = actor.actor;

  // If the actor is in a compendium
  if (actor?.pack) actor = await game.packs.get(actor.pack).getDocument(actor._id);

  let pool = actor._source.system.pools;
  let multiplier = (statChanges.itemActive) ? -1 : 1;

  await actor.update({
    "system.pools.might.value": pool.might.value + (statChanges.mightModifier * multiplier),
    "system.pools.might.max": pool.might.max + (statChanges.mightModifier * multiplier),
    "system.pools.speed.value": pool.speed.value + (statChanges.speedModifier * multiplier),
    "system.pools.speed.max": pool.speed.max + (statChanges.speedModifier * multiplier),
    "system.pools.intellect.value": pool.intellect.value + (statChanges.intellectModifier * multiplier),
    "system.pools.intellect.max": pool.intellect.max + (statChanges.intellectModifier * multiplier),
    "system.pools.might.edge": pool.might.edge + (statChanges.mightEdgeModifier * multiplier),
    "system.pools.speed.edge": pool.speed.edge + (statChanges.speedEdgeModifier * multiplier),
    "system.pools.intellect.edge": pool.intellect.edge + (statChanges.intellectEdgeModifier * multiplier),
  });
}

export async function removeTagFromItem(actor, tagID) {
  for (const item of actor.items) {
    let tagArray = (Array.isArray(item.flags?.cyphersystem?.tags)) ? item.flags.cyphersystem.tags : [];
    let recursionArray = (Array.isArray(item.flags?.cyphersystem?.recursions)) ? item.flags.cyphersystem.recursions : [];

    if (tagArray.includes(tagID)) {
      let index = tagArray.indexOf(tagID);
      tagArray.splice(index, 1);
    }

    if (recursionArray.includes(tagID)) {
      let index = recursionArray.indexOf(tagID);
      recursionArray.splice(index, 1);
    }

    await item.update({
      "flags.cyphersystem.tags": tagArray,
      "flags.cyphersystem.recursions": recursionArray
    });
  }
}