/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetCommunity extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "community"],
      template: "systems/cyphersystem/templates/actor-sheets/community-sheet.html",
      width: 650,
      height: 700,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".editor-content"]
    });
  }

  /**
  * Additional event listeners for Community sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    html.find('.increase-infrastructure').click(() => this.increaseField("system.pools.infrastructure.value") );
    html.find('.decrease-infrastructure').click(() => this.decreaseField("system.pools.infrastructure.value") );
    html.find('.reset-infrastructure').click(() => this.resetField("system.pools.infrastructure") );
  }
}
