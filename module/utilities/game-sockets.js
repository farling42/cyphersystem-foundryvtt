import {updateRollDifficultyForm} from "../forms/roll-difficulty-sheet.js";
import {executeMacroAsGM} from "../macros/macros-scripting.js";
import {deleteChatMessage, giveAdditionalXP} from "./actor-utilities.js";
import {resetDifficulty} from "./roll-engine/roll-engine-main.js";

export function deleteChatMessage(data) {
  if (game.user.isGM) game.messages.get(data.messageId).delete();
}

export function giveAdditionalXP(data) {
  if (game.user.isGM) {
    let selectedActor = game.actors.get(data.selectedActorId);
    selectedActor.update({"system.basic.xp": selectedActor.system.basic.xp + data.modifier});
  }
}

export function gameSockets() {
  game.socket.on("system.cyphersystem", (data) => {
    if (data.operation === "deleteChatMessage") deleteChatMessage(data);
    if (data.operation === "giveAdditionalXP") giveAdditionalXP(data);
    if (data.operation === "updateRollDifficultyForm") updateRollDifficultyForm();
    if (data.operation === "resetDifficulty") resetDifficulty();
    if (data.operation === "executeMacroAsGM") executeMacroAsGM(data.macroUuid, data.rollData);
  });
}