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
    if (this.img === "icons/svg/item-bag.svg") {
      this.updateSource({ "img": `systems/cyphersystem/icons/items/${this.type}.svg` });
    };
    if (this.parent?.system.isTeen && ["ability", "armor", "attack", "lasting-damage", "skill"].includes(this.type)) {
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
    const allowed = super._preUpdate(changes, options, user);
    if (!allowed) return allowed;

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

    return true;
  }

  /**
   * Generate HTML nodes required for `@Embed` on an Item
   * @param {*} config 
   * @param {*} options 
   * @returns 
   */
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

    let enrichedEmbed;
    const key = "CYPHERSYSTEM.Embed." + this.type + (this.system.basic.cost > 0 ? ".cost" : ".noCost");
    if (game.i18n.has(key)) {
      const data = { 
        uuid: this.uuid, 
        pool: this.system.basic.pool, 
        cost: this.system.basic.cost, 
        description: this.system.description.slice(3)  // strip leading <p>
      }
      enrichedEmbed = await TextEditor.enrichHTML(game.i18n.format(key, data), options);
    } else {
      enrichedEmbed = await TextEditor.enrichHTML(this.system.description, options);
    }
    const container = document.createElement("div");
    container.innerHTML = enrichedEmbed;
    return container.children;
  }
}
