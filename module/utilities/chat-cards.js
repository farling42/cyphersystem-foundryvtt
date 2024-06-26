// Import macros
import {
  diceRollMacro,
  recoveryRollMacro,
} from "../macros/macros.js";

import { rollEngineMain } from "./roll-engine/roll-engine-main.js";



export function chatCardMarkItemIdentified(actor, item) {
  return game.i18n.format("CYPHERSYSTEM.PCAskingForIdentification", { actor: actor.name }) + `<div class='chat-card-buttons'><a class='confirm' data-item='${item._id}' data-actor='${actor.id}'><i class="fas fa-check"></i> ${game.i18n.localize("CYPHERSYSTEM.Confirm")}</a></div>`;
}

export function chatCardProposeIntrusion(selectOptions) {
  return `<div align="center"><label style='display: inline-block; text-align: right'><strong>${game.i18n.localize("CYPHERSYSTEM.ProposeIntrusionTo")}: </strong></label>
  <select name='selectPC' id='selectPC' style='width: auto; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>`+ selectOptions + `</select></div>`;
}

export function chatCardAskForIntrusion(actor, actorId) {
  let refuseButton = (actor.system.basic.xp > 0) ? ` | <a class='refuse-intrusion ' data-actor='${actorId}'><i class="fas fa-times"></i> ${game.i18n.localize("CYPHERSYSTEM.Refuse")}</a>` : "";

  return game.i18n.format("CYPHERSYSTEM.ProposingIntrusion", { actor: actor.name }) + `<div class='chat-card-buttons' data-actor='${actorId}'><a class='accept-intrusion' data-actor='${actorId}'><i class="fas fa-check"></i> ${game.i18n.localize("CYPHERSYSTEM.Accept")}</a>` + refuseButton + "</div>";
}

export function chatCardIntrusionAccepted(actor, selectedActorId) {
  let selectedActor = game.actors.get(selectedActorId);
  return (selectedActorId) ? game.i18n.format("CYPHERSYSTEM.IntrusionAcceptedAndGaveXP", { actor: actor.name, selectedActor: selectedActor.name }) : game.i18n.format("CYPHERSYSTEM.IntrusionAccepted", { actor: actor.name });
}

export function chatCardIntrusionRefused(actor) {
  return game.i18n.format("CYPHERSYSTEM.IntrusionRefused", { actor: actor.name });
}

export function chatCardWelcomeMessage() {
  return "<p style='margin:5px 0 0 0; text-align:center'><strong>" + game.i18n.localize("CYPHERSYSTEM.WelcomeMessage") + "</strong></p><p style='margin:5px 0 0 0; text-align:center'><a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Getting-Started'>" + game.i18n.localize("CYPHERSYSTEM.GettingStarted") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki'>" + game.i18n.localize("CYPHERSYSTEM.UserManual") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/blob/main/CHANGELOG.md'>Changelog</a></p><p style='margin:5px 0 0 0; text-align:center'><a href='https://discord.gg/C5zGgtyhwa'>" + game.i18n.localize("CYPHERSYSTEM.JoinDiscord") + "</a></p>";
}

export function chatCardRegainPoints(actor, cost, poolname, teen) {
  let poolPoints = "";
  switch (poolname.toLowerCase()) {
    case "might": poolPoints = (cost == 1) ? "CYPHERSYSTEM.MightPoint" : "CYPHERSYSTEM.MightPoints"; break;
    case "speed": poolPoints = (cost == 1) ? "CYPHERSYSTEM.SpeedPoint" : "CYPHERSYSTEM.SpeedPoints"; break;
    case "intellect": poolPoints = (cost == 1) ? "CYPHERSYSTEM.IntellectPoint" : "CYPHERSYSTEM.IntellectPoints"; break;
  }

  return game.i18n.format("CYPHERSYSTEM.RegainedPoints",
    {
      actor: (teen) ? actor.system.teen.basic.name : actor.name,
      cost: cost,
      poolPoints: game.i18n.localize(poolPoints)
    });
}

