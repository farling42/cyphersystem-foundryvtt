export function deleteChatMessage(messageId) {
  if (!game.user.isGM)
    return game.socket.emit('system.cyphersystem', { operation: 'deleteChatMessage', messageId });

  return game.messages.get(messageId).delete();
}

export function giveAdditionalXP(selectedActorId, modifier) {
  if (!game.user.isGM)
    return game.socket.emit('system.cyphersystem', { operation: 'giveAdditionalXP', selectedActorId, modifier });

  const selectedActor = game.actors.get(selectedActorId);
  return selectedActor.update({"system.basic.xp": selectedActor.system.basic.xp + modifier});
}

export function resetDifficulty() {
  if (!game.user.isGM)
    return game.socket.emit("system.cyphersystem", {operation: "resetDifficulty"});

  return game.settings.set("cyphersystem", "rollDifficulty", -1);
}

export async function executeMacroAsGM(macroUuid, rollData) {
  if (!game.user.isGM)
    return game.socket.emit('system.cyphersystem', {operation: 'executeMacroAsGM', macroUuid: data.macroUuid, rollData: data});

  // Get macro
  let macro = await fromUuid(macroUuid);
  await macro.execute({"rollData": rollData});
}

export function gameSockets() {
  if (!game.user.isGM) return;
  game.socket.on("system.cyphersystem", data => {
    switch (data.operation) {
      case "deleteChatMessage": deleteChatMessage(data.messageId); break;
      case "giveAdditionalXP": giveAdditionalXP(data.selectedActorId, data.modifier); break;
      case "resetDifficulty": resetDifficulty(); break;
      case "executeMacroAsGM": executeMacroAsGM(data.macroUuid, data.rollData); break;
    }
  })
}