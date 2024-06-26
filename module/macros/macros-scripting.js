export function useAmmo(ammoUuid, quantity, rollData) {
  if (rollData.reroll) return;

  // Get actor
  const actor = fromUuidSync(rollData.actorUuid);

  // Get macro
  const macro = fromUuidSync(rollData.macroUuid);

  // Get ammo
  const ammo = fromUuidSync(ammoUuid);
  if (ammo.type !== "ammo") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NotAmmo"));

  // Calculate new quantity
  const ammoQuantity = ammo.system.basic.quantity - quantity;

  // Update ammo
  if ((ammoQuantity) >= 0) {
    ammo.update({"system.basic.quantity": ammoQuantity});
  }

  // Notify about low ammo
  if (ammoQuantity < quantity) {
    ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NoAmmo"));
  }

  // Send chat message
  const info = `<div class="roll-result-box">` + game.i18n.format("CYPHERSYSTEM.AmmoLeft", {name: ammo.name, quantity: ammoQuantity}) + `</div>`;
  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><strong>" + macro.name + "</strong></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });

}

export async function payCostWithAdditionalPool(cost, useEdge, rollData) {
  // Check for right pool
  if (rollData.pool !== "Pool") return;

  // Get actor
  const actor = await fromUuid(rollData.actorUuid);

  // Get macro
  const macro = await fromUuid(rollData.macroUuid);

  // Get fourth pool
  if (!actor.system.settings.general.additionalPool.active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.FourthPoolNotActive"));
  if (!actor.system.settings.general.additionalPool.hasEdge) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.FourthPoolNoEdge"));
  const fourthPool = actor.system.pools.additional;
  const fourthPoolLabel = actor.system.settings.general.additionalPool.label || "Luck";

  // Calculate cost
  const edge = useEdge ? fourthPool.edge : 0;
  const baseCost = cost ?? rollData.poolPointCost;
  const totalCost = Math.max(0, baseCost - edge);
  const newValue = fourthPool.value - totalCost;

  // Subtract from actor
  if (newValue < 0) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {pool: fourthPoolLabel}));
  await actor.update({"system.pools.additional.value": newValue});

  // Send chat message
  const costTotalInfoString = (totalCost === 1) ?
    game.i18n.format("CYPHERSYSTEM.CostTotalFourthPoolPoint", {totalCost: totalCost, label: fourthPoolLabel}) :
    game.i18n.format("CYPHERSYSTEM.CostTotalFourthPoolPoints", {totalCost: totalCost, label: fourthPoolLabel});

  const baseCostInfoString = (cost === 1) ?
    game.i18n.format("CYPHERSYSTEM.FourthPoolBaseCostPoint", {baseCost: baseCost}) :
    game.i18n.format("CYPHERSYSTEM.FourthPoolBaseCostPoints", {baseCost: baseCost});

    const edgeString = (useEdge) ?
    "<br>" + game.i18n.localize("CYPHERSYSTEM.Edge") + ": " + fourthPool.edge :
    "";

  const costDetailsInfo = `<div class="roll-result-cost-details" style="display: none">` + baseCostInfoString + edgeString + `</div>`;

  const info = `<div class="roll-result-box"><strong><a class="roll-result-cost">` + costTotalInfoString + `</a></strong>` + costDetailsInfo + `</div>`;

  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><strong>" + macro.name + "</strong></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });
}

export async function executeSeriesOfMacros(macroUuids, rollData) {
  for (const macroUuid of macroUuids) {
    const macro = await fromUuid(macroUuid);
    if (!macro) return;
    await macro.execute({"rollData": rollData});
  }
}

export async function payXP(quantity, rollData) {
  // Get actor
  const actor = await fromUuid(rollData.actorUuid);

  // Get macro
  const macro = fromUuidSync(rollData.macroUuid);

  // Notify about low XP
  if (actor.system.basic.xp < quantity) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
  }

  // Calculate new quantity
  let xp = actor.system.basic.xp - quantity;

  // Update actor
  await actor.update({"system.basic.xp": xp});

  // Send chat message
  const info = `<div class="roll-result-box">` + game.i18n.format("CYPHERSYSTEM.XPLeft", {quantity: xp}) + `</div>`;
  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><strong>" + macro.name + "</strong></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });
}

export async function changePortraitAndToken(imagePath, data) {
  // Get actor
  const actor = await fromUuid(data.actorUuid);

  // Update actor
  await actor.update({
    "img": imagePath,
    "prototypeToken.texture.src": imagePath
  });
}

export async function executeMacroAsGM(macroUuid, rollData) {
  if (game.user.isGM) {
    // Get macro
    let macro = await fromUuid(macroUuid);

    // Execute macro
    await macro.execute({"rollData": rollData});
  }
}