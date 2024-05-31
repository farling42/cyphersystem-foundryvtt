/**
* Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
* @extends {Actor}
*/
export class CypherItem extends Item {
  static LOG_V10_COMPATIBILITY_WARNINGS = true;

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
