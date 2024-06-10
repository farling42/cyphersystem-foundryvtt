import {rollEngineForm} from "./roll-engine-form.js";
import {useEffectiveDifficulty} from "./roll-engine-main.js";
import {rollEngineOutput} from "./roll-engine-output.js";

export async function rollEngineComputation(data) {
  let actor = fromUuidSync(data.actorUuid);

  // Roll dice
  data.roll = await new Roll("1d20").evaluate();

  // Check for effort
  data.effortTotal = data.effortToEase + data.effortOtherUses + data.effortDamage;
  if (data.effortTotal > actor.system.basic.effort) {
    return ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
  }

  // Determine impaired & debilitated status
  const combat = data.teen ? actor.system.teen.combat : actor.system.combat;
  if (combat.damageTrack.state == "Impaired"    && combat.damageTrack.applyImpaired)    data.impairedStatus = true;
  if (combat.damageTrack.state == "Debilitated" && combat.damageTrack.applyDebilitated) data.impairedStatus = true;

  // Calculate damage
  data.damageEffort     = data.damagePerLOE * data.effortDamage;
  data.totalDamage      = data.damage + data.damageEffort;
  data.damageEffect     = (data.roll.total < 17) ? 0 : data.impairedStatus ? 1 : (data.roll.total - 16);
  data.damageWithEffect = data.totalDamage + data.damageEffect;

  // Calculate total cost
  data.impaired = (data.impairedStatus) ? data.effortTotal : 0;
  data.armorCost = (data.pool == "Speed") ? data.effortTotal * actor.system.combat.armor.costTotal : 0;
  data.costCalculated = (data.effortTotal > 0) ? (data.effortTotal * 2) + 1 + data.poolPointCost + data.armorCost + data.impaired : data.poolPointCost;

  // Pay pool points
  let payPoolPointsInfo = [];
  if (!data.reroll || data.pool == "Pool") {
    payPoolPointsInfo = await actor.payPoolPoints(data.costCalculated, data.pool, data.teen);
  } else if (data.reroll) {
    let edge = actor.system.pools[data.pool.toLowerCase()].edge;
    payPoolPointsInfo = [true, Math.max(0, data.costCalculated - edge), edge];
  }
  data.costTotal = payPoolPointsInfo[1];
  data.edge = payPoolPointsInfo[2];

  // Calculate roll modifiers
  if (data.easedOrHindered == "hindered") data.difficultyModifier = data.difficultyModifier * -1;
  data.difficultyModifierTotal = data.skillLevel + data.assets + data.effortToEase + data.difficultyModifier;

  // Calculate rollTotal
  data.rollTotal = data.roll.total + data.bonus;

  // Calculate difficulty
  data.difficulty = (data.rollTotal < 0) ? Math.ceil(data.rolltotal / 3) : Math.floor(data.rollTotal / 3);
  data.difficultyResult = determineDifficultyResult(data.baseDifficulty, data.difficulty, data.difficultyModifierTotal);
  data.finalDifficulty = (useEffectiveDifficulty(data.baseDifficulty)) ? data.baseDifficulty : Math.max(data.baseDifficulty - data.difficultyModifierTotal, 0);

  // Go to next step
  if (payPoolPointsInfo[0]) {
    rollEngineOutput(data);
  } else if (!payPoolPointsInfo[0] && !data.skipDialog) {
    rollEngineForm(data);
  }
}

function determineDifficultyResult(baseDifficulty, difficulty, difficultyModifierTotal) {
  if (useEffectiveDifficulty(baseDifficulty)) {
    let operator = (difficultyModifierTotal < 0) ? "-" : "+";
    let effectiveDifficulty = difficulty + difficultyModifierTotal;
    if (effectiveDifficulty < 0) effectiveDifficulty = 0;
    return effectiveDifficulty + " [" + difficulty + operator + Math.abs(difficultyModifierTotal) + "]";
  } else {
    if (difficulty < 0) difficulty = 0;
    return difficulty + " (" + difficulty * 3 + ")";
  }
}