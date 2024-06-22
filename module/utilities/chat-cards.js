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