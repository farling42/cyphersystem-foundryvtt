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

    // Increase Infrastructure
    html.find('.increase-infrastructure').click(clickEvent => {
      this.increaseField("system.pools.infrastructure.value")
    });

    // Decrease Infrastructure
    html.find('.decrease-infrastructure').click(clickEvent => {
      this.decreaseField("system.pools.infrastructure.value");
    });

    // Reset Infrastructure
    html.find('.reset-infrastructure').click(clickEvent => {
      this.resetField("system.pools.infrastructure");
    });
  }
}
