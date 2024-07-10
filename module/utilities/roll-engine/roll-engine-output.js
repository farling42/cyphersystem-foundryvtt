import {useEffectiveDifficulty} from "./roll-engine-main.js";
import {resetDifficulty} from "../game-sockets.js";

function plural(value, string) { return value===1 ? string : (string + "s") }

export async function rollEngineOutput(data) {
  let actor = await fromUuid(data.actorUuid);

  // Get show details setting
  const showDetails = game.settings.get("cyphersystem", "showRollDetails") ? '-details expanded"' : '-details" style="display: none"';

  // Title and description
  let title = data.title ? `<strong>${data.title}</strong><br>` : `<strong>${game.i18n.localize("CYPHERSYSTEM.StatRoll")}</strong>`;
  let itemDescription = "";
  let itemDescriptionInfo = "";
  const item = actor.items.get(data.itemID);
  if (item) {
    itemDescription = (item.system.description) ? `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>` + await TextEditor.enrichHTML(item.system.description, {relativeTo: item}) : `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>`;

    let styleDescriptionHidden = `<div style="display: none" class="chat-card-item-description">`;
    let styleDescriptionShow = `<div class="chat-card-item-description expanded">`;
    let styleDescription = (game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll")) ? styleDescriptionShow : styleDescriptionHidden;

    itemDescriptionInfo = `${styleDescription}<div style="min-height: 50px">${itemDescription}</div></div>`;

    title = `<a class="chat-description"><strong>${title}</a></strong>`;
  }

  // --- Difficulty block

  // Base difficulty
  let baseDifficultyInfo = (!useEffectiveDifficulty(data.baseDifficulty) && data.baseDifficulty >= 0) ? `${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: ${data.baseDifficulty}<br>` : "";

  // Steps eased/hindered
  let modifiedBy = "";
  if (data.difficultyModifierTotal !== 0) {
    if (data.difficultyModifierTotal > 1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: data.difficultyModifierTotal});
    } else if (data.difficultyModifierTotal === 1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if (data.difficultyModifierTotal === -1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if (data.difficultyModifierTotal < -1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(data.difficultyModifierTotal)});
    }
  }

  // Final task difficulty
  let taskDifficulty = "";
  if (data.baseDifficulty >= 0 && data.finalDifficulty >= 0) {
    taskDifficulty = game.i18n.localize("CYPHERSYSTEM.Difficulty") + ": " + data.finalDifficulty + " (" + Math.max(0, data.finalDifficulty * 3) + ")";
  } else if (modifiedBy) {
    taskDifficulty = modifiedBy;
  };

  // Skill information
  const skillRating = {
    "-1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Inability")}<br>`,
    "0": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Practiced")}<br>`,
    "1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Trained")}<br>`,
    "2": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Specialized")}<br>`
  };
  const skillInfo = (skillRating[data.skillLevel] || skillRating[0]);

  // Asset information
  const assetsInfo = `${game.i18n.localize("CYPHERSYSTEM.Assets")}: ${data.assets}<br>`;

  // effortToEase information
  const effortToEaseInfo = `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.effortToEase} ${plural(data.effortToEase, game.i18n.localize("CYPHERSYSTEM.level"))}<br>`;

  // Additional step(s) information
  let difficultyInfo = "";
  if (data.difficultyModifier) {
    if (data.easedOrHindered !== "hindered") {
      difficultyInfo = `${game.i18n.format(plural(data.difficultyModifier, "CYPHERSYSTEM.EasedByExtraStep"), {amount: data.difficultyModifier})}<br>`;
    } else {
      const val = Math.abs(data.difficultyModifier);
      difficultyInfo = `${game.i18n.format(plural(val, "CYPHERSYSTEM.HinderedByExtraStep"), {amount: val})}<br>`;
    }
  }

  // Create block
  const difficultyBlock = (data.skipRoll || taskDifficulty === "") ? "" :
    `<div class="roll-result-box"><strong><a class="roll-result-difficulty">${taskDifficulty}</a></strong><br><div class="roll-result-difficulty${showDetails}">${baseDifficultyInfo}${skillInfo}${assetsInfo}${effortToEaseInfo}${difficultyInfo}</div></div>`;

  // --- Damage block

  // Base damage
  let baseDamageInfo   = game.i18n.format(plural(data.damage, "CYPHERSYSTEM.BaseDamagePoint"), {baseDamage: data.damage});
  let effectDamageInfo = game.i18n.format(plural(data.damageEffect, "CYPHERSYSTEM.EffectDamagePoint"), {baseDamage: data.damageEffect});

  // Damage information
  let damageInfo = "";
  if (data.totalDamage > 0) {
    if (data.damageEffect === 0)
      damageInfo = game.i18n.format(plural(data.totalDamage, "CYPHERSYSTEM.DamageInflictedPoint"), {totalDamage: data.totalDamage});
    else if (data.damageEffect < 3)
      damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInflictedPoints", {totalDamage: data.damageWithEffect});
    else
      damageInfo = game.i18n.format("CYPHERSYSTEM.DamageWithEffectInfo", {totalDamage: data.totalDamage, damageWithEffect: data.damageWithEffect});
  }

  // Effort information
  let effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.damageEffort} ${game.i18n.localize(plural(data.effortDamage, "CYPHERSYSTEM.Point"))}<br>`;

  // Details style
  let damageDetailsInfo = `<div class="roll-result-damage${showDetails}>${baseDamageInfo}<br>${effectDamageInfo}<br>${effortDamageInfo}</div>`;

  // Create block
  let damageInfoBlock = "";
  if (damageInfo !== "") {
    damageInfoBlock = `<div class="roll-result-box"><strong><a class="roll-result-damage">${damageInfo}</a></strong><br>${damageDetailsInfo}</div>`;
  }

  // --- Cost info block

  // Cost information
  let poolCostInfo = {
    "Might": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize(plural(data.poolPointCost, "CYPHERSYSTEM.Point"))}`;
    },
    "Speed": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize(plural(data.poolPointCost, "CYPHERSYSTEM.Point"))}`;
    },
    "Intellect": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize(plural(data.poolPointCost, "CYPHERSYSTEM.Point"))}`;
    },
    "Pool": function () {
        return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize(plural(data.poolPointCost, "CYPHERSYSTEM.Point"))}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost}  ${game.i18n.localize("CYPHERSYSTEM.XP")}`;
    }
  };

  let costTotalInfo = {
    "Might": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize(plural(data.costTotal, "CYPHERSYSTEM.MightPoint"))}`;
    },
    "Speed": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize(plural(data.costTotal, "CYPHERSYSTEM.SpeedPoint"))}`;
    },
    "Intellect": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize(plural(data.costTotal, "CYPHERSYSTEM.IntellectPoint"))}`;
    },
    "Pool": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize(plural(data.costTotal, "CYPHERSYSTEM.AnyPoolPoint"))}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.XP")}`;
    }
  };

  // Details style
  let costInfoBlock = (data.poolPointCost === 0 && data.costCalculated === 0) ? "" :
    `<div class="roll-result-box"><strong><a class="roll-result-cost">${costTotalInfo[data.pool]()}</a></strong><div class="roll-result-cost${showDetails}">${poolCostInfo[data.pool]()}<br>${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.costCalculated - data.poolPointCost} ${game.i18n.localize(plural(data.costCalculated, "CYPHERSYSTEM.Point"))}<br>${game.i18n.localize("CYPHERSYSTEM.Edge")}: ${data.edge}</div></div>`;

  // --- Roll result block

  // Determine result with bonus/penalty
  let resultInfo = data.bonus ? `<span class='roll-result'>${game.i18n.localize("CYPHERSYSTEM.Result")}: ${data.rollTotal} [${data.roll.total}${data.bonus}]</span><br>` : "";

  // Determine special effect
  let effect = "";
  let boxColor = "";

  if (data.roll.total === 1) {
    // GM intrusion?
    boxColor = "box1";
  } else if (!data.impairedStatus) {
    if (data.roll.total === 17 && data.totalDamage > 0) {
      effect = `<br><span class='roll-effect effect1718'>${game.i18n.localize("CYPHERSYSTEM.OneDamage")}</span>`;
      boxColor = "box1718";
    } else if (data.roll.total === 18 && data.totalDamage > 0) {
      effect = `<br><span class='roll-effect effect1718'>${game.i18n.localize("CYPHERSYSTEM.TwoDamage")}</span>`;
      boxColor = "box1718";
    } else if (data.roll.total === 19) {
      effect = `<br><span class='roll-effect effect1920'>${game.i18n.localize((data.totalDamage > 0) ? "CYPHERSYSTEM.DamageOrMinorEffectRoll" : "CYPHERSYSTEM.MinorEffectRoll")}</span>`;
      boxColor = "box1920";
    } else if (data.roll.total === 20) {
      effect = `<br><span class='roll-effect effect1920'>${game.i18n.localize((data.totalDamage > 0) ? "CYPHERSYSTEM.DamageOrMajorEffectRoll" : "CYPHERSYSTEM.MajorEffectRoll")}</span>`;
      boxColor = "box1920";
    }
  } else if (data.roll.total >= 17 && data.totalDamage > 0) {
    // impaired
    effect = `<br><span class='roll-effect effect1718'>${game.i18n.localize("CYPHERSYSTEM.OneDamage")}</span>`;
    boxColor = "box1718";
  }

  let gmiEffect = "";
  if (data.roll.total <= data.gmiRange) {
    gmiEffect = `<br><span class='roll-effect intrusion'>${game.i18n.localize("CYPHERSYSTEM.GMIntrusion")}</span>`;
    boxColor = "box1";
  }

  // Create multi roll
  let multiRollInfo = (actor.multiRoll?.active) ? `<div class='multi-roll-active'>${game.i18n.localize("CYPHERSYSTEM.MultiRoll")}</div>` : "";

  // Create reroll info
  let rerollInfo = (data.reroll) ? `<div>${game.i18n.localize("CYPHERSYSTEM.Reroll")}</div>` : "";

  // Create beatenDifficulty
  let beatenDifficulty = `<span class='roll-difficulty'>${game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty")} ${data.difficultyResult}</span>`;

  // Add initiative result
  let initiativeResult = data.roll.total + (data.difficultyModifierTotal * 3) + data.bonus;
  let initiativeInfo = (data.initiativeRoll) ? `<br><span class='roll-initiative'>${game.i18n.localize("CYPHERSYSTEM.Initiative")}: ${initiativeResult}</span > ` : "";

  // Create success info
  let successInfo = "";
  if (data.baseDifficulty >= 0) {
    let difficultyBeaten = (useEffectiveDifficulty(data.baseDifficulty)) ? data.difficulty + data.difficultyModifierTotal : data.difficulty;
    successInfo = (difficultyBeaten >= data.finalDifficulty) ? `<br><span class='roll-effect effect1920'>${game.i18n.localize("CYPHERSYSTEM.Success")}</span>` : `<br><span class='roll-effect intrusion'>${game.i18n.localize("CYPHERSYSTEM.Failure")}</span>`;
  };

  // Create info block
  let info = difficultyBlock + costInfoBlock + damageInfoBlock;

  // Add reroll button
  let actorUuid = (actor) ? actor.uuid : "";
  data.baseDifficulty = (data.baseDifficulty >= 0) ? parseInt(data.baseDifficulty) : data.baseDifficulty;
  let dataString = JSON.stringify(data);
  let reRollButton = ` <a class='reroll-stat' title='${game.i18n.localize("CYPHERSYSTEM.Reroll")}' data-user='${game.user.id}' data-data='${dataString}'><i class="fas fa-dice-d20"></i></a>`;

  // Add regain points button
  let regainPointsButton = "";
  if (data.costTotal > 0 && data.roll.total === 20 && ["Might", "Speed", "Intellect"].includes(data.pool)) {
    regainPointsButton = `<a class='regain-points' title='${game.i18n.localize("CYPHERSYSTEM.RegainPoints")}' data-user='${game.user.id}' data-actor-uuid='${actorUuid}' data-cost='${data.costTotal}' data-pool='${data.pool}' data-teen='${data.teen}'><i class="fas fa-coins"></i></a>`;
  }

  // Put buttons together
  const chatButtons = `<div class="chat-card-buttons" data-actor-uuid="${actorUuid}">${regainPointsButton}${reRollButton}</div>`;

  // HR if info
  const infoHR = info ? `<hr class='roll-result-hr'>` : "";

  if (data.skipRoll) {
    ChatMessage.create({
      content: `<div class='roll-flavor'><div class='roll-result-box'>${title}${itemDescriptionInfo}</div>${infoHR}${info}</div>`,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flags: {
        "itemID": data.itemID,
        "data": data
      }
    });
  } else {
    // Create chat message
    await data.roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: `<div class='roll-flavor'><div class='roll-result-box'>${title}${rerollInfo}${multiRollInfo}${itemDescriptionInfo}</div><hr class='roll-result-hr'>${info}${infoHR}<div class='roll-result-box ${boxColor}'>${resultInfo}${beatenDifficulty}${initiativeInfo}${successInfo}${effect}${gmiEffect}</div>${chatButtons}</div>`,
      flags: {
        "itemID": data.itemID,
        "data": data
      }
    });

    // Handle initiative
    if (data.initiativeRoll) {
      await actor.addCharacterToCombatTracker();
      await actor.setInitiativeForCharacter(initiativeResult);
    }
  }

  // Reset difficulty
  if (game.settings.get("cyphersystem", "persistentRollDifficulty") === 0) {
    await resetDifficulty();
  }

  // statRoll hook
  Hooks.call("rollEngine", actor, data);

  // Execute macro
  if (data.macroUuid) {
    let macro = await fromUuid(data.macroUuid);
    if (rollMessage) {
      await game.dice3d?.waitFor3DAnimationByMessageID(rollMessage.id);
    }
    macro.execute({"rollData": data});
  }
}
