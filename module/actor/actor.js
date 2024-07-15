/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
 * @extends {Actor}
 */

import {
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardRegainPoints
} from "../utilities/chat-cards.js";
import {
  deleteChatMessage,
  giveAdditionalXP
} from '../utilities/game-sockets.js';
import {
  renderGMIForm
} from "../forms/gmi-range-sheet.js";


export class CypherActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  async _preCreate(data, options, user) {
    switch (this.type) {
      case "pc":
      case "community":
        this.updateSource({ "prototypeToken.actorLink": true });
        break;
      case "npc":
        this.updateSource({
          "prototypeToken.bar1": { "attribute": "pools.health" },
          "prototypeToken.bar2": { "attribute": "basic.level" }
        });
        break;
      case "companion":
        this.updateSource({
          "prototypeToken.bar1": { "attribute": "pools.health" },
          "prototypeToken.bar2": { "attribute": "basic.level" },
          "prototypeToken.actorLink": true
        });
        break;
      case "marker":
        this.updateSource({
          "prototypeToken.bar1": { "attribute": "pools.quantity" },
          "prototypeToken.bar2": { "attribute": "basic.level" }
        });
        break;
    }
    return super._preCreate(data, options, user);
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type !== 'pc') return;

    // After any item changes
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (const item of this.items) {
      if (item.type === 'armor' && item.system.active && !item.system.archived) {
        if (item.system.isTeen) {
          teenArmorTotal     += item.system.basic.rating;
          teenSpeedCostTotal += item.system.basic.cost;
        } else {
          armorTotal     += item.system.basic.rating;
          speedCostTotal += item.system.basic.cost;
        }
      }
    }

    // Updating derived armour values
    this.system.combat.armor.ratingTotal = armorTotal;        
    this.system.combat.armor.costTotal   = speedCostTotal;
    this.system.teen.combat.armor.ratingTotal = teenArmorTotal;
    this.system.teen.combat.armor.costTotal   = teenSpeedCostTotal;
  }

  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.type === "pc" && (changed?.system?.basic?.gmiRange || changed.ownership)) {
      renderGMIForm();
    }
  }

  payPoolPoints(costCalculated, pool, teen) {
    // Where from?
    const pools = teen ? this.system.teen.pools : this.system.pools;
    const prefix = teen ? "system.teen.pools" : "system.pools";

    // Determine edge
    const relevantEdge = {
      "Might": pools.might.edge,
      "Speed": pools.speed.edge,
      "Intellect": pools.intellect.edge
    };
    let edge = (relevantEdge[pool] || 0);

    // Check for weakness
    edge = (edge < 0 && (costCalculated === 0 || costCalculated === "")) ? 0 : edge;

    // Determine costCalculated
    costCalculated -= edge;
    if (costCalculated < 0) costCalculated = 0;

    // Check if enough points are avalable and update actor
    switch (pool) {
      case "Might":
        if (costCalculated > pools.might.value) {
          ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
          return false;
        }
        this.update({ [`${prefix}.might.value`]: pools.might.value - costCalculated });
        break;
      case "Speed":
        if (costCalculated > pools.speed.value) {
          ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
          return false;
        }
        this.update({ [`${prefix}.speed.value`]: pools.speed.value - costCalculated });
        break;
      case "Intellect":
        if (costCalculated > pools.intellect.value) {
          ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
          return false;
        }
        this.update({ [`${prefix}.intellect.value`]: pools.intellect.value - costCalculated });
        break;
      case "XP":
        if (costCalculated > this.system.basic.xp) {
          ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
          return false;
        }
        this.update({ "system.basic.xp": this.system.basic.xp - costCalculated });
        break;
    }

    return { costTotal: costCalculated, edge, pool };
  }

  async regainPoolPoints(cost, poolname, teen) {
    const pools = teen ? this.system.teen.pools : this.system.pools;
    const prefix = teen ? "system.teen.pools" : "system.pools";
    poolname = poolname.toLowerCase();

    // Return points
    if (pools[poolname] !== undefined) {
      this.update({ [`${prefix}.${poolname}.value`]: pools[poolname].value + cost });
    }

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: chatCardRegainPoints(this, cost, poolname, teen)
    });
  }

  useRecoveries(spell) {
    const recoveries = this.system.combat.recoveries;
    const additionalRecoveries = this.system.settings.combat;

    if (!recoveries.oneAction && additionalRecoveries.numberOneActionRecoveries >= 1) {
      this.update({ "system.combat.recoveries.oneAction": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction2 && additionalRecoveries.numberOneActionRecoveries >= 2) {
      this.update({ "system.combat.recoveries.oneAction2": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction3 && additionalRecoveries.numberOneActionRecoveries >= 3) {
      this.update({ "system.combat.recoveries.oneAction3": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction4 && additionalRecoveries.numberOneActionRecoveries >= 4) {
      this.update({ "system.combat.recoveries.oneAction4": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction5 && additionalRecoveries.numberOneActionRecoveries >= 5) {
      this.update({ "system.combat.recoveries.oneAction5": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction6 && additionalRecoveries.numberOneActionRecoveries >= 6) {
      this.update({ "system.combat.recoveries.oneAction6": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction7 && additionalRecoveries.numberOneActionRecoveries >= 7) {
      this.update({ "system.combat.recoveries.oneAction7": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.tenMinutes && additionalRecoveries.numberTenMinuteRecoveries >= 1) {
      this.update({ "system.combat.recoveries.tenMinutes": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
    } else if (!recoveries.tenMinutes2 && additionalRecoveries.numberTenMinuteRecoveries >= 2) {
      this.update({ "system.combat.recoveries.tenMinutes2": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
    } else if (!recoveries.oneHour) {
      this.update({ "system.combat.recoveries.oneHour": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryOneHour");
    } else if (!recoveries.tenHours && !spell) {
      this.update({ "system.combat.recoveries.tenHours": true });
      return game.i18n.localize("CYPHERSYSTEM.RecoveryTenHours");
    } else {
      ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoRecoveriesLeft", { name: this.name }));
      return undefined;
    }
  }

  get isExclusiveTagActive() {
    const item = this.items.find(item => item.type === "tag" && item.system.exclusive && item.system.active);
    return !!item;
  }

  async addCharacterToCombatTracker() {
    const token = canvas.tokens.objects.children(token => token.actor.id === this.id);
    if (token && !token.inCombat) return token.toggleCombat();
  }

  async setInitiativeForCharacter(initiative) {
    const combatant = game.combat.combatants.find(combatant => combatant.actor.id === this.id);
    if (combatant) return game.combat.setInitiative(combatant.id, initiative);
  }

  // Function to apply XP when an intrusion is accepted
  applyXPFromIntrusion(selectedActorId, messageId, modifier) {
    this.update({ "system.basic.xp": this.system.basic.xp + modifier });

    // Emit a socket event
    if (selectedActorId) giveAdditionalXP(selectedActorId, modifier);
    deleteChatMessage(messageId);

    ChatMessage.create({
      content: (modifier === 1) ? chatCardIntrusionAccepted(this, selectedActorId) : chatCardIntrusionRefused(this, selectedActorId)
    });
  }

  get multiRoll() {
    return this.flags.cyphersystem?.multiRoll;
  }

  async enableMultiRoll(data) {
    let pool = this.system.pools;

    const currModifiers = this.multiRoll?.modifiers;
    let oldEffortModifier = currModifiers?.effort || 0;
    let oldMightEdgeModifier = currModifiers?.might?.edge || 0;
    let oldSpeedEdgeModifier = currModifiers?.speed?.edge || 0;
    let oldIntellectEdgeModifier = currModifiers?.intellect?.edge || 0;

    let mightCost = (data.pool === "Might") ? data.summaryTotalCostArray[2] : 0;
    let speedCost = (data.pool === "Speed") ? data.summaryTotalCostArray[2] : 0;
    let intellectCost = (data.pool === "Intellect") ? data.summaryTotalCostArray[2] : 0;

    let effortModifier = data.totalEffort * -1;
    let mightEdgeModifier = Math.min(this.system.pools.might.edge, mightCost) * -1;
    let speedEdgeModifier = Math.min(this.system.pools.speed.edge, speedCost) * -1;
    let intellectEdgeModifier = Math.min(this.system.pools.intellect.edge, intellectCost) * -1;

    return this.update({
      "system.basic.effort": this.system.basic.effort + effortModifier,
      "system.pools.might.edge": pool.might.edge + mightEdgeModifier,
      "system.pools.speed.edge": pool.speed.edge + speedEdgeModifier,
      "system.pools.intellect.edge": pool.intellect.edge + intellectEdgeModifier,
      "flags.cyphersystem.multiRoll.active": true,
      "flags.cyphersystem.multiRoll.modifiers.effort": oldEffortModifier + effortModifier,
      "flags.cyphersystem.multiRoll.modifiers.might.edge": oldMightEdgeModifier + mightEdgeModifier,
      "flags.cyphersystem.multiRoll.modifiers.speed.edge": oldSpeedEdgeModifier + speedEdgeModifier,
      "flags.cyphersystem.multiRoll.modifiers.intellect.edge": oldIntellectEdgeModifier + intellectEdgeModifier
    });
  }

  async disableMultiRoll() {
    let pool = this.system.pools;

    const currModifiers = this.multiRoll?.modifiers;
    let oldEffortModifier = currModifiers?.effort || 0;
    let oldMightEdgeModifier = currModifiers?.might?.edge || 0;
    let oldSpeedEdgeModifier = currModifiers?.speed?.edge || 0;
    let oldIntellectEdgeModifier = currModifiers?.intellect?.edge || 0;

    return this.update({
      "system.basic.effort": this.system.basic.effort - oldEffortModifier,
      "system.pools.might.edge": pool.might.edge - oldMightEdgeModifier,
      "system.pools.speed.edge": pool.speed.edge - oldSpeedEdgeModifier,
      "system.pools.intellect.edge": pool.intellect.edge - oldIntellectEdgeModifier,
      "flags.cyphersystem.multiRoll.active": false,
      "flags.cyphersystem.multiRoll.modifiers.effort": 0,
      "flags.cyphersystem.multiRoll.modifiers.might.edge": 0,
      "flags.cyphersystem.multiRoll.modifiers.speed.edge": 0,
      "flags.cyphersystem.multiRoll.modifiers.intellect.edge": 0
    });
  }

}
