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
    data.sheetSettings.multiRollActive = this.actor.getFlag("cyphersystem", "multiRoll.active");
    data.sheetSettings.multiRollEffort = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.effort") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollMightEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollSpeedEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollIntellectEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.isExclusiveTagActive = this.actor.isExclusiveTagActive;
    const diceTraySettings = ["hidden", "left", "right"];
    data.sheetSettings.diceTray = diceTraySettings[game.settings.get("cyphersystem", "diceTray")];

    data.sheetSettings.disabledStaticStats = (this.actor.getFlag("cyphersystem", "disabledStaticStats") || this.actor.getFlag("cyphersystem", "multiRoll.active")) ? "disabled" : "";

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
    html.find('.plus-one-damage').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage + amount;
      item.update({"system.basic.damage": newValue});
    });

    // Subtract from Lasting Damage
    html.find('.minus-one-damage').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage - amount;
      item.update({"system.basic.damage": newValue});
    });

    // Change Armor Active
    html.find('.armor-active').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      this.toggleField(item, "system.active")
    });

    // Apply damage track to rolls
    html.find('.apply-impaired').click(clickEvent => {
      this.toggleField(this.actor, "system.combat.damageTrack.applyImpaired")
    });

    html.find('.apply-debilitated').click(clickEvent => {
      this.toggleField(this.actor, "system.combat.damageTrack.applyDebilitated")
    });

    html.find('.apply-impaired-teen').click(clickEvent => {
      this.toggleField(this.actor, "system.teen.combat.damageTrack.applyImpaired")
    });

    html.find('.apply-debilitated-teen').click(clickEvent => {
      this.toggleField(this.actor, "system.teen.combat.damageTrack.applyDebilitated")
    });

    /**
    * Pool management
    */
    // Increase Might
    html.find('.increase-might').click(clickEvent => {
      this.increaseField("system.pools.might.value");
    });

    // Decrease Might
    html.find('.decrease-might').click(clickEvent => {
      this.decreaseField("system.pools.might.value");
    });

    // Reset Might
    html.find('.reset-might').click(clickEvent => {
      this.resetField("system.pools.might", 
        (item) => item.system.basic.pool === "Might")
    });

    // Increase Speed
    html.find('.increase-speed').click(clickEvent => {
      this.increaseField("system.pools.speed.value");
    });

    // Decrease Speed
    html.find('.decrease-speed').click(clickEvent => {
      this.decreaseField("system.pools.speed.value");
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
    });

    // Reset Speed
    html.find('.reset-speed').click(clickEvent => {
      this.resetField("system.pools.speed", 
        (item) => item.system.basic.pool === "Speed")
    });

    // Increase Intellect
    html.find('.increase-intellect').click(clickEvent => {
      this.increaseField("system.pools.intellect.value");
    });

    // Decrease Intellect
    html.find('.decrease-intellect').click(clickEvent => {
      this.decreaseField("system.pools.intellect.value");
    });

    // Reset Intellect
    html.find('.reset-intellect').click(clickEvent => {
      this.resetField("system.pools.intellect", 
        (item) => item.system.basic.pool === "Intellect");
    });

    // Increase Additional
    html.find('.increase-additional').click(clickEvent => {
      this.increaseField("system.pools.additional.value");
    });

    // Decrease Additional
    html.find('.decrease-additional').click(clickEvent => {
      this.decreaseField("system.pools.additional.value");
    });

    // Reset Additional Pool
    html.find('.reset-additionalPool').click(clickEvent => {
      this.resetField("system.pools.additional");
    });

    /**
    * Teen pool management
    */
    // Increase Teen Might
    html.find('.increase-teen-might').click(clickEvent => {
      this.increaseField("system.teen.pools.might.value")
    });

    // Decrease Teen Might
    html.find('.decrease-teen-might').click(clickEvent => {
      this.decreaseField("system.teen.pools.might.value")
    });

    // Reset Teen Might
    html.find('.reset-teen-might').click(clickEvent => {
      this.resetField("system.teen.pools.might", 
        (item) => item.system.settings.general.unmaskedForm === "Teen" && item.system.basic.pool === "Might")
    });

    // Increase Teen Speed
    html.find('.increase-teen-speed').click(clickEvent => {
      this.increaseField("system.teen.pools.speed.value")
    });

    // Decrease Teen Speed
    html.find('.decrease-teen-speed').click(clickEvent => {
      this.decreaseField("system.teen.pools.speed.value")
    });

    // Reset Teen Speed
    html.find('.reset-teen-speed').click(clickEvent => {
      this.resetField("system.teen.pools.speed", 
        (item) => item.system.settings.general.unmaskedForm === "Teen" && item.system.basic.pool === "Speed")
    });

    // Increase Teen Intellect
    html.find('.increase-teen-intellect').click(clickEvent => {
      this.increaseField("system.teen.pools.intellect.value")
    });

    // Decrease Teen Intellect
    html.find('.decrease-teen-intellect').click(clickEvent => {
      this.decreaseField("system.teen.pools.intellect.value")
    });

    // Reset Teen Intellect
    html.find('.reset-teen-intellect').click(clickEvent => {
      this.resetField("system.teen.pools.intellect", 
        (item) => item.system.settings.general.unmaskedForm === "Teen" && item.system.basic.pool === "Intellect")
    });

    // Increase Teen Additional
    html.find('.increase-teen-additional').click(clickEvent => {
      this.increaseField("system.teen.pools.additional.value")
    });

    // Decrease Teen Additional
    html.find('.decrease-teen-additional').click(clickEvent => {
      this.decreaseField("system.teen.pools.additional.value")
    });

    // Reset Additional Teen Pool
    html.find('.reset-teen-additionalPool').click(clickEvent => {
      this.resetField("system.teen.pools.additional")
    });

    /**
    * Roll buttons
    */

    // Might roll button
    html.find('.might-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Might"});
    });

    // Speed roll button
    html.find('.speed-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Speed"});
    });

    // Intellect roll button
    html.find('.intellect-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Intellect"});
    });

    // Recovery roll button
    html.find('.recovery-roll').click(clickEvent => {
      recoveryRollMacro(this.actor, "", true);
    });

    // d6 roll button
    html.find('.dice-tray-d6').click(clickEvent => {
      diceRollMacro("d6", this.actor);
    });

    // d10 roll button
    html.find('.dice-tray-d10').click(clickEvent => {
      diceRollMacro("d10", this.actor);
    });

    // d20 roll button
    html.find('.dice-tray-d20').click(clickEvent => {
      diceRollMacro("d20", this.actor);
    });

    // d100 roll button
    html.find('.dice-tray-d100').click(clickEvent => {
      diceRollMacro("d100", this.actor);
    });

    /**
    * General PC functions
    */
    // Increase XP
    html.find('.increase-xp').click(clickEvent => {
      this.increaseField("system.basic.xp")
    });

    // Decrease XP
    html.find('.decrease-xp').click(clickEvent => {
      this.decreaseField("system.basic.xp")
    });

    // Reset Advancements
    html.find('.reset-advancement').click(clickEvent => {
      this.actor.update({
        "system.basic.advancement.stats": false,
        "system.basic.advancement.effort": false,
        "system.basic.advancement.edge": false,
        "system.basic.advancement.skill": false,
        "system.basic.advancement.other": false
      });
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(clickEvent => {
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

    // Disable multi roll
    html.find('.disable-multi-roll').click(clickEvent => {
      this.actor.disableMultiRoll();
    });

    // Toggle Temporary Power Shift
    html.find('.power-shift-temporary').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      this.toggleField(item, "system.basic.temporary")
    });

    // Toggle Favorite
    html.find('.item-favorite').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let newValue = (item.system.favorite) ? false : true;
      item.update({"system.favorite": newValue});
    });
  }
}