Hooks.on("renderChatMessage", function (message, html, data) {
  // Hide buttons
  let actor = game.actors.get(html.find('.chat-card-buttons').data('actor'));
  if (actor && !actor.isOwner) html.find("div[class='chat-card-buttons']").addClass('chat-hidden');

  // Event Listener to confirm cypher and artifact identification
  html.find('.confirm').click(ev => {
    if (!game.user.isGM) 
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.OnlyGMCanIdentify"));
    const dataset = ev.currentTarget.dataset;
    let actor = game.actors.get(dataset.actor);
    let item = actor.items.get(dataset.item);
    item.update({ "system.basic.identified": true });
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ConfirmIdentification", {
      item: item.name,
      actor: actor.name
    }));
  });

  // Event Listener for rerolls of stat rolls
  html.find('.reroll-stat').click(ev => {
    const dataset = ev.currentTarget.dataset;
    if (dataset.user !== game.user.id) 
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    const data = JSON.parse(dataset.data);
    delete data["skipDialog"];
    delete data["roll"];
    data.reroll = true;
    rollEngineMain(data);
  });

  // Event Listener for rerolls of recovery rolls
  html.find('.reroll-recovery').click(ev => {
    const dataset = ev.currentTarget.dataset;
    if (dataset.user !== game.user.id) 
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let actorUuid = dataset.actorUuid;
    let actor = (actorUuid.includes("Token")) ? fromUuidSync(actorUuid).actor : fromUuidSync(actorUuid);
    recoveryRollMacro(actor, dataset.dice, false);
  });

  // Event Listener for rerolls of dice rolls
  html.find('.reroll-dice-roll').click(ev => {
    const dataset = ev.currentTarget.dataset;
    if (dataset.user !== game.user.id) 
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    diceRollMacro(dataset.dice);
  });

  // Event Listener to regain pool points
  html.find('.regain-points').click(ev => {
    const dataset = ev.currentTarget.dataset;
    if (dataset.user !== game.user.id) 
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    const actorUuid = dataset.actorUuid;
    const actor = (actorUuid.includes("Token")) ? fromUuidSync(actorUuid).actor : fromUuidSync(actorUuid);
    actor.regainPoolPoints(dataset.cost, dataset.pool, dataset.teen);
  });

  function changeExpand(description) {
    if (description.hasClass("expanded")) {
      description.slideUp();
      description.toggleClass("expanded");
    } else {
      description.slideDown();
      description.toggleClass("expanded");
    }
  }

  // Event Listener for description in chat
  html.find('.chat-description').click(() => changeExpand(html.find('.chat-card-item-description')) );
  html.find('.roll-result-difficulty').click(() => changeExpand(html.find('.roll-result-difficulty-details')) );
  html.find('.roll-result-damage').click(() => changeExpand(html.find('.roll-result-damage-details')) );
  html.find('.roll-result-cost').click(() => changeExpand(html.find('.roll-result-cost-details')) );

  // Event Listener for accepting intrusions
  html.find('.accept-intrusion').click(ev => {
    const dataset = ev.currentTarget.dataset;
    const actor = game.actors.get(dataset.actor);
    if (!actor.isOwner) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", {
      actor: actor.name
    }));

    // Create list of PCs
    let list = "";
    for (const actor of game.actors.contents) {
      if (actor.type === "pc" && actor._id != dataset.actor && actor.hasPlayerOwner) {
        let owners = "";
        for (const user of game.users.contents) {
          if (!user.isGM) {
            let ownerID = user._id;
            if (actor.ownership[ownerID] == 3) {
              owners = (owners == "") ? user.name : owners + ", " + user.name;
            }
          }
        }
        list = list + `<option value=${actor._id}>${actor.name} (${owners})</option>`;
      }
    }

    // Create dialog content
    let content = `<div align="center"><label style="display: inline-block; text-align: right"><strong>${game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXPTo")}: </strong></label>
    <select name="selectPC" id="selectPC" style="width: auto; margin-left: 5px; margin-bottom: 5px; text-align-last: center">` + list + `</select></div>`;

    // Create dialog
    let d = new Dialog({
      title: game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXP"),
      content: content,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Apply"),
          callback: (html) => actor.applyXPFromIntrusion(html.find('#selectPC').val(), data.message._id, 1)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
          callback: () => {}
        }
      },
      default: "apply",
      close: () => {}
    });
    if (list == "") {
      actor.applyXPFromIntrusion("", data.message._id, 1);
    } else {
      d.render(true, {
        width: "auto"
      });
    }
  });

  // Event Listener for refusing intrusions
  html.find('.refuse-intrusion').click(ev => {
    let actor = game.actors.get(ev.currentTarget.dataset.actor);
    if (!actor.isOwner) 
      return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", {
        actor: actor.name
      }));
    actor.applyXPFromIntrusion("", data.message._id, -1);
  });
});
