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

    // Increase Quantity
    html.find('.increase-quantity').click(clickEvent => {
      this.increaseField("system.pools.quantity.value")
    });

    // Decrease Quantity
    html.find('.decrease-quantity').click(clickEvent => {
      this.decreaseField("system.pools.quantity.value")
    });

    // Reset Quantity
    html.find('.reset-quantity').click(clickEvent => {
      this.resetField("system.pools.quantity")
    });
  }
}
