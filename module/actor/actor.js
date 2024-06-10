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

export class CypherActor extends Actor {

  async payPoolPoints(costCalculated, pool, teen, edge) {
    // Where from?
    const pools = teen ? this.system.teen.pools : this.system.pools;
    const prefix = teen ? "system.teen.pools" : "system.pools";

    // Determine edge
    if (!edge) {
      let relevantEdge = {
        "Might": pools.might.edge,
        "Speed": pools.speed.edge,
        "Intellect": pools.intellect.edge
      };
      edge = (relevantEdge[pool] || 0);
    }

    // Check for weakness
    edge = (edge < 0 && (costCalculated == 0 || costCalculated == "")) ? 0 : edge;

    // Determine costCalculated
    costCalculated = costCalculated - edge;
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

    let payPoolPointsInfo = [true, costCalculated, edge, pool];
    return payPoolPointsInfo;
  }

  async regainPoolPoints(cost, pool, teen) {
    const pools = teen ? this.system.teen.pools : this.system.pools;
    const prefix = teen ? "system.teen.pools" : "system.pools";
    pool = pool.toLowerCase();

    // Return points
    if (pools[pool] !== undefined) {
      this.update({ [`${prefix}.${pool}.value`]: pools[pool].value + cost });
    }

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: chatCardRegainPoints(this, cost, pool, teen)
    });
  }

  useRecoveries(spell) {
    if (!spell) spell = false;
    let recoveries = this.system.combat.recoveries;
    let additionalRecoveries = this.system.settings.combat;
    let recoveryUsed = "";

    if (!recoveries.oneAction && additionalRecoveries.numberOneActionRecoveries >= 1) {
      this.update({ "system.combat.recoveries.oneAction": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction2 && additionalRecoveries.numberOneActionRecoveries >= 2) {
      this.update({ "system.combat.recoveries.oneAction2": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction3 && additionalRecoveries.numberOneActionRecoveries >= 3) {
      this.update({ "system.combat.recoveries.oneAction3": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction4 && additionalRecoveries.numberOneActionRecoveries >= 4) {
      this.update({ "system.combat.recoveries.oneAction4": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction5 && additionalRecoveries.numberOneActionRecoveries >= 5) {
      this.update({ "system.combat.recoveries.oneAction5": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction6 && additionalRecoveries.numberOneActionRecoveries >= 6) {
      this.update({ "system.combat.recoveries.oneAction6": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.oneAction7 && additionalRecoveries.numberOneActionRecoveries >= 7) {
      this.update({ "system.combat.recoveries.oneAction7": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
    } else if (!recoveries.tenMinutes && additionalRecoveries.numberTenMinuteRecoveries >= 1) {
      this.update({ "system.combat.recoveries.tenMinutes": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
    } else if (!recoveries.tenMinutes2 && additionalRecoveries.numberTenMinuteRecoveries >= 2) {
      this.update({ "system.combat.recoveries.tenMinutes2": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
    } else if (!recoveries.oneHour) {
      this.update({ "system.combat.recoveries.oneHour": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneHour");
    } else if (!recoveries.tenHours && !spell) {
      this.update({ "system.combat.recoveries.tenHours": true });
      recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenHours");
    } else {
      ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoRecoveriesLeft", { name: this.name }));
      return;
    }
    return recoveryUsed;
  }

  get isExclusiveTagActive() {
    const item = this.items.find(item => item.type === "tag" && item.system.exclusive && item.system.active);
    return item?.name || "";
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
    if (selectedActorId) {
      if (!game.user.isGM) {
        game.socket.emit('system.cyphersystem', { operation: 'giveAdditionalXP', selectedActorId: selectedActorId, modifier: modifier });
        game.socket.emit('system.cyphersystem', { operation: 'deleteChatMessage', messageId: messageId });
      } else {
        giveAdditionalXP({ selectedActorId: selectedActorId, modifier: modifier });
        deleteChatMessage({ messageId: messageId });
      }
    } else {
      if (!game.user.isGM) {
        game.socket.emit('system.cyphersystem', { operation: 'deleteChatMessage', messageId: messageId });
      } else {
        deleteChatMessage({ messageId: messageId });
      }
    }

    let content = (modifier == 1) ? chatCardIntrusionAccepted(this, selectedActorId) : chatCardIntrusionRefused(this, selectedActorId);

    ChatMessage.create({
      content: content
    });
  }

  async enableMultiRoll(data) {
    let pool = this.system.pools;

    let oldEffortModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.effort") || 0;
    let oldMightEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") || 0;
    let oldSpeedEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") || 0;
    let oldIntellectEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") || 0;

    let mightCost = (data.pool == "Might") ? data.summaryTotalCostArray[2] : 0;
    let speedCost = (data.pool == "Speed") ? data.summaryTotalCostArray[2] : 0;
    let intellectCost = (data.pool == "Intellect") ? data.summaryTotalCostArray[2] : 0;

    let effortModifier = data.totalEffort * -1;
    let mightEdgeModifier = Math.min(this.system.pools.might.edge, mightCost) * -1;
    let speedEdgeModifier = Math.min(this.system.pools.speed.edge, speedCost) * -1;
    let intellectEdgeModifier = Math.min(this.system.pools.intellect.edge, intellectCost) * -1;

    await this.update({
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

    let oldEffortModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.effort") || 0;
    let oldMightEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") || 0;
    let oldSpeedEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") || 0;
    let oldIntellectEdgeModifier = this.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") || 0;

    await this.update({
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
