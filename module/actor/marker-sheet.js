/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetMarker extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "token"],
      template: "systems/cyphersystem/templates/actor-sheets/marker-sheet.html",
      width: 650,
      height: 700,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".items", ".settings", ".editor-content"]
    });
  }

  /**
  * Additional event listeners for Marker sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    html.find('.increase-quantity').click(() => this.increaseField("system.pools.quantity.value") );
    html.find('.decrease-quantity').click(() => this.decreaseField("system.pools.quantity.value") );
    html.find('.reset-quantity').click(() => this.resetField("system.pools.quantity") );
  }
}
