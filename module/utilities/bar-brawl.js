Hooks.on("preCreateToken", function (document, data) {
  if (!data.actorId) return;
  const actor = game.actors.get(data.actorId);

  if (game.modules.get("barbrawl")?.active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    barBrawlOverwrite(document, actor);
  }
});

export async function resetBarBrawlDefaults(tokens) {
  if (!game.modules.get("barbrawl").active)
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateBarBrawl"));

  tokens = tokens ? [tokens] : canvas.tokens.objects.children;
  for (const token of tokens) {
    barBrawlOverwrite(token.document, game.actors.get(token.document.actorId));
  }
}

export async function removeBarBrawlSettings(tokens) {
  if (!game.modules.get("barbrawl").active)
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateBarBrawl"));

  tokens = (!tokens) ? canvas.tokens.objects.children : [tokens];
  for (const token of tokens) {
    await token.document.update({
      [`flags.-=barbrawl`]: null,
      "bar1.attribute": null,
      "bar2.attribute": null
    });
  }
  location.reload();
}

async function barBrawlOverwrite(document, actor) {
  await document.updateSource({
    [`flags.-=barbrawl`]: null,
    "bar1.attribute": null,
    "bar2.attribute": null
  });
  return document.updateSource(barBrawlData(actor.type, actor));
}

function barBrawlData(type, actor) {
  switch (type) {
    case "pc":
      return {
        "flags.barbrawl.resourceBars": {
          "intellect": {
            id: "intellect",
            mincolor: "#0000FF",
            maxcolor: "#0000FF",
            position: "bottom-inner",
            attribute: "pools.intellect",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "speed": {
            id: "speed",
            mincolor: "#00FF00",
            maxcolor: "#00FF00",
            position: "bottom-inner",
            attribute: "pools.speed",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "might": {
            id: "might",
            mincolor: "#FF0000",
            maxcolor: "#FF0000",
            position: "bottom-inner",
            attribute: "pools.might",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          }
        }
      };

    case "npc": case "companion":
      return {
        "flags.barbrawl.resourceBars": {
          "level": {
            id: "level",
            mincolor: "#0000FF",
            maxcolor: "#0000FF",
            position: "top-inner",
            attribute: "basic.level",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "health": {
            id: "health",
            mincolor: "#FF0000",
            maxcolor: "#FF0000",
            position: "bottom-inner",
            attribute: "pools.health",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          }
        }
      };

    case "community":
      return {
        "flags.barbrawl.resourceBars": {
          "rank": {
            id: "rank",
            mincolor: "#0000FF",
            maxcolor: "#0000FF",
            position: "top-inner",
            attribute: "basic.rank",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "infrastructure": {
            id: "infrastructure",
            mincolor: "#0000FF",
            maxcolor: "#0000FF",
            position: "bottom-inner",
            attribute: "pools.infrastructure",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "health": {
            id: "health",
            mincolor: "#FF0000",
            maxcolor: "#FF0000",
            position: "bottom-inner",
            attribute: "pools.health",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          }
        }
      };

    case "marker": case "GMI Range":
      return {
        "flags.barbrawl.resourceBars": {
          "level": {
            id: "level",
            mincolor: "#0000FF",
            maxcolor: "#0000FF",
            position: "top-inner",
            attribute: "basic.level",
            visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
          },
          "quantity": {
            id: "quantity",
            mincolor: "#FF0000",
            maxcolor: "#FF0000",
            position: "bottom-inner",
            attribute: "pools.quantity",
            visibility: CONST.TOKEN_DISPLAY_MODES.ALWAYS
          }
        }
      };

    default:
      return undefined;
  }
}

Hooks.on("renderTokenConfig", function (tokenConfig, html, data) {
  if (game.modules.get("barbrawl")?.active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    html.find("a[data-tab='resources']").addClass('hidden');
  }
});