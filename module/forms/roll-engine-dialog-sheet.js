/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

import {rollEngineComputation} from "../utilities/roll-engine/roll-engine-computation.js";
import {useEffectiveDifficulty} from "../utilities/roll-engine/roll-engine-main.js";
import {getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath} from "./sheet-customization.js";

const difficultyChoices = {
  ["-1"]: "CYPHERSYSTEM.None", 
  0:0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:12, 13:13, 14:14, 15:15
}
const poolChoices = {
  Might:     "CYPHERSYSTEM.Might",
  Speed:     "CYPHERSYSTEM.Speed",
  Intellect: "CYPHERSYSTEM.Intellect",
  Pool:      "CYPHERSYSTEM.AnyPool"
}
const modifierChoices = {
  eased:    'CYPHERSYSTEM.easedBy',
  hindered: 'CYPHERSYSTEM.hinderedBy'
}
const skillLevelChoices = { 
  ["-1"]: "CYPHERSYSTEM.Inability",
  0: "CYPHERSYSTEM.Practiced",
  1: "CYPHERSYSTEM.Trained",
  2: "CYPHERSYSTEM.Specialized"
}
const assetChoices = [ 0, 1, 2 ]
let effortChoices;   // Filled with localized strings on first call to getData()


export class RollEngineDialogSheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet"],
      template: "systems/cyphersystem/templates/forms/roll-engine-dialog-sheet.html",
      title: "All-in-One Roll",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      width: 745,
      height: false,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    let actor = fromUuidSync(data.actorUuid);

    if (!data.title) data.title = game.i18n.localize("CYPHERSYSTEM.StatRoll");

    data.useGlobalDifficulty = game.settings.get("cyphersystem", "rollDifficulty");

    data.effortValue = actor.system.basic.effort;

    if (!effortChoices) {
      const level = game.i18n.localize('CYPHERSYSTEM.level')
      effortChoices = {
        0: game.i18n.localize("CYPHERSYSTEM.None"),
        1: `1 ${level}`,
        2: `2 ${level}`,
        3: `3 ${level}`,
        4: `4 ${level}`,
        5: `5 ${level}`,
        6: `6 ${level}`
      }    
    }

    // selectOptions
    data.optionLists = {
      difficulty : difficultyChoices,
      pool       : poolChoices,
      modifier   : modifierChoices,
      skillLevel : skillLevelChoices,
      effort     : effortChoices,
      assets     : assetChoices
    }

    const baseSystem = data.teen ? actor.system.teen : actor.system;

    // Base stats
    data.mightValue = baseSystem.pools.might.value;
    data.mightMax   = baseSystem.pools.might.max;
    data.mightEdge  = baseSystem.pools.might.edge;

    data.speedValue = baseSystem.pools.speed.value;
    data.speedMax   = baseSystem.pools.speed.max;
    data.speedEdge  = baseSystem.pools.speed.edge;

    data.intellectValue = baseSystem.pools.intellect.value;
    data.intellectMax   = baseSystem.pools.intellect.max;
    data.intellectEdge  = baseSystem.pools.intellect.edge;

    // Effort
    data.totalEffort = data.effortToEase + data.effortOtherUses + data.effortDamage;

    // Damage Track
    data.impairedString = "";
    if (actor.system.combat.damageTrack.state == "Impaired" && actor.system.combat.damageTrack.applyImpaired) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsImpaired");
    } else if (actor.system.combat.damageTrack.state == "Debilitated" && actor.system.combat.damageTrack.applyDebilitated) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsDebilitated");
    }

    // Armor
    data.armorCost = baseSystem.combat.armor.costTotal;
    data.speedCostArmor = (data.pool == "Speed" && data.armorCost > 0) ? game.i18n.format("CYPHERSYSTEM.SpeedEffortAdditionalCostPerLevel", {armorCost: data.armorCost}) : "";

    // Summary
    data.summaryFinalDifficulty = summaryFinalDifficulty(data);
    data.summaryTaskModified = summaryTaskModified(data);
    data.summaryTotalDamage = summaryTotalDamage(data);
    data.summaryTotalCostArray = summaryTotalCost(actor, data, data.teen);
    data.summaryTotalCost = data.summaryTotalCostArray[0];
    data.summaryTotalCostString = data.summaryTotalCostArray[1];
    data.summaryTitle = data.title + ".";
    data.summaryTooMuchEffort = summaryCheckEffort(actor, data);
    data.summaryNotEnoughPointsString = summaryCheckPoints(data);
    data.summaryAllocatePoints = (data.pool == "Pool") ? game.i18n.localize("CYPHERSYSTEM.AllocatePointsYourself") : "";
    data.summaryGMIRange = game.i18n.format("CYPHERSYSTEM.CurrentGMIRange", {gmiRange: data.gmiRange});
    data.summaryMacro = summaryMacro(data);

    // Summary results
    data.exceedEffort = (data.summaryTooMuchEffort) ? "exceeded" : "";
    data.exceedMight = (data.pool == "Might" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedSpeed = (data.pool == "Speed" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedIntellect = (data.pool == "Intellect" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.disabledButton = (data.summaryTooMuchEffort || data.summaryNotEnoughPointsString) ? "disabled" : "";

    // Summary stats
    data.mightValue = (data.pool == "Might") ? data.mightValue - data.summaryTotalCost : data.mightValue;
    data.speedValue = (data.pool == "Speed") ? data.speedValue - data.summaryTotalCost : data.speedValue;
    data.intellectValue = (data.pool == "Intellect") ? data.intellectValue - data.summaryTotalCost : data.intellectValue;

    // MultiRoll data
    data.multiRollActive = actor.getFlag("cyphersystem", "multiRoll.active");
    data.multiRollEffort = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.effort") != 0) ? "multi-roll-active" : "";
    data.multiRollMightEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") != 0) ? "multi-roll-active" : "";
    data.multiRollSpeedEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") != 0) ? "multi-roll-active" : "";
    data.multiRollIntellectEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") != 0) ? "multi-roll-active" : "";

    data.sheetSettings = {};
    data.sheetSettings.backgroundImageBaseSetting = "background-image";
    data.sheetSettings.backgroundImage = getBackgroundImage();
    if (data.sheetSettings.backgroundImage == "custom") {
      data.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
      data.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
    }

    // Return data
    return data;
  }

  _updateObject(event, formData) {
    let data = this.object;

    let actor = fromUuidSync(data.actorUuid);

    // Basic data
    data.baseDifficulty = parseInt(formData.baseDifficulty);
    data.pool = formData.pool;
    data.skillLevel = parseInt(formData.skillLevel);
    data.assets = (formData.assets) ? parseInt(formData.assets) : 0;
    data.effortToEase = parseInt(formData.effortToEase);
    data.effortOtherUses = parseInt(formData.effortOtherUses);
    data.damage = (formData.damage) ? formData.damage : 0;
    data.effortDamage = parseInt(formData.effortDamage);
    data.damagePerLOE = (formData.damagePerLOE) ? formData.damagePerLOE : 3;
    data.easedOrHindered = formData.easedOrHindered;
    data.difficultyModifier = (formData.difficultyModifier) ? formData.difficultyModifier : 0;
    data.bonus = (formData.bonus) ? formData.bonus : 0;
    data.poolPointCost = (formData.poolPointCost) ? formData.poolPointCost : 0;

    // Derived data
    data.totalEffort = data.effortToEase + data.effortOtherUses + data.effortDamage;
    data.disabledButton = (data.summaryTooMuchEffort || data.summaryNotEnoughPointsString) ? "disabled" : "";

    data.mightValue = (data.pool == "Might") ? data.mightValue - data.summaryTotalCost : data.mightValue;
    data.speedValue = (data.pool == "speed") ? data.speedValue - data.summaryTotalCost : data.speedValue;
    data.intellectValue = (data.pool == "Intellect") ? data.intellectValue - data.summaryTotalCost : data.intellectValue;

    data.impairedString = "";
    if (actor.system.combat.damageTrack.state == "Impaired" && actor.system.combat.damageTrack.applyImpaired) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsImpaired");
    } else if (actor.system.combat.damageTrack.state == "Debilitated" && actor.system.combat.damageTrack.applyDebilitated) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsDebilitated");
    }

    const baseSystem = data.teen ? actor.system.teen : actor.system;
    data.armorCost = baseSystem.combat.armor.costTotal;
    data.speedCostArmor = (data.pool == "Speed" && data.armorCost > 0) ? game.i18n.format("CYPHERSYSTEM.SpeedEffortAdditionalCostPerLevel", {armorCost: data.armorCost}) : "";

    data.exceedEffort = (data.summaryTooMuchEffort) ? "exceeded" : "";
    data.exceedMight = (data.pool == "Might" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedSpeed = (data.pool == "Speed" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedIntellect = (data.pool == "Intellect" && data.summaryNotEnoughPointsString) ? "exceeded" : "";

    // MultiRoll data
    data.multiRollActive = actor.getFlag("cyphersystem", "multiRoll.active");
    data.multiRollEffort = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.effort") != 0) ? "multi-roll-active" : "";
    data.multiRollMightEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") != 0) ? "multi-roll-active" : "";
    data.multiRollSpeedEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") != 0) ? "multi-roll-active" : "";
    data.multiRollIntellectEdge = (actor.getFlag("cyphersystem", "multiRoll.active") === true && actor.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") != 0) ? "multi-roll-active" : "";

    // Summary
    data.summaryFinalDifficulty = summaryFinalDifficulty(formData);
    data.summaryTaskModified = summaryTaskModified(formData);
    data.summaryTotalDamage = summaryTotalDamage(formData);
    data.summaryTotalCostArray = summaryTotalCost(actor, formData, data.teen);
    data.summaryTotalCost = data.summaryTotalCostArray[0];
    data.summaryTotalCostString = data.summaryTotalCostArray[1];
    data.summaryTooMuchEffort = summaryCheckEffort(actor, data);
    data.summaryNotEnoughPointsString = summaryCheckPoints(data);
    data.summaryAllocatePoints = (data.pool == "Pool") ? game.i18n.localize("CYPHERSYSTEM.AllocatePointsYourself") : "";
    data.summaryMacro = summaryMacro(data);

    // Render sheet
    this.render();
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    let data = this.object;
    let actor = fromUuidSync(data.actorUuid);

    html.find('.roll-engine-roll').click(async clickEvent => {
      data.skipRoll = false;
      if (actor.system.basic.unmaskedForm != "Teen") {
        if (clickEvent.altKey) {
          await actor.enableMultiRoll(data);
          await rollEngineComputation(data);
        } else {
          await rollEngineComputation(data);
          await actor.disableMultiRoll();
        }
      } else {
        await rollEngineComputation(data);
      }
      this.close();
    });

    html.find('.roll-engine-pay').click(async clickEvent => {
      data.skipRoll = true;
      if (actor.system.basic.unmaskedForm != "Teen") {
        if (clickEvent.altKey) {
          await actor.enableMultiRoll(data);
          await rollEngineComputation(data);
        } else {
          await rollEngineComputation(data);
          await actor.disableMultiRoll();
        }
      } else {
        await rollEngineComputation(data);
      }
      this.close();
    });

    html.find('.roll-engine-cancel').click(async clickEvent => {
      if (actor.system.basic.unmaskedForm != "Teen") {
        if (clickEvent.altKey) {
          // do nothing
        } else {
          await actor.disableMultiRoll();
        }
      }
      this.close();
    });
  }
}


function summaryFinalDifficulty(data) {
  let difficultyModifier = (data.easedOrHindered == "hindered") ? data.difficultyModifier * -1 : data.difficultyModifier;
  let sum = data.skillLevel + data.assets + data.effortToEase + difficultyModifier;
  let finalDifficulty = (useEffectiveDifficulty(data.baseDifficulty)) ? parseInt(data.baseDifficulty) : Math.max(parseInt(data.baseDifficulty) - sum, 0);
  let targetNumber = finalDifficulty * 3;
  let finalDifficultyString = (data.baseDifficulty >= 0) ? game.i18n.localize("CYPHERSYSTEM.FinalDifficulty") + ": " + finalDifficulty + " (" + targetNumber + ")" + "." : "";

  return finalDifficultyString;
}

function summaryTaskModified(data) {
  let difficultyModifier = (data.easedOrHindered == "hindered") ? data.difficultyModifier * -1 : data.difficultyModifier;

  let sum = data.skillLevel + data.assets + data.effortToEase + difficultyModifier;

  let taskModifiedString = "";

  if (sum <= -2) {
    taskModifiedString = game.i18n.format("CYPHERSYSTEM.TaskHinderedBySteps", {amount: Math.abs(sum)});
  } else if (sum == -1) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskHinderedByStep");
  } else if (sum == 0) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskUnmodified");
  } else if (sum == 1) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskEasedByStep");
  } else if (sum >= 2) {
    taskModifiedString = game.i18n.format("CYPHERSYSTEM.TaskEasedBySteps", {amount: sum});
  }

  return taskModifiedString;
}

