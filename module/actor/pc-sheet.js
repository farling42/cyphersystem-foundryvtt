/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

import {
  recoveryRollMacro,
  diceRollMacro
} from "../macros/macros.js";
import {rollEngineMain} from "../utilities/roll-engine/roll-engine-main.js";

export class CypherActorSheetPC extends CypherActorSheet {

  // Reposition dice tray
  _onResize(event) {
    super._onResize(event);
  };

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "pc"],
      template: "systems/cyphersystem/templates/actor-sheets/pc-sheet.html",
      width: 650,
      height: 750,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".tags", ".editor-content"]
    });
  }

  /**
  * Additional data preparations
  */
  async getData() {
    const data = await super.getData();
    const actorData = data.actor;

    // Sheet settings
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    data.sheetSettings.multiRollActive = this.actor.multiRoll?.active;
    const rollModifiers = data.sheetSettings.multiRollActive ? this.actor.multiRoll?.modifiers : undefined;
    data.sheetSettings.multiRollEffort = rollModifiers?.effort ? "multi-roll-active" : "";
    data.sheetSettings.multiRollMightEdge = rollModifiers?.might?.edge ? "multi-roll-active" : "";
    data.sheetSettings.multiRollSpeedEdge = rollModifiers?.speed?.edge ? "multi-roll-active" : "";
    data.sheetSettings.multiRollIntellectEdge = rollModifiers?.intellect?.edge ? "multi-roll-active" : "";
    data.sheetSettings.isExclusiveTagActive = this.actor.isExclusiveTagActive;
    const diceTraySettings = ["hidden", "left", "right"];
    data.sheetSettings.diceTray = diceTraySettings[game.settings.get("cyphersystem", "diceTray")];

    data.sheetSettings.disabledStaticStats = (this.actor.flags.cyphersystem?.disabledStaticStats || data.sheetSettings.multiRollActive) ? "disabled" : "";

    for (const i of data.items) {
      if (i.type === 'attack') {

        const skillRating = 
          (i.system.basic.skillRating === "Inability") ? -1:
          (i.system.basic.skillRating === "Trained") ? 1:
          (i.system.basic.skillRating === "Specialized") ? 2:
          0;

        // parseInt to correct old error
        let modifiedBy = parseInt(i.system.basic.steps);
        if (i.system.basic.modifier === "hindered") modifiedBy = modifiedBy * -1;

        const totalModifier = skillRating + modifiedBy;

        const totalModified = 
          (totalModifier === 1) ? game.i18n.localize("CYPHERSYSTEM.eased") :
          (totalModifier >= 2) ? game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier}) :
          (totalModifier === -1) ? game.i18n.localize("CYPHERSYSTEM.hindered") :
          (totalModifier <= -2) ? game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)}) :
          "";

        // Assign and return
        if (i.system.totalModified !== totalModified) {
          i.system.totalModified = totalModified;
          this.actor.updateEmbeddedDocuments("Item", [i]);
        }
      }
    }

    // Update armor
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (const piece of data.itemLists.armor) {
      if (piece.system.active && !piece.system.archived) {
        armorTotal = armorTotal + piece.system.basic.rating;
        speedCostTotal = speedCostTotal + piece.system.basic.cost;
      }
    }

    for (const piece of data.itemLists.teenArmor) {
      if (piece.system.active && !piece.system.archived) {
        teenArmorTotal = teenArmorTotal + piece.system.basic.rating;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.system.basic.cost;
      }
    }

    if (this.actor.system.combat.armor.ratingTotal !== armorTotal || 
        this.actor.system.combat.armor.costTotal   !== speedCostTotal || 
        this.actor.system.teen.combat.armor.ratingTotal !== teenArmorTotal || 
        this.actor.system.teen.combat.armor.costTotal   !== teenSpeedCostTotal) {
      this.actor.update({
        "system.combat.armor.ratingTotal": armorTotal,
        "system.combat.armor.costTotal":   speedCostTotal,
        "system.teen.combat.armor.ratingTotal": teenArmorTotal,
        "system.teen.combat.armor.costTotal":   teenSpeedCostTotal
      });
    }

    return data;
  }

  /**
  * Additional event listeners for PC sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    /**
    * Combat tab functions
    */
    // Add to Lasting Damage
    html.find('.plus-one-damage').click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage + amount;
      item.update({"system.basic.damage": newValue});
    });

    // Subtract from Lasting Damage
    html.find('.minus-one-damage').click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage - amount;
      item.update({"system.basic.damage": newValue});
    });

    // Change Armor Active
    html.find('.armor-active').click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      this.toggleField(item, "system.active")
    });

    // Apply damage track to rolls
    html.find('.apply-impaired').click(ev => this.toggleField(this.actor, "system.combat.damageTrack.applyImpaired") );

    html.find('.apply-debilitated').click(ev => this.toggleField(this.actor, "system.combat.damageTrack.applyDebilitated") );

    html.find('.apply-impaired-teen').click(ev => this.toggleField(this.actor, "system.teen.combat.damageTrack.applyImpaired") );

    html.find('.apply-debilitated-teen').click(ev => this.toggleField(this.actor, "system.teen.combat.damageTrack.applyDebilitated") );

    /**
    * Pool management
    */
    html.find('.increase-might').click(ev => this.increaseField("system.pools.might.value") );
    html.find('.decrease-might').click(ev => this.decreaseField("system.pools.might.value") );
    html.find('.reset-might').click(ev => this.resetField("system.pools.might", (item) => item.system.basic.pool === "Might") );

    html.find('.increase-speed').click(ev => this.increaseField("system.pools.speed.value") );
    html.find('.decrease-speed').click(ev => this.decreaseField("system.pools.speed.value") );
    html.find('.reset-speed').click(ev => this.resetField("system.pools.speed", (item) => item.system.basic.pool === "Speed") );

    html.find('.increase-intellect').click(ev => this.increaseField("system.pools.intellect.value") );
    html.find('.decrease-intellect').click(ev => this.decreaseField("system.pools.intellect.value") );
    html.find('.reset-intellect').click(ev => this.resetField("system.pools.intellect", (item) => item.system.basic.pool === "Intellect") );

    html.find('.increase-additional').click(ev => this.increaseField("system.pools.additional.value") );
    html.find('.decrease-additional').click(ev => this.decreaseField("system.pools.additional.value") );
    html.find('.reset-additionalPool').click(ev => this.resetField("system.pools.additional") );

    /**
    * Teen pool management
    */
    html.find('.increase-teen-might').click(ev => this.increaseField("system.teen.pools.might.value") );
    html.find('.decrease-teen-might').click(ev => this.decreaseField("system.teen.pools.might.value") );
    html.find('.reset-teen-might').click(ev => this.resetField("system.teen.pools.might", (item) => item.system.isTeen && item.system.basic.pool === "Might") );

    html.find('.increase-teen-speed').click(ev => this.increaseField("system.teen.pools.speed.value") );
    html.find('.decrease-teen-speed').click(ev => this.decreaseField("system.teen.pools.speed.value") );
    html.find('.reset-teen-speed').click(ev => this.resetField("system.teen.pools.speed", (item) => item.system.isTeen && item.system.basic.pool === "Speed") );

    html.find('.increase-teen-intellect').click(ev => this.increaseField("system.teen.pools.intellect.value") );
    html.find('.decrease-teen-intellect').click(ev =>  this.decreaseField("system.teen.pools.intellect.value") );
    html.find('.reset-teen-intellect').click(ev => this.resetField("system.teen.pools.intellect", (item) => item.system.isTeen && item.system.basic.pool === "Intellect") );

    html.find('.increase-teen-additional').click(ev => this.increaseField("system.teen.pools.additional.value") );
    html.find('.decrease-teen-additional').click(ev => this.decreaseField("system.teen.pools.additional.value") );
    html.find('.reset-teen-additionalPool').click(ev => this.resetField("system.teen.pools.additional") );

    /**
    * Roll buttons
    */

    html.find('.might-roll').click(ev => rollEngineMain({actorUuid: this.actor.uuid, pool: "Might"}) );
    html.find('.speed-roll').click(ev => rollEngineMain({actorUuid: this.actor.uuid, pool: "Speed"}) );
    html.find('.intellect-roll').click(ev => rollEngineMain({actorUuid: this.actor.uuid, pool: "Intellect"}) );
    html.find('.recovery-roll').click(ev => recoveryRollMacro(this.actor, "", true) );
    html.find('.dice-tray-d6').click(ev => diceRollMacro("d6", this.actor) );
    html.find('.dice-tray-d10').click(ev => diceRollMacro("d10", this.actor) );
    html.find('.dice-tray-d20').click(ev => diceRollMacro("d20", this.actor) );
    html.find('.dice-tray-d100').click(ev => diceRollMacro("d100", this.actor) );

    /**
    * General PC functions
    */
    html.find('.increase-xp').click(ev => this.increaseField("system.basic.xp") );
    html.find('.decrease-xp').click(ev => this.decreaseField("system.basic.xp") );
    html.find('.disable-multi-roll').click(ev => this.actor.disableMultiRoll() );
    // Toggle Temporary Power Shift
    html.find('.power-shift-temporary').click(ev => this.toggleField(this.actor.items.get(ithis.temIdFromEvent(ev)), "system.basic.temporary") );

    // Reset Advancements
    html.find('.reset-advancement').click(ev => {
      this.actor.update({
        "system.basic.advancement.stats": false,
        "system.basic.advancement.effort": false,
        "system.basic.advancement.edge": false,
        "system.basic.advancement.skill": false,
        "system.basic.advancement.other": false
      });
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(ev => {
      this.actor.update({
        "system.combat.recoveries.oneAction": false,
        "system.combat.recoveries.oneAction2": false,
        "system.combat.recoveries.oneAction3": false,
        "system.combat.recoveries.oneAction4": false,
        "system.combat.recoveries.oneAction5": false,
        "system.combat.recoveries.oneAction6": false,
        "system.combat.recoveries.oneAction7": false,
        "system.combat.recoveries.tenMinutes": false,
        "system.combat.recoveries.tenMinutes2": false,
        "system.combat.recoveries.oneHour": false,
        "system.combat.recoveries.tenHours": false
      });
    });
  }
}
