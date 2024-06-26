Hooks.on("canvasReady", function (canvas) {
  console.log(`The canvas was just rendered for scene: ${canvas.scene.id}`);
  for (const token of game.scenes.viewed.tokens) {
    if (token.getFlag("cyphersystem", "toggleDragRuler") === undefined) {
      token.setFlag("cyphersystem", "toggleDragRuler", (token.actor.type !== "marker" && token.actor.type !== "vehicle"));
    }
  }
});

Hooks.once("dragRuler.ready", (SpeedProvider) => {
  class CypherSystemSpeedProvider extends SpeedProvider {
    get colors() {
      return [{
        id: "immediate",
        default: 0x0000FF,
        name: "immediate"
      },
      {
        id: "short",
        default: 0x008000,
        name: "short"
      },
      {
        id: "long",
        default: 0xFFA500,
        name: "long"
      },
      {
        id: "veryLong",
        default: 0xFF0000,
        name: "very long"
      }
      ];
    }

    getRanges(token) {
      let immediate = 0;
      let short = 0;
      let long = 0;
      let veryLong = 0;
      if (["m", "meter", "metre"].includes(token.scene.grid.units) || token.scene.grid.units == game.i18n.localize("CYPHERSYSTEM.UnitDistanceMeter")) {
        immediate = 3;
        short = 15;
        long = 30;
        veryLong = 150;
      } else if (["ft", "ft.", "feet"].includes(token.scene.grid.units) || token.scene.grid.units == game.i18n.localize("CYPHERSYSTEM.UnitDistanceFeet")) {
        immediate = 10;
        short = 50;
        long = 100;
        veryLong = 500;
      }

      const ranges = [{
        range: immediate,
        color: "immediate"
      },
      {
        range: short,
        color: "short"
      },
      {
        range: long,
        color: "long"
      },
      {
        range: veryLong,
        color: "veryLong"
      }
      ];
      return ranges;
    }

    get defaultUnreachableColor() {
      return 0x000000;
    }

    usesRuler(token) {
      return !!token.document.flags.cyphersystem.toggleDragRuler;
    }
  }

  dragRuler.registerSystem("cyphersystem", CypherSystemSpeedProvider);
});

Hooks.on("preCreateToken", function (document, data) {
  if (!data.actorId) return;
  const actor = game.actors.get(data.actorId);
  document.updateSource({ "flags.cyphersystem.toggleDragRuler": (actor.type !== "marker" && actor.type !== "community") });
})

export function toggleDragRuler(token) {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"));
  }

  if (!token.document.data.flags.cyphersystem.toggleDragRuler) {
    token.document.setFlag("cyphersystem", "toggleDragRuler", true);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.EnabledDragRuler", {name: token.name}));
  } else if (token.document.data.flags.cyphersystem.toggleDragRuler) {
    token.document.setFlag("cyphersystem", "toggleDragRuler", false);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.DisabledDragRuler", {name: token.name}));
  }
}

export function resetDragRulerDefaults() {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  for (const token of canvas.tokens.objects.children) {
    if (token.actor.type !== "marker" && token.actor.type !== "vehicle") {
      token.document.setFlag("cyphersystem", "toggleDragRuler", true);
    } else {
      token.document.setFlag("cyphersystem", "toggleDragRuler", false);
    }
  }
  ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AllTokenDragRuler"));
}