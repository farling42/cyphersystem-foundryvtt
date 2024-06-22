/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

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
    data.actors = [];
    for (const actor of game.actors) {
      if (actor.type == "pc" && actor.hasPlayerOwner) {
        data.actors.push(actor);
      }
    }

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
      await game.settings.set("cyphersystem", "useGlobalGMIRange", !game.settings.get("cyphersystem", "useGlobalGMIRange"));
    });

    html.find(".increase-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", Math.min(20, (game.settings.get("cyphersystem", "globalGMIRange") + 1)));
      } else if (mode == "allActors") {
        await updateActors(data.actors);
      } else if (mode) {
        await updateActors([game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId"))]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": Math.min(20, actor.system.basic.gmiRange + 1)});
        }
      }
    });

    html.find(".decrease-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", Math.max(1, (game.settings.get("cyphersystem", "globalGMIRange") - 1)));
      } else if (mode == "allActors") {
        await updateActors(data.actors);
      } else if (mode) {
        await updateActors([game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId"))]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": Math.max(1, actor.system.basic.gmiRange - 1)});
        }
      }
    });

    html.find(".reset-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", 1);
      } else if (mode == "allActors") {
        await updateActors(data.actors);
      } else if (mode) {
        await updateActors([game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId"))]);
      }
      async function updateActors(actors) {
        for (const actor of actors) {
          await actor.update({"system.basic.gmiRange": 1});
        }
      }
    });
  }
}

// This is used to create a new GMI form, unless there is already one there
export async function gmiRangeForm() {
  // Create gmiRangeForm
  let gmiRangeForm = Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet) || new GMIRangeSheet();

  // Render sheet
  gmiRangeForm.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function renderGMIForm() {
  let gmiRangeForm = Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet);

  if (gmiRangeForm) {
    gmiRangeForm.render(true, {focus: false});
  }
}