function summaryTotalDamage(data) {
  let sum = data.damage + (data.effortDamage * data.damagePerLOE);

  let totalDamageString = "";

  if (sum == 1) {
    totalDamageString = game.i18n.format("CYPHERSYSTEM.AttackDealsPointDamage", {amount: sum});
  } else if (sum >= 2) {
    totalDamageString = game.i18n.format("CYPHERSYSTEM.AttackDealsPointsDamage", {amount: sum});
  }

  return totalDamageString;
}

function summaryTotalCost(actor, data, teen) {
  const baseSystem = teen ? actor.system.teen : actor.system;

  let armorCost = (data.pool == "Speed") ? baseSystem.combat.armor.costTotal : 0;

  let impairedCost = 0;
  if (actor.system.combat.damageTrack.state == "Impaired" && actor.system.combat.damageTrack.applyImpaired) {
    impairedCost = 1;
  }
  else if (actor.system.combat.damageTrack.state == "Debilitated" && actor.system.combat.damageTrack.applyDebilitated) {
    impairedCost = 1;
  }

  let edge = 0;
  if (data.pool == "Might") 
    edge = baseSystem.pools.might.edge;
  else if (data.pool == "Speed") 
    edge = baseSystem.pools.speed.edge;
  else if (data.pool == "Intellect") 
    edge = baseSystem.pools.intellect.edge;

  let effortCost = 1 + (data.totalEffort * 2) + (data.totalEffort * armorCost) + (data.totalEffort * impairedCost);

  let costWithoutEdge = (data.totalEffort >= 1) ? data.poolPointCost + effortCost : data.poolPointCost;

  let totalCost = costWithoutEdge - edge;
  if (totalCost < 0) totalCost = 0;

  let totalCostString = "";
  if (totalCost == 1) {
    totalCostString = game.i18n.format("CYPHERSYSTEM.TaskCostsPoint", {amount: totalCost, pool: game.i18n.format("CYPHERSYSTEM." + data.pool)});
  } else {
    totalCostString = game.i18n.format("CYPHERSYSTEM.TaskCostsPoints", {amount: totalCost, pool: game.i18n.format("CYPHERSYSTEM." + data.pool)});
  }

  return [totalCost, totalCostString, costWithoutEdge];
}

function summaryCheckEffort(actor, data) {
  return (data.totalEffort > actor.system.basic.effort) ? game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort") : "";
}

function summaryCheckPoints(data) {
  let poolPoints = 0;
  if (data.pool == "Might") poolPoints = data.mightValue;
  if (data.pool == "Speed") poolPoints = data.speedValue;
  if (data.pool == "Intellect") poolPoints = data.intellectValue;

  let summaryNotEnoughPointsString = "";

  if ((data.summaryTotalCost > poolPoints) && (data.pool != "Pool")) {
    summaryNotEnoughPointsString = game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {amount: poolPoints, pool: data.pool});
  }

  return summaryNotEnoughPointsString;
}

function summaryMacro(data) {
  let summaryMacroString = "";

  if (data.macroUuid) {
    let macro = fromUuidSync(data.macroUuid);
    summaryMacroString = game.i18n.format("CYPHERSYSTEM.MacroUsed", {macro: macro.name});
  }

  return summaryMacroString;
}