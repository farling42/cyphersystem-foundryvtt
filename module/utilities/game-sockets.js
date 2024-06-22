import {executeMacroAsGM} from "../macros/macros-scripting.js";
import {resetDifficulty} from "./roll-engine/roll-engine-main.js";

export function deleteChatMessage(data) {
  // Only actionable by the GM
  game.messages.get(data.messageId).delete();
}

export function giveAdditionalXP(data) {
  // Only actionable by the GM
  let selectedActor = game.actors.get(data.selectedActorId);
  selectedActor.update({"system.basic.xp": selectedActor.system.basic.xp + data.modifier});
}

export function gameSockets() {
  game.socket.on("system.cyphersystem", (data) => {
    if (data.operation === "deleteChatMessage") deleteChatMessage(data);
    if (data.operation === "giveAdditionalXP") giveAdditionalXP(data);
    if (data.operation === "resetDifficulty") resetDifficulty();
    if (data.operation === "executeMacroAsGM") executeMacroAsGM(data.macroUuid, data.rollData);
  });
}