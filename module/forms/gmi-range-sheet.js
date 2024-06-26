/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

const MIN_GMI = 1;
const MAX_GMI = 20;

export class GMIRangeSheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "gmi-form"],
      template: "systems/cyphersystem/templates/forms/gmi-range-sheet.html",
      title: game.i18n.localize("CYPHERSYSTEM.GMIRange"),
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      width: 300,
      height: "auto",
      top: 235,
      left: 110,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    data.globalGMIRange = game.settings.get("cyphersystem", "globalGMIRange");
    data.useGlobalGMIRange = game.settings.get("cyphersystem", "useGlobalGMIRange");
    data.isGM = game.user.isGM;
    data.actors = game.actors.filter(actor => actor.type === "pc" && actor.hasPlayerOwner);

    // Return data
    return data;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    let data = this.object;

    html.find('.toggle-global-gmi-range').click(async clickEvent => {
      game.settings.set("cyphersystem", "useGlobalGMIRange", !game.settings.get("cyphersystem", "useGlobalGMIRange"));
    });

    function itemIdFromEvent(event) {
      return event.currentTarget.closest(".item").dataset.itemId;
    }

    html.find(".increase-gmi-range").click(async clickEvent => {
      let mode = itemIdFromEvent(clickEvent);
      if (mode == "global") {
        game.settings.set("cyphersystem", "globalGMIRange", Math.min(MAX_GMI, (game.settings.get("cyphersystem", "globalGMIRange") + 1)));
      } else if (mode == "allActors") {
        updateActors(data.actors);
      } else if (mode) {
        updateActors([game.actors.get(mode)]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": Math.min(MAX_GMI, actor.system.basic.gmiRange + 1)});
        }
      }
    });

    html.find(".decrease-gmi-range").click(async clickEvent => {
      let mode = itemIdFromEvent(clickEvent);
      if (mode == "global") {
        game.settings.set("cyphersystem", "globalGMIRange", Math.max(MIN_GMI, (game.settings.get("cyphersystem", "globalGMIRange") - 1)));
      } else if (mode == "allActors") {
        updateActors(data.actors);
      } else if (mode) {
        updateActors([game.actors.get(mode)]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": Math.max(MIN_GMI, actor.system.basic.gmiRange - 1)});
        }
      }
    });

    html.find(".reset-gmi-range").click(async clickEvent => {
      let mode = itemIdFromEvent(clickEvent);
      if (mode == "global") {
        game.settings.set("cyphersystem", "globalGMIRange", MIN_GMI);
      } else if (mode == "allActors") {
        updateActors(data.actors);
      } else if (mode) {
        updateActors([game.actors.get(mode)]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": MIN_GMI});
        }
      }
    });
  }
}

// This is used to create a new GMI form, unless there is already one there
export async function gmiRangeForm() {
  Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet) || new GMIRangeSheet()?.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function renderGMIForm() {
  Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet)?.render(true, {focus: false});
}