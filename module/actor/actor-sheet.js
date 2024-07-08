/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/

import {
  chatCardMarkItemIdentified
} from "../utilities/chat-cards.js";
import {
  itemRollMacro
} from "../macros/macros.js";
import {
  byNameAscending,
  bySkillRating,
  byArchiveStatus,
  byIdentifiedStatus,
  byItemLevel,
  byFavoriteStatus
} from "../utilities/sorting.js";
import { taggingEngineMain } from "../utilities/tagging-engine/tagging-engine-main.js";
import {
  getBackgroundIcon,
  getBackgroundIconOpacity,
  getBackgroundIconPath,
  getBackgroundImage,
  getBackgroundImageOverlayOpacity,
  getBackgroundImagePath,
  getLogoImage,
  getLogoImageOpacity,
  getLogoImagePath
} from "../forms/sheet-customization.js";
import {
  changeTagStats,
  removeTagFromItem
} from "../utilities/tagging-engine/tagging-engine-computation.js";

export class CypherActorSheet extends ActorSheet {

  /** @override */
  async getData() {
    const data = await super.getData();

    // Item Data
    data.itemLists = {};

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isLimited = (this.actor.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED);
    data.sheetSettings.isObserver = (this.actor.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER || this.actor.compendium?.locked);
    data.sheetSettings.slashForFractions = game.settings.get("cyphersystem", "useSlashForFractions") ? "/" : "|";
    data.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") === 1) ? "tinymce" : "prosemirror";

    // Enriched HTML
    data.enrichedHTML = {};

    // --Notes and description
    data.enrichedHTML.notes = await TextEditor.enrichHTML(this.actor.system.notes, { secrets: this.actor.isOwner, relativeTo: this.actor });
    data.enrichedHTML.gmNotes = await TextEditor.enrichHTML(this.actor.system.gmNotes, { secrets: this.actor.isOwner, relativeTo: this.actor });
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.actor.system.description, { secrets: this.actor.isOwner, relativeTo: this.actor });

    data.enrichedHTML.itemDescription = {};
    data.enrichedHTML.itemLevel = {};
    data.enrichedHTML.itemDepletion = {};

    for (const item of this.actor.items) {
      data.enrichedHTML.itemDescription[item.id] = await TextEditor.enrichHTML(item.system.description, { secrets: this.actor.isOwner, relativeTo: item });
      data.enrichedHTML.itemLevel[item.id] = await TextEditor.enrichHTML(item.system.basic?.level, { relativeTo: item });
      data.enrichedHTML.itemDepletion[item.id] = await TextEditor.enrichHTML(item.system.basic?.depletion, { relativeTo: item });
    }

