// Import actors & items
import { CypherActor } from "./actor/actor.js";
import { CypherItem  } from "./item/item.js";

// Import actor & item sheets
import { CypherItemSheet     } from "./item/item-sheet.js";
import { CypherActorSheet    } from "./actor/actor-sheet.js";
import { CypherActorSheetPC  } from "./actor/pc-sheet.js";
import { CypherActorSheetNPC } from "./actor/npc-sheet.js";
import { CypherActorSheetCommunity } from "./actor/community-sheet.js";
import { CypherActorSheetCompanion } from "./actor/companion-sheet.js";
import { CypherActorSheetMarker    } from "./actor/marker-sheet.js";
import { CypherActorSheetVehicle   } from "./actor/vehicle-sheet.js";

// Import utility functions
import { preloadTemplates } from "./utilities/template-paths.js";
import { sendWelcomeMessage } from "./utilities/welcome-message.js";
import { createCyphersystemMacro } from "./utilities/create-macros.js";

// Import macros
import {
  quickRollMacro,
  easedRollMacro,
  hinderedRollMacro,
  diceRollMacro,
  recoveryRollMacro,
  spendEffortMacro,
  allInOneRollDialog,
  itemRollMacro,
  quickStatChange,
  proposeIntrusion,
  changeSymbolForFractions,
  toggleAlwaysShowDescriptionOnRoll,
  calculateAttackDifficulty,
  recursionMacro,
  tagMacro,
  disasterModeMacro,
  lockStaticStatsMacro,
  migrateDataMacro,
  selectedTokenRollMacro
} from "./macros/macros.js";
import {
  easedRollEffectiveMacro,
  hinderedRollEffectiveMacro,
  renameTagMacro,
  translateToRecursion,
  archiveStatusByTag
} from "./macros/macro-helper.js";
import {
  chatCardMarkItemIdentified,
  chatCardProposeIntrusion,
  chatCardAskForIntrusion,
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardWelcomeMessage,
  chatCardRegainPoints
} from "./utilities/chat-cards.js";
import { registerGameSettings } from "./utilities/game-settings.js";
import { registerHandlebars } from "./utilities/handlebars.js";
import { gameSockets } from "./utilities/game-sockets.js";
import { initiativeSettings } from "./utilities/initiative-settings.js";
import {
  dataMigration,
  dataMigrationPacks
} from "./utilities/migration.js";
import { rollEngineMain } from "./utilities/roll-engine/roll-engine-main.js";
import { rollEngineComputation } from "./utilities/roll-engine/roll-engine-computation.js";
import { rollEngineForm } from "./utilities/roll-engine/roll-engine-form.js";
import { rollEngineOutput } from "./utilities/roll-engine/roll-engine-output.js";
import { gmiRangeForm } from "./forms/gmi-range-sheet.js";
import { renderRollDifficultyForm } from "./forms/roll-difficulty-sheet.js";
import { defineActorDataModels } from './actor/actordatamodel.js';
import { defineItemDataModels } from './item/itemdatamodel.js';
import {
  changePortraitAndToken,
  executeSeriesOfMacros,
  payCostWithAdditionalPool,
  payXP,
  useAmmo
} from "./macros/macros-scripting.js";
import {
  toggleDragRuler,
  resetDragRulerDefaults
} from "./utilities/drag-ruler.js";
import {
  resetBarBrawlDefaults,
  removeBarBrawlSettings
} from "./utilities/bar-brawl.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  console.log("Initializing Cypher System");

  // CONFIG.debug.hooks = true;

  const recursionDocumentLinkExceptions = ["@macro", "@actor", "@scene", "@item", "@rolltable", "@journalentry", "@cards", "@playlist", "@playlistsound", "@compendium", "@pdf", "@uuid"];

  game.cyphersystem = {
    // Actor sheets
    CypherActor,
    CypherItem,
    CypherActorSheet,
    CypherActorSheetPC,
    CypherActorSheetNPC,
    CypherActorSheetCommunity,
    CypherActorSheetCompanion,
    CypherActorSheetVehicle,
    CypherActorSheetMarker,
    CypherItemSheet,

    // Macros
    quickRollMacro,
    easedRollMacro,
    hinderedRollMacro,
    diceRollMacro,
    recoveryRollMacro,
    spendEffortMacro,
    itemRollMacro,
    allInOneRollDialog,
    toggleDragRuler,
    resetDragRulerDefaults,
    resetBarBrawlDefaults,
    removeBarBrawlSettings,
    quickStatChange,
    proposeIntrusion,
    changeSymbolForFractions,
    toggleAlwaysShowDescriptionOnRoll,
    calculateAttackDifficulty,
    recursionMacro,
    tagMacro,
    disasterModeMacro,
    lockStaticStatsMacro,
    migrateDataMacro,
    dataMigrationPacks,
    rollEngineMain,
    rollEngineComputation,
    rollEngineForm,
    rollEngineOutput,
    selectedTokenRollMacro,

    // Scripting macros
    useAmmo,
    payCostWithAdditionalPool,
    payXP,
    executeSeriesOfMacros,
    changePortraitAndToken,

    // Deprecated macros
    easedRollEffectiveMacro,
    hinderedRollEffectiveMacro,
    archiveStatusByTag,
    translateToRecursion,
    renameTagMacro,

    // Chat cards
    chatCardMarkItemIdentified,
    chatCardProposeIntrusion,
    chatCardAskForIntrusion,
    chatCardIntrusionAccepted,
    chatCardIntrusionRefused,
    chatCardWelcomeMessage,
    chatCardRegainPoints,

    // Recursion Document Link Exceptions
    recursionDocumentLinkExceptions
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CypherActor;
  CONFIG.Item.documentClass = CypherItem;

  defineActorDataModels();
  defineItemDataModels();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheetPC, {
    types: ['pc'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetNPC, {
    types: ['npc'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassNPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetMarker, {
    types: ['marker'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassToken"
  });
  Actors.registerSheet("cypher", CypherActorSheetCommunity, {
    types: ['community'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCommunity"
  });
  Actors.registerSheet("cypher", CypherActorSheetCompanion, {
    types: ['companion'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCompanion"
  });
  Actors.registerSheet("cypher", CypherActorSheetVehicle, {
    types: ['vehicle'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassVehicle"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassItem"
  });

  initiativeSettings();
  registerGameSettings();
  registerHandlebars();
  preloadTemplates();
});

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type === "Item") {
      createCyphersystemMacro(data, slot);
      return false;
    }
  });
  
  // Load game sockets
  if (game.user.isGM) gameSockets();

  // Migrate actor data
  await dataMigration();

  // Send warning for people with CSRD Compendium v3.2.0
  if (game.modules.get("cyphersystem-compendium")?.version === "v3.2.0") {
    ui.notifications.error("There has been a bug in the update process for the Cypher SRD Compendium. Please uninstall and reinstall the module in the Foundry setup to get the newest version. Sorry for the inconvenience! –Marko", {
      permanent: true,
      console: true
    });
  }

  // Send warning for people with cyphersheets module version 0.3.3 or lower
  let cypherSheetsVersion = game.modules.get("cyphersheets")?.version;
  if (cypherSheetsVersion && game.modules.get("cyphersheets")?.active) {
    let versionParts = cypherSheetsVersion.substring(1).split('.').map(Number);
    if (versionParts[0] < 0 || (versionParts[0] === 0 && versionParts[1] <= 3) || (versionParts[0] === 0 && versionParts[1] === 3 && versionParts[2] <= 3)) {
      ui.notifications.error("The Cypher System Custom Sheets module hasn’t been updated in a while and isn’t compatible with the current version of the Cypher System. Please disable the Custom Sheets module. You can customize PC sheets in the settings tab and all other sheets in the system settings. –Marko", {
        permanent: true,
        console: true
      });
    }
  }

  // Send welcome message
  if (game.settings.get("cyphersystem", "welcomeMessage")) sendWelcomeMessage();
});

Hooks.on("getSceneControlButtons", function (hudButtons) {
  let tokenControls = hudButtons.find(val => {
    return val.name === "token";
  });
  if (tokenControls) {
    tokenControls.tools.push({
      name: "rollDifficulty",
      title: game.i18n.localize("CYPHERSYSTEM.DifficultyControlPanel"),
      icon: "fa-solid fa-crosshairs-simple",
      onClick: () => {
        renderRollDifficultyForm(true);
      },
      button: true
    });
  }
  if (tokenControls && game.user.isGM) {
    tokenControls.tools.push({
      name: "calculateDifficulty",
      title: game.i18n.localize("CYPHERSYSTEM.CalculateAttackDifficulty"),
      icon: "fas fa-calculator",
      onClick: calculateAttackDifficulty,
      button: true
    });
  }
  if (tokenControls) {
    tokenControls.tools.push({
      name: "gmiRange",
      title: game.i18n.localize("CYPHERSYSTEM.GMIRange"),
      icon: "fas fa-exclamation-triangle",
      onClick: gmiRangeForm,
      button: true
    });
  }
  if (tokenControls && game.user.isGM) {
    tokenControls.tools.push({
      name: "proposeGMI",
      title: game.i18n.localize("CYPHERSYSTEM.ProposeIntrusion"),
      icon: "fas fa-bolt",
      onClick: proposeIntrusion,
      button: true
    });
  }
});



Hooks.on("createCombatant", function (combatant) {
  if (!game.user.isGM) return;

  let actor = combatant.actor;
  let NPCInitiative;

  if (game.settings.get("cyphersystem", "difficultyNPCInitiative") && game.settings.get("cyphersystem", "rollDifficulty") >= 0) {
    NPCInitiative = game.settings.get("cyphersystem", "rollDifficulty");
  } else {
    NPCInitiative = (actor.type === "community") ?
      actor.system.basic.rank :
      actor.system.basic.level;
  }

  let initiative;
  if (actor.type === "npc")
    initiative = (NPCInitiative * 3) + actor.system.settings.general.initiativeBonus - 0.5 + (actor.system.basic.level / 1000);
  else if (actor.type === "vehicle")
    initiative = (NPCInitiative * 3) - 0.5 + (actor.system.basic.level / 1000);
  else if (actor.type === "community") {
    if (combatant.hasPlayerOwner)
      initiative = (actor.system.basic.rank * 3) + actor.system.settings.general.initiativeBonus
    else
      initiative = (NPCInitiative * 3) + actor.system.settings.general.initiativeBonus - 0.5 + (actor.system.basic.rank / 1000)
  }
  if (initiative !== undefined) combatant.update({ "initiative": initiative } );
});

Hooks.on("updateCombat", function () {
  if (game.user.isGM) {
    const combatant = game.combat.combatant?.actor;
    if (combatant?.type === "marker" && combatant.system.settings.general.isCounter) {
      let step = combatant.system.settings.general.counting || -1;
      let newQuantity = combatant.system.pools.quantity.value + step;
      combatant.update({ "system.pools.quantity.value": newQuantity });
    }
  }
});