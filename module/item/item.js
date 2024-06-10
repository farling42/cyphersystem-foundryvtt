/**
* Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
* @extends {Actor}
*/

import {
  changeTagStats
} from "../utilities/tagging-engine/tagging-engine-computation.js";

export class CypherItem extends Item {

  async _preCreate(data, options, user) {
    super._preCreate(data, options, user);
    if (this.img == "icons/svg/item-bag.svg") {
      this.updateSource({ "img": `systems/cyphersystem/icons/items/${this.type}.svg` });
    };
    if (this.parent?.system.basic.unmaskedForm === "Teen" && ["ability", "armor", "attack", "lasting-damage", "skill"].includes(this.type)) {
      this.updateSource({ "system.settings.general.unmaskedForm": "Teen" });
    };
    if (this.flags.cyphersystem?.tags) {
      this.updateSource({ "flags.cyphersystem.tags": [] });
    };
    if (this.flags.cyphersystem?.recursions) {
      this.updateSource({ "flags.cyphersystem.recursions": [] });
    };
  }

  async _preUpdate(changes, options, user) {
    if (this.actor && (this.type === "tag" || this.type === "recursion") && changes?.system?.settings?.statModifiers && this.system.active) {
      const statModifiers = this.system.settings.statModifiers;
      const changedStatModifiers = changes.system?.settings?.statModifiers;
    
      await changeTagStats(fromUuidSync(this.actor.uuid), {
        mightModifier: (changedStatModifiers?.might?.value - statModifiers.might.value) || 0,
        mightEdgeModifier: (changedStatModifiers?.might?.edge - statModifiers.might.edge) || 0,
        speedModifier: (changedStatModifiers?.speed?.value - statModifiers.speed.value) || 0,
        speedEdgeModifier: (changedStatModifiers?.speed?.edge - statModifiers.speed.edge) || 0,
        intellectModifier: (changedStatModifiers?.intellect?.value - statModifiers.intellect.value) || 0,
        intellectEdgeModifier: (changedStatModifiers?.intellect?.edge - statModifiers.intellect.edge) || 0,
        itemActive: !this.system.active
      });
    }
  }

  async _buildEmbedHTML(config, options) {
    const embed = await super._buildEmbedHTML(config, options);
    if (embed) return embed;
    // As per foundry.js: JournalEntryPage#_embedTextPage
    options = { ...options, _embedDepth: options._embedDepth + 1, relativeTo: this };
    const {
      secrets=options.secrets,
      documents=options.documents,
      links=options.links,
      rolls=options.rolls,
      embeds=options.embeds
    } = config;
    foundry.utils.mergeObject(options, { secrets, documents, links, rolls, embeds });
    const enrichedPage = await TextEditor.enrichHTML(this.system.description, options);
    const container = document.createElement("div");
    container.innerHTML = enrichedPage;
    return container.children;
  }
}
