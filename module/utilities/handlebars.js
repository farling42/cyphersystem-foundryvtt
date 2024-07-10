import {byNameAscending} from "./sorting.js";

export async function registerHandlebars() {
  Handlebars.registerHelper("expanded", function (itemID) {
    return game.user.expanded?.[itemID] === true;
  });

  Handlebars.registerHelper("recursion", function (actor, itemID) {
    let item = actor.items.get(itemID);
    let actorRecursion = actor.flags.cyphersystem?.recursion || "";
    let itemRecursion = "@" + item.name.toLowerCase();
    return actorRecursion === itemRecursion;
  });

  Handlebars.registerHelper("sum", function () {
    let sum = 0;
    for (const argument in arguments) {
      if (Number.isInteger(arguments[argument])) sum = sum + arguments[argument];
    }
    return sum;
  });

  Handlebars.registerHelper("enrichedHTMLItems", function (sheetData, type, itemID) {
    if (type === "description") return sheetData.enrichedHTML.itemDescription[itemID];
    if (type === "level") return sheetData.enrichedHTML.itemLevel[itemID];
    if (type === "depletion") return sheetData.enrichedHTML.itemDepletion[itemID];
  });

  Handlebars.registerHelper("schemaChoices", function (doc, datafield) {
    return doc.system.schema.getField(datafield).choices;
  });

  Handlebars.registerHelper("schemaField", function (doc, datafield) {
    return doc.system.schema.getField(datafield);
  });

  Handlebars.registerHelper("tagOnItem", function (array, value) {
    return (Array.isArray(array) && value && array.includes(value)) ? "" : "tag-inactive";
  });

  Handlebars.registerHelper("activeTags", function (actorSheet, tagIDs, recursionIDs) {
    if (!Array.isArray(tagIDs)) tagIDs = [];
    if (!Array.isArray(recursionIDs)) recursionIDs = [];
    let tagArray = [];
    let recursionArray = [];
    let tagOutput = "";
    let recursionOutput = "";
    let isObserver = (actorSheet.sheetSettings.isObserver) ? "disabled" : "";
    const doRecursions = actorSheet.actor.system.settings.general.gameMode === "Strange";

    for (const item of actorSheet.items) {
      if (item.type === "tag" && tagIDs.includes(item._id) && actorSheet.actor.system.settings.general.tags.active) {
        tagArray.push(item);
      } else if (doRecursions && item.type === "recursion" && recursionIDs.includes(item._id)) {
        recursionArray.push(item);
      }
    }

    tagArray.sort(byNameAscending);
    recursionArray.sort(byNameAscending);

    for (const tag of tagArray) {
      let inactive = (!tag.system.active) ? "tag-inactive" : "";
      let exclusive = (tag.system.exclusive) ? "<i class='fas fa-exclamation'></i>" : "";
      let title = game.i18n.format(tag.system.active ? "CYPHERSYSTEM.ArchiveItemsWithTag" : "CYPHERSYSTEM.UnarchiveItemsWithTag", {tag: tag.name});
      tagOutput += `<a class="tag-items toggle-tag ${inactive} ${isObserver}" data-item-id="${tag._id}" title="${title}">${exclusive}<i class="fas fa-hashtag"></i> ${tag.name}</a> `;
    }

    for (const recursion of recursionArray) {
      let inactive = (!recursion.system.active) ? "tag-inactive" : "";
      let title = game.i18n.format("CYPHERSYSTEM.TranslateToRecursion", {recursion: recursion.name});
      recursionOutput += `<a class="tag-items toggle-tag ${inactive} ${isObserver}" data-item-id="${recursion._id}" title="${title}"><i class="fas fa-at"></i> ${recursion.name}</a> `;
    }

    if (recursionOutput) recursionOutput = `<p>${recursionOutput}</p>`;
    if (tagOutput) tagOutput = `<p>${tagOutput}</p>`;

    return recursionOutput + tagOutput;
  });
}