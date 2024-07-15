/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import { getBackgroundIcon, getBackgroundIconOpacity, getBackgroundIconPath, 
  getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath 
} from "../forms/sheet-customization.js";
import { byNameAscending } from "../utilities/sorting.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      width: 575,
      height: 675,
      resizable: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item-sheets";
    const itemType = this.item.type;
    return `${path}/${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData();

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isObserver = !this.options.editable;
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    data.sheetSettings.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    data.sheetSettings.identified = this.item.system.basic?.identified;
    data.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") === 1) ? "tinymce" : "prosemirror";
    data.sheetSettings.isMaskForm = !this.item.system.isTeen;

    // Enriched HTML
    data.enrichedHTML = {};
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, { secrets: this.item.isOwner, relativeTo: this.item });

    data.actor = data.item.parent;
    data.sortingOptions = {};

    // Tag & recursion lists
    data.itemLists = {};
    if (data.actor) {
      const tags1 = [];
      const tags2 = [];
      const tags3 = [];
      const tags4 = [];
      const recursions = [];
      const tagsOnItem = this.item.flags.cyphersystem?.tags || [];
      const recursionsOnItem = this.item.flags.cyphersystem?.recursions || [];

      for (const item of data.actor.items) {
        if (item.type === "tag") {
          switch (item.system.settings.general.sorting) {
            case "Tag":      tags1.push(item); break;
            case "TagTwo":   tags2.push(item); break;
            case "TagThree": tags3.push(item); break;
            case "TagFour":  tags4.push(item); break;
          }
        }
        else if (item.type === "recursion") {
          recursions.push(item);
        }
      }

      recursions.sort(byNameAscending);
      tags1.sort(byNameAscending);
      tags2.sort(byNameAscending);
      tags3.sort(byNameAscending);
      tags4.sort(byNameAscending);

      data.itemLists.recursions = recursions;
      data.itemLists.recursionsOnItem = recursionsOnItem;
      data.itemLists.tags1 = tags1;
      data.itemLists.tags2 = tags2;
      data.itemLists.tags3 = tags3;
      data.itemLists.tags4 = tags4;
      data.itemLists.tagsOnItem = tagsOnItem;

      // Check for tags categories
      data.sheetSettings.showTags2 = (tags2.length > 0);
      data.sheetSettings.showTags3 = (tags3.length > 0);
      data.sheetSettings.showTags4 = (tags4.length > 0);

      data.sheetSettings.Tags1Label = data.actor.system.settings.general.tags?.labelCategory1 || game.i18n.localize('CYPHERSYSTEM.Tags');
      data.sheetSettings.Tags2Label = data.actor.system.settings.general.tags?.labelCategory2 || game.i18n.localize('CYPHERSYSTEM.TagsCategoryTwo');
      data.sheetSettings.Tags3Label = data.actor.system.settings.general.tags?.labelCategory3 || game.i18n.localize('CYPHERSYSTEM.TagsCategoryThree');
      data.sheetSettings.Tags4Label = data.actor.system.settings.general.tags?.labelCategory4 || game.i18n.localize('CYPHERSYSTEM.TagssCategoryFour');

      // Sorting
      if (data.item.type === 'ability') {
        data.sortingOptions.Ability = data.actor.system.settings.abilities.labelCategory1 || game.i18n.localize('CYPHERSYSTEM.Abilities');
        if (data.actor.system.settings.abilities.labelCategory2) data.sortingOptions.AbilityTwo   = data.actor.system.settings.abilities.labelCategory2;
        if (data.actor.system.settings.abilities.labelCategory3) data.sortingOptions.AbilityThree = data.actor.system.settings.abilities.labelCategory3;
        if (data.actor.system.settings.abilities.labelCategory4) data.sortingOptions.AbilityFour  = data.actor.system.settings.abilities.labelCategory4;
        data.sortingOptions.Spell = data.actor.system.settings.abilities.nameSpells ?? game.i18n.localize('CYPHERSYSTEM.Spells');
      } else if (data.item.type === 'equipment') {
        data.sortingOptions.Equipment = data.actor.system.settings.equipment.labelCategory1 || game.i18n.localize('CYPHERSYSTEM.Equipment');
        if (data.actor.system.settings.equipment.labelCategory2) data.sortingOptions.EquipmentTwo   = data.actor.system.settings.equipment.labelCategory2;
        if (data.actor.system.settings.equipment.labelCategory3) data.sortingOptions.EquipmentThree = data.actor.system.settings.equipment.labelCategory3;
        if (data.actor.system.settings.equipment.labelCategory4) data.sortingOptions.EquipmentFour  = data.actor.system.settings.equipment.labelCategory4;
      } else if (data.item.type === 'skill') {
        data.sortingOptions.Skill = data.actor.system.settings.skills.labelCategory1 || game.i18n.localize('CYPHERSYSTEM.Skills');
        if (data.actor.system.settings.skills.labelCategory2) data.sortingOptions.SkillTwo   = data.actor.system.settings.skills.labelCategory2
        if (data.actor.system.settings.skills.labelCategory3) data.sortingOptions.SkillThree = data.actor.system.settings.skills.labelCategory3
        if (data.actor.system.settings.skills.labelCategory4) data.sortingOptions.SkillFour  = data.actor.system.settings.skills.labelCategory4
      } else if (data.item.type === 'tag') {
        data.sortingOptions.Tag = data.actor.system.settings.general.tags.labelCategory1 || game.i18n.localize('CYPHERSYSTEM.Tags');
        if (data.actor.system.settings.general.tags.labelCategory2) data.sortingOptions.TagTwo   = data.actor.system.settings.general.tags.labelCategory2
        if (data.actor.system.settings.general.tags.labelCategory3) data.sortingOptions.TagThree = data.actor.system.settings.general.tags.labelCategory3
        if (data.actor.system.settings.general.tags.labelCategory4) data.sortingOptions.TagFour  = data.actor.system.settings.general.tags.labelCategory4
      }
    }

    // Sheet customizations
    // -- Get root css variables
    let root = document.querySelector(':root');

    // -- Sheet settings
    data.sheetSettings.backgroundImageBaseSetting = "background-image";

    data.sheetSettings.backgroundImage = getBackgroundImage();
    if (data.sheetSettings.backgroundImage === "custom") {
      data.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
      data.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
    }
    data.sheetSettings.backgroundIcon = getBackgroundIcon();
    data.sheetSettings.backgroundIconPath = "/" + getBackgroundIconPath();
    data.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();

    if (data.sheetSettings.backgroundIcon === "custom") {
      if (!data.sheetSettings.backgroundIconPath) {
        data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-transparent.webp";
      }
    } else {
      data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-" + getBackgroundIcon() + ".svg";
    }

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.identify-item').click(() => {
      this.item.update({ "system.basic.identified": !this.item.system.basic.identified });
    });

    async function addItem(actor, itemData, message) {
      if (actor && itemData) {
        await Item.create(itemData, {parent: actor});
        ui.notifications.info(game.i18n.format(message, { item: itemData.name }));
      }
    }

    html.find('.copy-as-skill').click(() => addItem(this.item.actor, this.item.system.toSkill?.(), "CYPHERSYSTEM.ItemCreatedAsSkill") );
    html.find('.copy-as-attack').click(() => addItem(this.item.actor, this.item.system.toAttack?.(), "CYPHERSYSTEM.ItemCreatedAsAttack") );
    html.find('.copy-as-equipment').click(() => addItem(this.item.actor, this.item.system.toEquipment?.(), "CYPHERSYSTEM.ItemCreatedAsEquipment") );
    html.find('.copy-as-armor').click(() => addItem(this.item.actor, this.item.system.toArmor?.(), "CYPHERSYSTEM.ItemCreatedAsArmor") );

    html.find('.tag-items').click(async ev => {
      const item = this.item;
      const tag = this.item.actor.items.get(ev.currentTarget.dataset.itemId);

      if (tag.type === "tag") {
        let array = item.flags.cyphersystem?.tags ?? [];
        await addOrRemoveFromArray(array);
        await item.update({
          "flags.cyphersystem.tags": array,
          "system.archived": !isActiveTag(array)
        });
      } else if (tag.type === "recursion") {
        const array = item.flags.cyphersystem?.recursions ?? [];
        await addOrRemoveFromArray(array);
        await item.update({
          "flags.cyphersystem.recursions": array,
          "system.archived": !isActiveTag(array)
        });
      }
      this.render(true);

      async function addOrRemoveFromArray(array) {
        const index = array.indexOf(tag._id);
        if (index > -1)
          array.splice(index, 1);
        else
          array.push(tag._id);
      }

      function isActiveTag(array) {
        // Do nothing if it’s the last tag
        if (!array.length) return !item.system.archived;

        // Collect all active tags of the actor
        // Check if any of the enabled tags on the item is an active tag on the actor
        // Return whether a tag has been found
        return item.actor.items.some(tag => (tag.type === "tag" || tag.type === "recursion") && tag.system.active && array.includes(tag._id))
      }
    });
  }

  /**
  * Support for TinyMCE dynamic size
  */

  async activateEditor(name, options = {}, initialContent = "") {
    options.fitToSize = true;
    const editor = await super.activateEditor(name, options, initialContent);
    this.form.querySelector('[role="application"]')?.style.removeProperty("height");
    return editor;
  }
}
