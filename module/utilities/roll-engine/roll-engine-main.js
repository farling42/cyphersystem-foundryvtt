import {rollEngineComputation} from "./roll-engine-computation.js";
import {rollEngineForm} from "./roll-engine-form.js";
import {skillModifier} from '../../item/itemdatamodel.js';

export async function rollEngineMain(data) {
  data = Object.assign({
    actorUuid: undefined,
    itemID: undefined,
    macroUuid: undefined,
    teen: undefined,
    skipDialog: !game.settings.get("cyphersystem", "itemMacrosUseAllInOne"),
    skipRoll: false,
    initiativeRoll: false,
    reroll: false,
    gmiRange: undefined,
    title: "",
    baseDifficulty: undefined,
    pool: "Pool",
    skillLevel: 0,
    assets: 0,
    effortToEase: 0,
    effortOtherUses: 0,
    damage: 0,
    effortDamage: 0,
    damagePerLOE: 0,
    difficultyModifier: 0,
    easedOrHindered: "eased",
    bonus: 0,
    poolPointCost: 0
  }, data);

  // Find actor
  data.actorUuid ??= game.user.character?.uuid;
  const actor = data.actorUuid ? await fromUuid(data.actorUuid) : undefined;

  // Check for PC actor
  if (!actor || actor.type !== "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Find item
  const item = data.itemID ? actor.items.get(data.itemID) : undefined;

  // Skip dialog?
  if (game.keyboard.isModifierActive("Alt")) data.skipDialog = !data.skipDialog;
  if (actor.multiRoll?.active) data.skipDialog = false;
  if (data.reroll) data.skipDialog = true;

  // Check whether pool === XP
  if (data.pool === "XP" && !data.skipDialog) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CantUseAIOMacroWithAbilitiesUsingXP"));

  data.baseDifficulty ??= game.settings.get("cyphersystem", "rollDifficulty");

  // Set defaults for functions
  data.teen ??= actor.system.isTeen;
  data.initiativeRoll = item ? item.system.settings.general.initiative : false;

  // Set GMI Range
  data.gmiRange ??= game.settings.get("cyphersystem", "globalGMIRange") || actor.system.basic.gmiRange;

  // Set default basic modifiers
  if (typeof data.skillLevel === "string") data.skillLevel = skillModifier[data.skillLevel];

  // Check for macro
  if (data.macroUuid) {
    let macro = await fromUuid(data.macroUuid);
    if (!macro) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroNotFound"));
  }

  // Go to the next step after checking whether dialog should be skipped
  if (!data.skipDialog) {
    rollEngineForm(data);
  } else {
    rollEngineComputation(data);
  }
}

export function useEffectiveDifficulty(difficulty) {
  let setting = game.settings.get("cyphersystem", "effectiveDifficulty");
  // 0 = SettingRollMacroNever
  // 1 = SettingRollMacroAlways
  // 2 = SettingRollMacroOnlyWhenNoDifficultyIsSet
  return (setting === 1) || (setting === 2 && difficulty === -1);
}