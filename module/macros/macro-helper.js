/* -------------------------------------------- */
/*  Macro helper                                */
/* -------------------------------------------- */

import { htmlEscape } from "../utilities/html-escape.js";
import { regexEscape } from "../utilities/regex-escape.js";
import {skillModifier, skillLevelChoices} from '../../item/itemdatamodel.js';

function plural(value, string) { return value===1 ? string : (string + "s") }

export function itemRollMacroQuick(actor, itemID, teen) {
  // Find actor and item based on item ID
  const item = actor.items.get(itemID);

  // Set defaults
  let modifier = 0;
  let pointsPaid = true;
  if (teen === undefined) teen = actor.system.isTeen;

  // Set title
  let itemTypeStrings = {
    "skill": game.i18n.localize("TYPES.Item.skill"),
    "power-shift": game.i18n.localize("ITEM.TypePower Shift"),
    "attack": game.i18n.localize("TYPES.Item.attack"),
    "ability": game.i18n.localize("TYPES.Item.ability"),
    "cypher": game.i18n.localize("TYPES.Item.cypher"),
    "artifact": game.i18n.localize("TYPES.Item.artifact"),
    "ammo": game.i18n.localize("TYPES.Item.ammo"),
    "armor": game.i18n.localize("TYPES.Item.armor"),
    "equipment": game.i18n.localize("TYPES.Item.equipment"),
    "lasting-damage": game.i18n.localize("ITEM.TypeLasting Damage"),
    "material": game.i18n.localize("TYPES.Item.material"),
    "oddity": game.i18n.localize("TYPES.Item.oddity")
  };
  let info = itemTypeStrings[item.type] || "";

  switch (item.type) {
    case "skill":
      // Set info
      info += ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + 
        (game.i18n.localize(skillLevelChoices[item.system.basic.rating] || skillLevelChoices["Practiced"]));

      // Set difficulty modifier
      modifier = skillModifier[item.system.basic.rating] ?? 0;
      break;

    case "power-shift":
      // Set info
      info += ". " + item.system.basic.shifts + " " + game.i18n.localize((item.system.basic.shifts === 1) ? "CYPHERSYSTEM.Shift" : "CYPHERSYSTEM.Shifts");

      // Set difficulty modifier
      modifier = item.system.basic.shifts;
      break;

    case "attack":
      // Set info
      info += ". " + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + item.system.basic.damage;

      // Determine whether the roll is eased or hindered
      let modifiedBy = (item.system.basic.modifier === "hindered") ? item.system.basic.steps * -1 : item.system.basic.steps;

      // Set difficulty modifier
      modifier = (skillModifier[item.system.basic.skillRating] ?? 0) + modifiedBy;
      break;

    case "ability":
      // Set defaults
      let costInfo = "";

      // Slice possible "+" from cost
      let pointCost = parseInt(item.system.basic.cost);

      // Check if there is a point cost and prepare costInfo
      if (item.system.basic.cost) {
        // Determine edge
        let edge;
        switch (item.system.basic.pool) {
          case "Might": edge = teen ? actor.system.teen.pools.might.edge : actor.system.pools.might.edge; break;
          case "Speed": edge = teen ? actor.system.teen.pools.speed.edge : actor.system.pools.speed.edge; break;
          case "Intellect": edge = teen ? actor.system.teen.pools.intellect.edge : actor.system.pools.intellect.edge; break;
          default: edge = 0;
        }

        // Determine point cost
        let pointCostInfo = Math.max(0, pointCost - edge);

        // Determine pool points
        let relevantPool = {
          "Might": function () {
            return game.i18n.localize(plural(pointCost, "CYPHERSYSTEM.MightPoint"));
          },
          "Speed": function () {
            return game.i18n.localize(plural(pointCost, "CYPHERSYSTEM.SpeedPoint"));
          },
          "Intellect": function () {
            return game.i18n.localize(plural(pointCost, "CYPHERSYSTEM.IntellectPoint"));
          },
          "Pool": function () {
            return game.i18n.localize(plural(pointCost, "CYPHERSYSTEM.AnyPoolPoint"));
          },
          "XP": function () {
            return game.i18n.localize("CYPHERSYSTEM.XP");
          }
        };
        // Put it all together for cost info
        costInfo = ". " + game.i18n.localize("CYPHERSYSTEM.Cost") + ": " + pointCostInfo;
        if (edge !== 0) costInfo += " (" + pointCost + ((edge < 0) ? "+" : "-") + Math.abs(edge) + ")";
        costInfo += " " + (relevantPool[item.system.basic.pool]() || relevantPool["Pool"]());
      }

      // Put everything together for info
      info += costInfo;

      // Pay pool points and check whether there are enough points
      pointsPaid = actor.payPoolPoints(pointCost, item.system.basic.pool, teen);
      break;

    case "cypher":
      // Put it all together for info
      if (item.system.basic.level) info += ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.system.basic.level;
      break;

    case "artifact":
      info += ". ";
      if (item.system.basic.level) info += game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.system.basic.level + ". ";
      info += game.i18n.localize("CYPHERSYSTEM.Depletion") + ": " + item.system.basic.depletion;
      break;

    default:
      break;
  }

  // Parse to dice roller macro
  if (pointsPaid) diceRoller(item.name, info, modifier, 0);
}

export async function toggleTagArchiveStatus(actor, tag, archiveStatus) {
  // Check for PC
  if (!actor || actor.type !== "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  if (tag.length === 0) return;

  tag = "#" + htmlEscape(regexEscape(tag.toLowerCase().trim()));

  let updates = [];
  for (const item of actor.items) {
    let name = item.name.toLowerCase();
    let description = item.system.description.toLowerCase();
    if (item.type === "Tag") return;
    let regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
    if (regTag.test(name) || regTag.test(description)) {
      updates.push({ _id: item.id, "system.archived": archiveStatus });
    }
  }
  return actor.updateEmbeddedDocuments("Item", updates);
}