    // Prepare items and return
    this.cyphersystem(data);
    return data;
  }

  /* Generic Field Operations */
  increaseField(name) {
    let amount = game.keyboard.isModifierActive("Alt") ? 10 : 1;
    this.actor.update({ [name]: foundry.utils.getProperty(this.actor, name) + amount });
  }
  decreaseField(name) {
    let amount = game.keyboard.isModifierActive("Alt") ? 10 : 1;
    this.actor.update({ [name]: foundry.utils.getProperty(this.actor, name) - amount });
  }
  resetField(name, lastingFunc) {
    let lastingDamage = 0;
    if (lastingFunc) {
      const checkItem = (accumulator, item) => {
        if (item.type === "lasting-damage" && !item.system.archived && lastingFunc(item))
          accumulator += item.system.basic.damage;
        return accumulator;
      };
      lastingDamage = this.actor.items.reduce(checkItem, 0);
    }
    this.actor.update({ [`${name}.value`]: foundry.utils.getProperty(this.actor, `${name}.max`) - lastingDamage });
  }
  toggleField(doc, name) {
    doc.update({ [name]: !foundry.utils.getProperty(doc, name) });
  }

  itemIdFromEvent(event) {
    return event.currentTarget.closest(".item").dataset.itemId;
  }
  /**
  * Organize and classify Items for Character sheets.
  *
  * @param {Object} actorData The actor to prepare.
  *
  * @return {undefined}
  */
  cyphersystem(data) {
    const actorData = data.actor;
    const itemLists = data.itemLists;

    // Initialize containers
    const equipment = [];
    const equipmentTwo = [];
    const equipmentThree = [];
    const equipmentFour = [];
    const abilities = [];
    const spells = [];
    const abilitiesTwo = [];
    const abilitiesThree = [];
    const abilitiesFour = [];
    const skills = [];
    const skillsTwo = [];
    const skillsThree = [];
    const skillsFour = [];
    const attacks = [];
    const armor = [];
    const lastingDamage = [];
    const powerShifts = [];
    const cyphers = [];
    const artifacts = [];
    const oddities = [];
    const teenSkills = [];
    const teenAbilities = [];
    const teenAttacks = [];
    const teenArmor = [];
    const teenLastingDamage = [];
    const materials = [];
    const ammo = [];
    const recursions = [];
    const tags = [];
    const tagsTwo = [];
    const tagsThree = [];
    const tagsFour = [];

    // Iterate through items, allocating to containers
    for (const item of data.items) {
      // let item = item.system;
      item.img = item.img || DEFAULT_TOKEN;

      // Don't include hidden items
      if (actorData.system.settings.general.hideArchive && item.system.archived) continue;

      // Check for roll button on level
      if (item.type === "cypher" || item.type === "artifact") {
        item.system.rollForLevel = (Roll.validate(item.system.basic.level.toString()) && item.system.basic.level && isNaN(item.system.basic.level))
      }

      // Append to containers
      switch (item.type) {
        case "equipment":
          if (this.actor.type !== "pc")
            equipment.push(item);
          else
            switch (item.system.settings.general.sorting) {
              case "Equipment": equipment.push(item); break;
              case "EquipmentTwo": equipmentTwo.push(item); break;
              case "EquipmentThree": equipmentThree.push(item); break;
              case "EquipmentFour": equipmentFour.push(item); break;
            }
          break;

        case "ammo":
          ammo.push(item);
          break;

        case "ability":
          if (this.actor.type !== "pc")
            abilities.push(item);
          else if (item.system.isTeen)
            teenAbilities.push(item);
          else
            switch (item.system.settings.general.sorting) {
              case "Ability": abilities.push(item); break;
              case "AbilityTwo": abilitiesTwo.push(item); break;
              case "AbilityThree": abilitiesThree.push(item); break;
              case "AbilityFour": abilitiesFour.push(item); break;
              case "Spell": spells.push(item); break;
            }
          break;

        case "skill":
          if (this.actor.type !== "pc")
            skills.push(item);
          else if (item.system.isTeen)
            teenSkills.push(item);
          else
            switch (item.system.settings.general.sorting) {
              case "Skill": skills.push(item); break;
              case "SkillTwo": skillsTwo.push(item); break;
              case "SkillThree": skillsThree.push(item); break;
              case "SkillFour": skillsFour.push(item); break;
            }
          break;

        case "attack":
          if (item.system.isTeen)
            teenAttacks.push(item);
          else
            attacks.push(item);
          break;

        case "armor":
          if (item.system.isTeen)
            teenArmor.push(item);
          else
            armor.push(item);
          break;

        case "lasting-damage":
          if (item.system.isTeen)
            teenLastingDamage.push(item);
          else
            lastingDamage.push(item);
          break;

        case "power-shift":
          powerShifts.push(item);
          break;

        case "cypher":
          cyphers.push(item);
          break;

        case "artifact":
          artifacts.push(item);
          break;

        case "oddity":
          oddities.push(item);
          break;

        case "material":
          materials.push(item);
          break;

        case "recursion":
          recursions.push(item);
          break;

        case "tag":
          switch (item.system.settings.general.sorting) {
            case "Tag": tags.push(item); break;
            case "TagTwo": tagsTwo.push(item); break;
            case "TagThree": tagsThree.push(item); break;
            case "TagFour": tagsFour.push(item); break;
          }
          break;
      } // switch (item.type)
    } // for (const item of data.items)

    // Sort by name
    equipment.sort(byNameAscending);
    equipmentTwo.sort(byNameAscending);
    equipmentThree.sort(byNameAscending);
    equipmentFour.sort(byNameAscending);
    abilities.sort(byNameAscending);
    abilitiesTwo.sort(byNameAscending);
    abilitiesThree.sort(byNameAscending);
    abilitiesFour.sort(byNameAscending);
    spells.sort(byNameAscending);
    skills.sort(byNameAscending);
    skillsTwo.sort(byNameAscending);
    skillsThree.sort(byNameAscending);
    skillsFour.sort(byNameAscending);
    attacks.sort(byNameAscending);
    armor.sort(byNameAscending);
    lastingDamage.sort(byNameAscending);
    powerShifts.sort(byNameAscending);
    cyphers.sort(byNameAscending);
    artifacts.sort(byNameAscending);
    oddities.sort(byNameAscending);
    teenSkills.sort(byNameAscending);
    teenAbilities.sort(byNameAscending);
    teenAttacks.sort(byNameAscending);
    teenArmor.sort(byNameAscending);
    teenLastingDamage.sort(byNameAscending);
    materials.sort(byNameAscending);
    ammo.sort(byNameAscending);
    recursions.sort(byNameAscending);
    tags.sort(byNameAscending);
    tagsTwo.sort(byNameAscending);
    tagsThree.sort(byNameAscending);
    tagsFour.sort(byNameAscending);

    // Sort by skill rating
    if ((this.actor.type === "pc" || this.actor.type === "companion") &&
      actorData.system.settings.skills.sortByRating) {
      // Has already been sorted by ascending name.
      skills.sort(bySkillRating);
      skillsTwo.sort(bySkillRating);
      skillsThree.sort(bySkillRating);
      skillsFour.sort(bySkillRating);
      teenSkills.sort(bySkillRating);
    } else {

    }

    // Sort my material level
    if (this.actor.type === "pc" &&
      actorData.system.settings.equipment.materials.sortByLevel) {
      materials.sort(byItemLevel);
    }

    // Sort by identified status
    cyphers.sort(byIdentifiedStatus);
    artifacts.sort(byIdentifiedStatus);

    // Sort by favorite status
    equipment.sort(byFavoriteStatus);
    equipmentTwo.sort(byFavoriteStatus);
    equipmentThree.sort(byFavoriteStatus);
    equipmentFour.sort(byFavoriteStatus);
    abilities.sort(byFavoriteStatus);
    abilitiesTwo.sort(byFavoriteStatus);
    abilitiesThree.sort(byFavoriteStatus);
    abilitiesFour.sort(byFavoriteStatus);
    spells.sort(byFavoriteStatus);
    skills.sort(byFavoriteStatus);
    skillsTwo.sort(byFavoriteStatus);
    skillsThree.sort(byFavoriteStatus);
    skillsFour.sort(byFavoriteStatus);
    attacks.sort(byFavoriteStatus);
    armor.sort(byFavoriteStatus);
    lastingDamage.sort(byFavoriteStatus);
    powerShifts.sort(byFavoriteStatus);
    cyphers.sort(byFavoriteStatus);
    artifacts.sort(byFavoriteStatus);
    oddities.sort(byFavoriteStatus);
    teenSkills.sort(byFavoriteStatus);
    teenAbilities.sort(byFavoriteStatus);
    teenAttacks.sort(byFavoriteStatus);
    teenArmor.sort(byFavoriteStatus);
    teenLastingDamage.sort(byFavoriteStatus);
    materials.sort(byFavoriteStatus);
    ammo.sort(byFavoriteStatus);
    recursions.sort(byFavoriteStatus);
    tags.sort(byFavoriteStatus);
    tagsTwo.sort(byFavoriteStatus);
    tagsThree.sort(byFavoriteStatus);
    tagsFour.sort(byFavoriteStatus);

    // Sort by archive status
    equipment.sort(byArchiveStatus);
    equipmentTwo.sort(byArchiveStatus);
    equipmentThree.sort(byArchiveStatus);
    equipmentFour.sort(byArchiveStatus);
    abilities.sort(byArchiveStatus);
    abilitiesTwo.sort(byArchiveStatus);
    abilitiesThree.sort(byArchiveStatus);
    abilitiesFour.sort(byArchiveStatus);
    spells.sort(byArchiveStatus);
    skills.sort(byArchiveStatus);
    skillsTwo.sort(byArchiveStatus);
    skillsThree.sort(byArchiveStatus);
    skillsFour.sort(byArchiveStatus);
    attacks.sort(byArchiveStatus);
    armor.sort(byArchiveStatus);
    lastingDamage.sort(byArchiveStatus);
    powerShifts.sort(byArchiveStatus);
    cyphers.sort(byArchiveStatus);
    artifacts.sort(byArchiveStatus);
    oddities.sort(byArchiveStatus);
    teenSkills.sort(byArchiveStatus);
    teenAbilities.sort(byArchiveStatus);
    teenAttacks.sort(byArchiveStatus);
    teenArmor.sort(byArchiveStatus);
    teenLastingDamage.sort(byArchiveStatus);
    materials.sort(byArchiveStatus);
    ammo.sort(byArchiveStatus);
    recursions.sort(byArchiveStatus);
    tags.sort(byArchiveStatus);
    tagsTwo.sort(byArchiveStatus);
    tagsThree.sort(byArchiveStatus);
    tagsFour.sort(byArchiveStatus);

    // Show item categories on PCs
    if (this.actor.type === "pc") {
      const alwaysShow = !this.actor.system.settings.general.hideEmptyCategories;
      const settings = this.actor.system.settings;

      // Check for equipment category 2
      data.sheetSettings.showEquipmentTwo = (equipmentTwo.length > 0 || (settings.equipment.labelCategory2 && alwaysShow));

      // Check for equipment category 3
      data.sheetSettings.showEquipmentThree = (equipmentThree.length > 0 || (settings.equipment.labelCategory3 && alwaysShow));

      // Check for equipment category 4
      data.sheetSettings.showEquipmentFour = (equipmentFour.length > 0 || (settings.equipment.labelCategory4 && alwaysShow));

      // Check for spells
      data.sheetSettings.showSpells = (spells.length > 0 || (settings.abilities.labelSpells && alwaysShow))

      // Check for ability category 2
      data.sheetSettings.showAbilitiesTwo = (abilitiesTwo.length > 0 || (settings.abilities.labelCategory2 && alwaysShow))

      // Check for ability category 3
      data.sheetSettings.showAbilitiesThree = (abilitiesThree.length > 0 || (settings.abilities.labelCategory3 && alwaysShow))

      // Check for ability category 4
      data.sheetSettings.showAbilitiesFour = (abilitiesFour.length > 0 || (settings.abilities.labelCategory4 && alwaysShow))

      // Check for skill category 2
      data.sheetSettings.showSkillsTwo = (skillsTwo.length > 0 || (settings.skills.labelCategory2 && alwaysShow))

      // Check for skill category 3
      data.sheetSettings.showSkillsThree = (skillsThree.length > 0 || (settings.skills.labelCategory3 && alwaysShow))

      // Check for skill category 4
      data.sheetSettings.showSkillsFour = (skillsFour.length > 0 || (settings.skills.labelCategory4 && alwaysShow))

      // Check for tags category 2
      data.sheetSettings.showTagsTwo = (tagsTwo.length > 0 || (settings.general.tags?.labelCategory2 && alwaysShow))

      // Check for tags category 3
      data.sheetSettings.showTagsThree = (tagsThree.length > 0 || (settings.general.tags?.labelCategory3 && alwaysShow))

      // Check for tags category 4
      data.sheetSettings.showTagsFour = (tagsFour.length > 0 || (settings.general.tags?.labelCategory4 && alwaysShow))
    }

    // Assign and return
    itemLists.equipment = equipment;
    itemLists.equipmentTwo = equipmentTwo;
    itemLists.equipmentThree = equipmentThree;
    itemLists.equipmentFour = equipmentFour;
    itemLists.abilities = abilities;
    itemLists.abilitiesTwo = abilitiesTwo;
    itemLists.abilitiesThree = abilitiesThree;
    itemLists.abilitiesFour = abilitiesFour;
    itemLists.spells = spells;
    itemLists.skills = skills;
    itemLists.skillsTwo = skillsTwo;
    itemLists.skillsThree = skillsThree;
    itemLists.skillsFour = skillsFour;
    itemLists.attacks = attacks;
    itemLists.armor = armor;
    itemLists.lastingDamage = lastingDamage;
    itemLists.powerShifts = powerShifts;
    itemLists.cyphers = cyphers;
    itemLists.artifacts = artifacts;
    itemLists.oddities = oddities;
    itemLists.teenSkills = teenSkills;
    itemLists.teenAbilities = teenAbilities;
    itemLists.teenAttacks = teenAttacks;
    itemLists.teenArmor = teenArmor;
    itemLists.teenLastingDamage = teenLastingDamage;
    itemLists.materials = materials;
    itemLists.ammo = ammo;
    itemLists.recursions = recursions;
    itemLists.tags = tags;
    itemLists.tagsTwo = tagsTwo;
    itemLists.tagsThree = tagsThree;
    itemLists.tagsFour = tagsFour;

    // Sheet customizations
    // Get root css variables
    let root = document.querySelector(':root');

    let teenCustomSheetDesign = (this.actor.type === "pc" && actorData.system.teen.settings.general.customSheetDesign);
    let customSheetDesign = (this.actor.type === "pc" && actorData.system.settings.general.customSheetDesign);

    if (game.modules.get("cyphersheets")?.active) {
      data.sheetSettings.backgroundImage = "foundry";
      data.sheetSettings.backgroundIcon = "none";
      data.sheetSettings.cyphersheetsModuleActive = true;
      data.sheetSettings.backgroundImageBaseSetting = "";
    } else {
      customBackgroundData();
    }

    function customBackgroundData() {
      // Sheet settings
      data.sheetSettings.cyphersheetsModuleActive = false;
      data.sheetSettings.backgroundImageBaseSetting = "background-image";

      // Create image & icon
      if (actorData.system.isTeen && teenCustomSheetDesign) {
        data.sheetSettings.backgroundImage = actorData.system.teen.settings.general.background.image;
        data.sheetSettings.backgroundIcon = actorData.system.teen.settings.general.background.icon;
        if (actorData.system.teen.settings.general.background.image === "custom") {
          data.sheetSettings.backgroundImagePath = "/" + actorData.system.teen.settings.general.background.imagePath;
          data.sheetSettings.backgroundOverlayOpacity = actorData.system.teen.settings.general.background.overlayOpacity;
        }
        if (actorData.system.teen.settings.general.background.icon === "custom") {
          data.sheetSettings.backgroundIconPath = actorData.system.teen.settings.general.background.iconPath ?? "systems/cyphersystem/icons/background/icon-transparent.webp";
          data.sheetSettings.backgroundIconOpacity = actorData.system.teen.settings.general.background.iconOpacity;
        } else {
          data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-" + actorData.system.teen.settings.general.background.icon + ".svg";
        }
      } else if (!actorData.system.isTeen && customSheetDesign) {
        data.sheetSettings.backgroundImage = actorData.system.settings.general.background.image;
        data.sheetSettings.backgroundIcon = actorData.system.settings.general.background.icon;
        if (actorData.system.settings.general.background.image === "custom") {
          data.sheetSettings.backgroundImagePath = "/" + actorData.system.settings.general.background.imagePath;
          data.sheetSettings.backgroundOverlayOpacity = actorData.system.settings.general.background.overlayOpacity;
        }
        if (actorData.system.settings.general.background.icon === "custom") {
          data.sheetSettings.backgroundIconPath = actorData.system.settings.general.background.iconPath ?? "systems/cyphersystem/icons/background/icon-transparent.webp";
          data.sheetSettings.backgroundIconOpacity = actorData.system.settings.general.background.iconOpacity;
        } else {
          data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-" + actorData.system.settings.general.background.icon + ".svg";
        }
      } else {
        data.sheetSettings.backgroundImage = getBackgroundImage();
        data.sheetSettings.backgroundIcon = getBackgroundIcon();
        data.sheetSettings.backgroundIconPath = getBackgroundIconPath();
        if (data.sheetSettings.backgroundImage === "custom") {
          data.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
          data.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
        }
        if (data.sheetSettings.backgroundIcon === "custom") {
          if (!data.sheetSettings.backgroundIconPath) {
            data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-transparent.webp";
          }
          data.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();
        } else {
          data.sheetSettings.backgroundIconPath = "systems/cyphersystem/icons/background/icon-" + data.sheetSettings.backgroundIcon + ".svg";
        }
      }
    }

    // Create logo
    if (actorData.system.isTeen && teenCustomSheetDesign) {
      data.sheetSettings.logoImage = actorData.system.teen.settings.general.logo.image;
      if (actorData.system.teen.settings.general.logo.image === "custom") {
        data.sheetSettings.logoPath = actorData.system.teen.settings.general.logo.imagePath ?? "systems/cyphersystem/icons/background/icon-transparent.webp";
        data.sheetSettings.logoImageOpacity = actorData.system.teen.settings.general.logo.imageOpacity;
      } else {
        data.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + actorData.system.teen.settings.general.logo.image + ".webp";
      }
    } else if (!actorData.system.isTeen && customSheetDesign) {
      data.sheetSettings.logoImage = actorData.system.settings.general.logo.image;
      if (actorData.system.settings.general.logo.image === "custom") {
        data.sheetSettings.logoPath = actorData.system.settings.general.logo.imagePath ?? "systems/cyphersystem/icons/background/icon-transparent.webp";
        data.sheetSettings.logoImageOpacity = actorData.system.settings.general.logo.imageOpacity;
      } else {
        data.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + actorData.system.settings.general.logo.image + ".webp";
      }
    } else {
      data.sheetSettings.logoImage = getLogoImage();
      data.sheetSettings.logoPath = getLogoImagePath();
      data.sheetSettings.logoImageOpacity = getLogoImageOpacity();
      if (data.sheetSettings.logoImage !== "custom")
        data.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + data.sheetSettings.logoImage + ".webp";
      else if (!data.sheetSettings.logoPath)
        data.sheetSettings.logoPath = "systems/cyphersystem/icons/background/icon-transparent.webp";
    }
  }

  /**
  * Event Listeners
  */

  /** @override */
  async activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-description").click(ev => {
      if (game.keyboard.isModifierActive("Alt")) return;
      const itemID = this.itemIdFromEvent(ev);

      if (game.user.expanded === undefined) {
        game.user.expanded = {};
      }

      game.user.expanded[itemID] = !game.user.expanded[itemID];
      this._render(false);
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    /**
    * Inventory management
    */

    // Add Inventory Item
    html.find(".item-create").click(ev => {
      const itemCreatedPromise = this._onItemCreate(ev);
      itemCreatedPromise.then(itemData => {
        this.actor.items.get(itemData.id).sheet.render(true);
      });
    });

    // Edit Inventory Item
    html.find(".item-edit").click(ev =>
      this.actor.items.get(this.itemIdFromEvent(ev)).sheet.render(true));

    // Mark Item Identified
    html.find(".identify-item").click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));

      if (game.user.isGM) {
        item.update({ "system.basic.identified": true });
      } else {
        ChatMessage.create({
          content: chatCardMarkItemIdentified(this.actor, item),
          whisper: ChatMessage.getWhisperRecipients("GM"),
          blind: true
        });
      }
    });

    // Delete Inventory Item
    html.find(".item-delete").click(async ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      if (game.keyboard.isModifierActive("Alt")) {
        if (["tag", "recursion"].includes(item.type)) {
          if (item.system.active) {
            await changeTagStats(this.actor, {
              mightModifier: item.system.settings.statModifiers.might.value,
              mightEdgeModifier: item.system.settings.statModifiers.might.edge,
              speedModifier: item.system.settings.statModifiers.speed.value,
              speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
              intellectModifier: item.system.settings.statModifiers.intellect.value,
              intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
              itemActive: item.system.active
            });
          }
          await removeTagFromItem(this.actor, item._id);
        }
        await item.delete();
      } else {
        this.toggleField(item, "system.archived");
      }
    });

    // (Un)Archive tag
    html.find(".toggle-tag").click(ev => {
      const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
      taggingEngineMain(this.actor, {
        item: item,
        macroUuid: item.system.settings.macroUuid,
        statChanges: {
          mightModifier: item.system.settings.statModifiers.might.value,
          mightEdgeModifier: item.system.settings.statModifiers.might.edge,
          speedModifier: item.system.settings.statModifiers.speed.value,
          speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
          intellectModifier: item.system.settings.statModifiers.intellect.value,
          intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
          itemActive: item.system.active
        }
      });
    });

    // Add to Quantity
    html.find(".plus-one").click(ev => {
      // increaseField
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      let amount = (game.keyboard.isModifierActive("Alt")) ? 10 : 1;
      let newValue = item.system.basic.quantity + amount;
      item.update({ "system.basic.quantity": newValue });
    });

    // Subtract from Quantity
    html.find(".minus-one").click(ev => {
      // decreaseField
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      let amount = (game.keyboard.isModifierActive("Alt")) ? 10 : 1;
      let newValue = item.system.basic.quantity - amount;
      item.update({ "system.basic.quantity": newValue });
    });

    // Roll for level
    html.find(".rollForLevel").click(async ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      let roll = await new Roll(item.system.basic.level).evaluate();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker(),
        flavor: game.i18n.format("CYPHERSYSTEM.RollForLevel", { item: item.name })
      });
      item.update({ "system.basic.level": roll.total });
    });

    /**
    * Roll buttons
    */

    // Item roll buttons
    html.find(".item-roll").click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      itemRollMacro(this.actor, item.id, { noRoll: false, macroUuid: item.system.settings.rollButton.macroUuid });
    });

    // Item pay pool points buttons
    html.find(".item-pay").click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));
      itemRollMacro(this.actor, item.id, { noRoll: true, macroUuid: item.system.settings.rollButton.macroUuid });
    });

    // Item cast spell button
    html.find(".cast-spell").click(ev => {
      const item = this.actor.items.get(this.itemIdFromEvent(ev));

      let recoveryUsed = this.actor.useRecoveries(true);
      if (!recoveryUsed) return;

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: game.i18n.format("CYPHERSYSTEM.CastingASpell", {
          name: this.actor.name,
          recoveryUsed: recoveryUsed,
          spellName: item.name
        }),
        flags: { "itemID": item.id }
      });
    });

    /**
    * General sheet functions
    */

    // Toggle item visibility
    $(document).ready(function () {
      const itemFavorite = html.find('.item-favorite.alt');

      if (game.keyboard.isModifierActive("Alt")) {
        itemFavorite.css('visibility', 'visible');
      }

      $(document).keydown(function (event) {
        if (event.altKey) {
          itemFavorite.css('visibility', 'visible');
          itemFavorite.removeAttr('display');
        }
      });

      $(document).keyup(function (event) {
        if (!event.altKey) {
          itemFavorite.css('visibility', 'hidden');
          itemFavorite.attr('display', 'none');
        }
      });
    });

    // Send item description to chat
    html.find(".item-description").click(async (ev) => {
      if (game.keyboard.isModifierActive("Alt")) {
        const item = this.actor.items.get(this.itemIdFromEvent(ev));
        if (item.system.basic.identified === false) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnSentUnidentifiedToChat"));
        let brackets = item.system.chatDetails();
        if (brackets) brackets = " (" + brackets + ")";
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content: await TextEditor.enrichHTML("<strong>" + item.type.capitalize() + ": " + item.name + "</strong>" + brackets +
            `<hr style="margin:3px 0;"><img class="description-image-chat" src="${item.img}" width="50" height="50"/>` +
            item.system.description, { relativeTo: item })
        });
      }
    });

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      // Find all items on the character sheet.
      html.find("li.item").each((i, li) => {
        // Ignore for the header row.
        if (li.classList.contains("item-header")) return;
        if (li.classList.contains("non-draggable")) return;
        if (li.classList.contains("item-settings")) return;
        // Add draggable attribute and dragstart listener.
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    /**
    * Health management for NPCs, Companions, and Communities
    */

    // Increase Health
    html.find(".increase-health").click(() => this.increaseField("system.pools.health.value"));
    html.find(".decrease-health").click(() => this.decreaseField("system.pools.health.value"));
    html.find(".reset-health").click(() => this.resetField("system.pools.health"));
  }

  /**
  * Handle dropping of an item reference or item data onto an Actor Sheet
  * @param {DragEvent} event     The concluding DragEvent which contains drop data
  * @param {Object} data         The data transfer extracted from the event
  * @return {Promise<Object>}    A data object which describes the result of the drop
  * @private
  */
  async _onDropItem(event, data) {
    event.preventDefault();
    // Define item type categories
    const typesCharacterProperties = ["ability", "lasting-damage", "power-shift", "skill", "recursion", "tag"];
    const typesUniqueItems = ["armor", "artifact", "attack", "cypher", "oddity"];
    const typesQuantityItems = ["ammo", "equipment", "material"];

    // Define items & actors
    const originItem = await Item.fromDropData(data);
    let originItemData = foundry.utils.deepClone(originItem.toObject());
    const originActor = originItem.actor;
    const targetActor = this.actor;
    let targetItem = null;

    // Sort item into category
    if (["skill", "ability", "equipment", "tag"].includes(originItemData.type)) {
      originItemData.system.settings.general.sorting = await sortItemsIntoCategories(event, originItemData);
    }

    // Check for duplicate character properties
    for (const item of targetActor.items) {
      if (originItem.type === item.type && originItem.name === item.name) {
        targetItem = item;
      }
    }

    // Define actor IDs
    const originActorID = originActor?.id ?? "";
    const targetActorID = targetActor?.id ?? "";

    // Sort already existing items
    if (originActorID === targetActorID) {
      targetActor.updateEmbeddedDocuments("Item", [originItemData]);
    };

    // Return statements
    if (!targetActor.isOwner) return;
    if (originActorID === targetActorID) return;

    // Handle character properties
    if (typesCharacterProperties.includes(originItem.type)) {
      // Only PCs and Companions can carry character properties
      if (!["pc", "companion"].includes(targetActor.type))
        return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CharacterPropertiesCanOnlySharedAcrossPCs"));

      // Companions can only carry skills and abilities, and not ones for teens
      if (["companion"].includes(targetActor.type) && (!["skill", "ability"].includes(originItem.type) || originItem.system.isTeen))
        return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ItemTypeCannotBeMovedToCompanion"));

      // Tags and recursions are inactive when copied from another source
      if (["recursion", "tag"].includes(originItem.type))
        originItemData.system.active = false;

      // Create Item
      targetActor.createEmbeddedDocuments("Item", [originItemData]);

      // Enable the appropriate list
      enableListForItem();
    }

    // Handle unique items
    if (typesUniqueItems.includes(originItem.type)) {
      if (originActor) {
        let d = new Dialog({
          title: game.i18n.localize("CYPHERSYSTEM.ItemShouldBeArchivedOrDeleted"),
          content: "",
          buttons: {
            move: {
              icon: "<i class='fas fa-archive'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Archive"),
              callback: (html) => archiveItem()
            },
            moveAll: {
              icon: "<i class='fas fa-trash'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Delete"),
              callback: (html) => deleteItem()
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          },
          default: "move",
          close: () => { }
        });
        d.render(true, { width: "auto" });
      } else {
        // Handle cypher & artifact identification from world items
        if (["cypher", "artifact"].includes(originItem.type)) {
          let identifiedStatus = game.settings.get("cyphersystem", "cypherIdentification");
          // 0 = use item's default status
          if (identifiedStatus === 1) {
            originItemData.system.basic.identified = true;
          } else if (identifiedStatus === 2) {
            originItemData.system.basic.identified = false;
          }
        }

        // Create item
        targetActor.createEmbeddedDocuments("Item", [originItemData]);
        enableListForItem();
      }
    }

    // Handle items with quantity
    if (typesQuantityItems.includes(originItem.type)) {
      let maxQuantity = originItem.system.basic.quantity;
      if (maxQuantity <= 0 && maxQuantity !== null) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CannotMoveNotOwnedItem"));
      moveDialog();

      function moveDialog() {
        let d = new Dialog({
          title: game.i18n.format("CYPHERSYSTEM.MoveItem", { name: originItem.name }),
          content: createContent(),
          buttons: createButtons(),
          default: "move",
          close: () => { }
        });
        d.render(true, { width: "auto" });
      }

      function createContent() {
        let maxQuantityText = "";
        if (maxQuantity !== null) maxQuantityText = `&nbsp;&nbsp;${game.i18n.localize("CYPHERSYSTEM.Of")} ${maxQuantity}`;
        let content = `<div align="center"><label style="display: inline-block; width: 98px; text-align: right"><strong>${game.i18n.localize("CYPHERSYSTEM.Quantity")}/${game.i18n.localize("CYPHERSYSTEM.Units")}: </strong></label><input name="quantity" id="quantity" style="width: 75px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="number" value="1" />` + maxQuantityText + `</div>`;
        return content;
      }

      function createButtons() {
        if (maxQuantity === null) {
          return {
            move: {
              icon: "<i class='fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Move"),
              callback: (html) => moveItems(html.find("#quantity").val(), originItem)
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          };
        } else {
          return {
            move: {
              icon: "<i class='fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Move"),
              callback: (html) => moveItems(html.find("#quantity").val(), originItem)
            },
            moveAll: {
              icon: "<i class='fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.MoveAll"),
              callback: (html) => moveItems(maxQuantity, originItem)
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          };
        }
      }

      function moveItems(quantity) {
        quantity = parseInt(quantity) ?? 0;
        if (originActor && (quantity > originItem.system.basic.quantity || quantity <= 0)) {
          moveDialog(quantity);
          return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.CanOnlyMoveCertainAmountOfItems", { max: originItem.system.basic.quantity }));
        }
        if (originActor) {
          originItem.update({ "system.basic.quantity": parseInt(originItem.system.basic.quantity) - quantity });
        }
        if (targetItem) {
          targetItem.update({ "system.basic.quantity": parseInt(targetItem.system.basic.quantity) + quantity });
        } else {
          originItemData.system.basic.quantity = quantity;
          targetActor.createEmbeddedDocuments("Item", [originItemData]);
        }
        enableListForItem();
      }
    }

    async function enableListForItem() {
      switch (originItem.type) {
        case "artifact": targetActor.update({ "system.settings.equipment.artifacts.active": true }); break;
        case "cypher": targetActor.update({ "system.settings.equipment.cyphers.active": true }); break;
        case "oddity": targetActor.update({ "system.settings.equipment.oddities.active": true }); break;
        case "material": targetActor.update({ "system.settings.equipment.materials.active": true }); break;
        case "ammo":
          if (targetActor.type === "pc") targetActor.update({ "system.settings.combat.ammo.active": true });
          else
            targetActor.update({ "system.settings.equipment.ammo.active": true });
          break;
        case "power-shift":
          if (targetActor.type === "pc") targetActor.update({ "system.settings.skills.powerShifts.active": true });
          break;
        case "lasting-damage":
          if (targetActor.type === "pc") targetActor.update({ "system.settings.combat.lastingDamage.active": true });
          break;
        case "attack":
          if (targetActor.type !== "pc") targetActor.update({ "system.settings.equipment.attacks.active": true });
          break;
        case "armor":
          if (targetActor.type !== "pc") targetActor.update({ "system.settings.equipment.armor.active": true });
          break;
        case "tag":
          if (targetActor.type === "pc") targetActor.update({ "system.settings.general.tags.active": true });
          break;
      }
    }

    async function archiveItem() {
      originItem.update({ "system.archived": true });
      targetActor.createEmbeddedDocuments("Item", [originItemData]);
      enableListForItem();
    }

    function deleteItem() {
      originItem.delete();
      targetActor.createEmbeddedDocuments("Item", [originItemData]);
      enableListForItem();
    }

    async function sortItemsIntoCategories(event, item) {
      const table = {
        skill: ["Skill", "SkillTwo", "SkillThree", "SkillFour"],
        ability: ["Ability", "AbilityTwo", "AbilityThree", "AbilityFour", "Spell"],
        equipment: ["Equipment", "EquipmentTwo", "EquipmentThree", "EquipmentFour"],
        tag: ["Tag", "TagTwo", "TagThree", "TagFour"]
      }
      const viableIDs = table[item.type] ?? [];

      let target = event.target;
      while (target.parentElement) {
        target = target.parentElement;
        if (viableIDs.includes(target.id)) {
          return target.id;
        }
      }
      // Not found
      return item.system.settings.general.sorting;
    }
  }

  /**
  * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
  * @param {Event} event   The originating click event
  * @private
  */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;

    // Get the type of item to create.
    const type = header.dataset.type;

    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);

    // Initialize a default name.
    const types = {
      "ability": game.i18n.localize("CYPHERSYSTEM.NewAbility"),
      "ammo": game.i18n.localize("CYPHERSYSTEM.NewAmmo"),
      "armor": game.i18n.localize("CYPHERSYSTEM.NewArmor"),
      "artifact": game.i18n.localize("CYPHERSYSTEM.NewArtifact"),
      "attack": game.i18n.localize("CYPHERSYSTEM.NewAttack"),
      "cypher": game.i18n.localize("CYPHERSYSTEM.NewCypher"),
      "equipment": game.i18n.localize("CYPHERSYSTEM.NewEquipment"),
      "lasting-damage": game.i18n.localize("CYPHERSYSTEM.NewLastingDamage"),
      "material": game.i18n.localize("CYPHERSYSTEM.NewMaterial"),
      "oddity": game.i18n.localize("CYPHERSYSTEM.NewOddity"),
      "power-shift": game.i18n.localize("CYPHERSYSTEM.NewPowerShift"),
      "skill": game.i18n.localize("CYPHERSYSTEM.NewSkill"),
      "recursion": game.i18n.localize("CYPHERSYSTEM.NewRecursion"),
      "tag": game.i18n.localize("CYPHERSYSTEM.NewTag"),
      "default": game.i18n.localize("CYPHERSYSTEM.NewDefault")
    };
    const name = (types[type] || types["default"]);

    // Finally, create the item!
    return Item.create({ type: type, data, name: name }, { parent: this.actor });
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
