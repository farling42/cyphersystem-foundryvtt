let effortChoices;

const damageTrackChoices = {
  Hale        : 'CYPHERSYSTEM.Hale', 
  Impaired    : 'CYPHERSYSTEM.Impaired', 
  Debilitated : 'CYPHERSYSTEM.Debilitated'
}
const gameModeChoices = { 
  Cypher   : 'Cypher System',
  Unmasked : 'Unmasked',
  Strange  : 'The Strange'
}
const OneActionRecoveryChoices = [ 0, 1, 2, 3, 4, 5, 6, 7 ]
const TenMinuteRecoveryChoices = [ 0, 1, 2 ]
// If an array, then the VALUE stored in the field is the INDEX into the array, not the value from the array
const currencyChoices = { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6 }
const unmaskedFormChoices = {
  ["Mask"]: 'CYPHERSYSTEM.Mask',
  ["Teen"]: 'CYPHERSYSTEM.Teen'
}
const bgImageChoices = {
  ["foundry"]:      'CYPHERSYSTEM.BGImageFoundry',
  ["cypher-blue"]:  'CYPHERSYSTEM.BGImageCypherBlue',
  ["plain metal"]:  'CYPHERSYSTEM.BGImageMetal',
  ["paper"]:        'CYPHERSYSTEM.BGImagePaper',
  ["plain pride"]:  'CYPHERSYSTEM.BGImagePride',
  ["plain blue"]:   'CYPHERSYSTEM.BGImagePlainBlue',
  ["plain green"]:  'CYPHERSYSTEM.BGImagePlainGreen',
  ["plain grey"]:   'CYPHERSYSTEM.BGImagePlainGrey',
  ["plain purple"]: 'CYPHERSYSTEM.BGImagePlainPurple',
  ["plain red"]:    'CYPHERSYSTEM.BGImagePlainRed',
  ["plain yellow"]: 'CYPHERSYSTEM.BGImagePlainYellow',
  ["custom"]:       'CYPHERSYSTEM.BGImageCustom'
}
const bgIconChoices = {
  ["none"]: 'CYPHERSYSTEM.BGIconNone',
  ["bat"]: 'CYPHERSYSTEM.BGIconBat',
  ["bat-mask"]: 'CYPHERSYSTEM.BGIconBatMask',
  ["battered-axe"]: 'CYPHERSYSTEM.BGIconBatteredAxe',
  ["battle-gear"]: 'CYPHERSYSTEM.BGIconBattleGear',
  ["bear"]: 'CYPHERSYSTEM.BGIconBear',
  ["bow-arrow"]: 'CYPHERSYSTEM.BGIconBowArrow',
  ["circuitry"]: 'CYPHERSYSTEM.BGIconCircuitry',
  ["holy-symbol"]: 'CYPHERSYSTEM.BGIconHolySymbol',
  ["hood"]: 'CYPHERSYSTEM.BGIconHood',
  ["orb-wand"]: 'CYPHERSYSTEM.BGIconOrbWand',
  ["wizard-staff"]: 'CYPHERSYSTEM.BGIconWizardStaff',
  ["wolf"]: 'CYPHERSYSTEM.BGIconWolf',
  ["custom"]: 'CYPHERSYSTEM.BGIconCustom'
}
const logoImageChoices = {
  ["none"]: 'CYPHERSYSTEM.CSLogoNone',
  ["black"]: 'CYPHERSYSTEM.CSLogoBlack',
  ["white"]: 'CYPHERSYSTEM.CSLogoWhite',
  ["color"]: 'CYPHERSYSTEM.CSLogoColor',
  ["custom"]: 'CYPHERSYSTEM.CSLogoCustom'
}

class CSBaseActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      version: new fields.NumberField({integer: true,  initial: 3 }),
    }
  }
}

class PCActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        descriptor: new fields.StringField({ initial: "", textSearch: true}),
        type:  new fields.StringField({ initial: "", textSearch: true }),
        focus: new fields.StringField({ initial: "", textSearch: true }),
        additionalSentence: new fields.StringField({ initial: "", textSearch: true }),
        unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedFormChoices }),
        tier:   new fields.NumberField({ required: true, integer: true,  initial: 1 }),
        effort: new fields.NumberField({ required: true, integer: true,  initial: 1, min: 0, max: 6 }),
        xp:     new fields.NumberField({ required: true, integer: true,  initial: 0 }),
        advancement: new fields.SchemaField({
          stats:  new fields.BooleanField({ initial: false, nullable: false }),
          effort: new fields.BooleanField({ initial: false, nullable: false }),
          edge:   new fields.BooleanField({ initial: false, nullable: false }),
          skill:  new fields.BooleanField({ initial: false, nullable: false }),
          other:  new fields.BooleanField({ initial: false, nullable: false })
        }),
        gmiRange: new fields.NumberField({required: true, integer: true,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        might: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          max:   new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          edge:  new fields.NumberField({required: true, nullable: false, integer: true,  initial: 0 })
        }),
        speed: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          max:   new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          edge:  new fields.NumberField({required: true, nullable: false, integer: true,  initial: 0 })
        }),
        intellect: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          max:   new fields.NumberField({required: true, nullable: false, integer: true,  initial: 10 }),
          edge:  new fields.NumberField({required: true, nullable: false, integer: true,  initial: 0 })
        }),
        additional: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true,  initial: 3 }),
          max:   new fields.NumberField({required: true, nullable: false, integer: true,  initial: 3 }),
          edge:  new fields.NumberField({required: true, nullable: false, integer: true,  initial: 0 })
        })
      }),
      combat: new fields.SchemaField({
        recoveries: new fields.SchemaField({
          roll: new fields.StringField({ initial: "1d6+1" }),
          oneAction: new fields.BooleanField({ initial: false }),
          oneAction2: new fields.BooleanField({ initial: false }),
          oneAction3: new fields.BooleanField({ initial: false }),
          oneAction4: new fields.BooleanField({ initial: false }),
          oneAction5: new fields.BooleanField({ initial: false }),
          oneAction6: new fields.BooleanField({ initial: false }),
          oneAction7: new fields.BooleanField({ initial: false }),
          tenMinutes: new fields.BooleanField({ initial: false }),
          tenMinutes2: new fields.BooleanField({ initial: false }),
          oneHour:  new fields.BooleanField({ initial: false }),
          tenHours: new fields.BooleanField({ initial: false })
        }),
        damageTrack: new fields.SchemaField({
          state: new fields.StringField({ initial: "Hale", choices: damageTrackChoices }),
          applyImpaired: new fields.BooleanField({ initial: true }),
          applyDebilitated: new fields.BooleanField({ initial: true })
        }),
        armor: new fields.SchemaField({
          ratingTotal: new fields.NumberField({integer: true,  initial: 0 }),
          costTotal: new fields.NumberField({integer: true,  initial: 0 })
        })
      }),
      abilities: new fields.SchemaField({
        preparedSpells: new fields.NumberField({integer: true,  initial: 0 })
      }),
      equipment: new fields.SchemaField({
        cypherLimit: new fields.NumberField({integer: true,  initial: 2 })
      }),
      notes: new fields.HTMLField({ initial: "", textSearch: true  }),
      gmNotes: new fields.HTMLField({ initial: "", textSearch: true  }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          gameMode: new fields.StringField({ initial: "Cypher", required: true, blank: false, choices: gameModeChoices }),
          additionalSentence: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          additionalPool: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" }),
            hasEdge: new fields.BooleanField({ initial: false })
          }),
          tags: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            labelCategory1: new fields.StringField({ initial: "" }),
            labelCategory2: new fields.StringField({ initial: "" }),
            labelCategory3: new fields.StringField({ initial: "" }),
            labelCategory4: new fields.StringField({ initial: "" })
          }),
          hideArchive: new fields.BooleanField({ initial: false }),
          hideEmptyCategories: new fields.BooleanField({ initial: false }),
          customSheetDesign: new fields.BooleanField({ initial: false }),
          background: new fields.SchemaField({
            image: new fields.StringField({ initial: "foundry", choices: bgImageChoices }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
            icon: new fields.StringField({ initial: "none", choices: bgIconChoices }),
            iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
            iconOpacity: new fields.AlphaField({ initial: 0.5 })
          }),
          logo: new fields.SchemaField({
            image: new fields.StringField({ initial: "black", choices: logoImageChoices }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            imageOpacity: new fields.AlphaField({ initial: 1 })
          })
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField({ initial: false }),
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          powerShifts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        }),
        combat: new fields.SchemaField({
          numberOneActionRecoveries: new fields.NumberField({integer: true,  initial: 1, choices: OneActionRecoveryChoices }),
          numberTenMinuteRecoveries: new fields.NumberField({integer: true,  initial: 1, choices: TenMinuteRecoveryChoices }),
          lastingDamage: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          })
        }),
        abilities: new fields.SchemaField({
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          labelSpells: new fields.StringField({ initial: "" })
        }),
        equipment: new fields.SchemaField({
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          currency: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            hideLabels: new fields.BooleanField({ initial: false }),
            numberCategories: new fields.NumberField({integer: true,  initial: 1, choices: currencyChoices }),
            labelCategory1: new fields.StringField({ initial: "" }),
            labelCategory2: new fields.StringField({ initial: "" }),
            labelCategory3: new fields.StringField({ initial: "" }),
            labelCategory4: new fields.StringField({ initial: "" }),
            labelCategory5: new fields.StringField({ initial: "" }),
            labelCategory6: new fields.StringField({ initial: "" }),
            quantity1: new fields.NumberField({integer: true,  initial: 0 }),
            quantity2: new fields.NumberField({integer: true,  initial: 0 }),
            quantity3: new fields.NumberField({integer: true,  initial: 0 }),
            quantity4: new fields.NumberField({integer: true,  initial: 0 }),
            quantity5: new fields.NumberField({integer: true,  initial: 0 }),
            quantity6: new fields.NumberField({integer: true,  initial: 0 })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: true }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            sortyByLevel: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      }),
      teen: new fields.SchemaField({
        basic: new fields.SchemaField({
          name: new fields.StringField({ initial: "" }),
          img:  new fields.FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
          descriptor: new fields.StringField({ initial: "" })
        }),
        pools: new fields.SchemaField({
          might: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          speed: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          intellect: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          additional: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 3 }),
            max:   new fields.NumberField({integer: true,  initial: 3 })
          })
        }),
        combat: new fields.SchemaField({
          damageTrack: new fields.SchemaField({
            state: new fields.StringField({ initial: "Hale", choices: damageTrackChoices }),
            applyImpaired:    new fields.BooleanField({ initial: true }),
            applyDebilitated: new fields.BooleanField({ initial: true })
          }),
          armor: new fields.SchemaField({
            ratingTotal: new fields.NumberField({integer: true,  initial: 0 }),
            costTotal:   new fields.NumberField({integer: true,  initial: 0 })
          })
        }),
        notes: new fields.HTMLField({ initial: "", textSearch: true  }),
        description: new fields.HTMLField({ initial: "", textSearch: true  }),
        settings: new fields.SchemaField({
          general: new fields.SchemaField({
            additionalPool: new fields.SchemaField({
              label: new fields.StringField({ initial: "" }),
              active: new fields.BooleanField({ initial: false })
            }),
            customSheetDesign: new fields.BooleanField({ initial: false }),
            background: new fields.SchemaField({
              image: new fields.StringField({ initial: "foundry", choices: bgImageChoices }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
              overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
              icon: new fields.StringField({ initial: "none", choices: bgIconChoices }),
              iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
              iconOpacity: new fields.AlphaField({ initial: 0.5 })
            }),
            logo: new fields.SchemaField({
              image: new fields.StringField({ initial: "black", choices: logoImageChoices }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] })
            })
          })
        })
      })
    }
  }
}

class NPCActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 3 }),
          max:   new fields.NumberField({integer: true,  initial: 3 })
        })
      }),
      combat: new fields.SchemaField({
        damage: new fields.NumberField({integer: true,  initial: 1 }),
        armor:  new fields.NumberField({integer: true,  initial: 0 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "<p>[Description]</p><p><strong>Motive:</strong>&nbsp;</p><p><strong>Environment:</strong>&nbsp;</p><p><strong>Health:</strong>&nbsp;</p><p><strong>Damage Inflicted:</strong>&nbsp;</p><p><strong>Movement:</strong>&nbsp;</p><p><strong>Modifications:</strong>&nbsp;</p><p><strong>Combat:</strong>&nbsp;</p><p><strong>Interaction:</strong>&nbsp;</p><p><strong>Use:</strong>&nbsp;</p><p><strong>Loot:</strong>&nbsp;</p><p><strong>GM Intrusion:</strong>&nbsp;</p>", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({integer: true,  initial: 0 }),
          hideArchive:     new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}

class CompanionActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 3 }),
        disposition: new fields.StringField({ initial: "" }),
        category: new fields.StringField({ initial: "" }),
        ownedBy: new fields.StringField({ initial: "" })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 8 }),
          max:   new fields.NumberField({integer: true,  initial: 8 })
        })
      }),
      combat: new fields.SchemaField({
        armor:  new fields.NumberField({integer: true,  initial: 0 }),
        damage: new fields.NumberField({integer: true,  initial: 3 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "<p><strong>Character Benefit:</strong>&nbsp;</p><p><strong>Background:</strong>&nbsp;</p><p><strong>Description:</strong>&nbsp;</p>", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({integer: true,  initial: 0 }),
          hideArchive: new fields.BooleanField({ initial: false })
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}

class CommunityActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        rank: new fields.NumberField({integer: true,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 3 }),
          max:   new fields.NumberField({integer: true,  initial: 3 })
        }),
        infrastructure: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 3 }),
          max:   new fields.NumberField({integer: true,  initial: 3 })
        })
      }),
      combat: new fields.SchemaField({
        damage: new fields.NumberField({integer: true,  initial: 0 }),
        armor:  new fields.NumberField({integer: true,  initial: 0 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "<p><strong>Government:</strong>&nbsp;</p><p><strong>Modifications:</strong>&nbsp;</p><p><strong>Combat:</strong>&nbsp;</p>", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({integer: true,  initial: 0 }),
          hideArchive:     new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}

class VehicleActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 1 }),
        crew:  new fields.NumberField({integer: true,  initial: 1 }),
        weaponSystems: new fields.NumberField({integer: true,  initial: 1 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          hideArchive: new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}

class MarkerActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 0 })
      }),
      pools: new fields.SchemaField({
        quantity: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 0 }),
          max:   new fields.NumberField({integer: true,  initial: 0 }),
        })
      }),
      description: new fields.HTMLField({ textSearch: true }),
      notes: new fields.HTMLField({ textSearch: true }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          isCounter:       new fields.BooleanField({ initial: true }),
          counting:        new fields.NumberField({integer: true,  initial: -1 }),
          hideArchive:     new fields.BooleanField({ initial: false }),
          hideNotes:       new fields.BooleanField({ initial: false }),
          hideDescription: new fields.BooleanField({ initial: false }),
          hideEquipment:   new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}

export function defineActorDataModels() {
  CONFIG.Actor.dataModels = {
    pc: PCActorDataModel,
    npc: NPCActorDataModel,
    companion: CompanionActorDataModel,
    community: CommunityActorDataModel,
    vehicle: VehicleActorDataModel,
    marker: MarkerActorDataModel,
  }
}