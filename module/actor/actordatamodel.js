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

const defaultParams = { required: true, nullable: false };  // Foundry: required: true, nullable: false
const integerParams = { ...defaultParams, integer: true };  // Foundry: nullable: true, integer: false, positive: false
const stringParams  = { ...defaultParams };                 // Foundry: blank: true, trim: true, nullable: false, textSearch: false, initial: (!required ? undefined : blank ? "" : nullable ? null : undefined)
const stringParamsEmpty  = { ...defaultParams, blank: true, initial: "" };   // Foundry: 
const booleanParamsFalse = { ...defaultParams, initial: false };  // Foundry: required: true, nullable: false, initial: false
const booleanParamsTrue  = { ...defaultParams, initial: true };
const htmlParams = { ...defaultParams, textSearch: true };  // Foundry: required: true, blank: true
const htmlParamsBlank = { ...defaultParams, textSearch: true, initial: "" };

const defaultNPCnotes       = "<p>[Description]</p><p><strong>Motive:</strong>&nbsp;</p><p><strong>Environment:</strong>&nbsp;</p><p><strong>Health:</strong>&nbsp;</p><p><strong>Damage Inflicted:</strong>&nbsp;</p><p><strong>Movement:</strong>&nbsp;</p><p><strong>Modifications:</strong>&nbsp;</p><p><strong>Combat:</strong>&nbsp;</p><p><strong>Interaction:</strong>&nbsp;</p><p><strong>Use:</strong>&nbsp;</p><p><strong>Loot:</strong>&nbsp;</p><p><strong>GM Intrusion:</strong>&nbsp;</p>";
const defaultCompanionNotes = "<p><strong>Character Benefit:</strong>&nbsp;</p><p><strong>Background:</strong>&nbsp;</p><p><strong>Description:</strong>&nbsp;</p>"
const defaultCommunityNotes = "<p><strong>Government:</strong>&nbsp;</p><p><strong>Modifications:</strong>&nbsp;</p><p><strong>Combat:</strong>&nbsp;</p>";

class CSBaseActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      version: new fields.NumberField({ ...integerParams,  initial: 3 }),
    }
  }
}

class PCActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        descriptor: new fields.StringField({ ...stringParamsEmpty, textSearch: true}),
        type:  new fields.StringField({ ...stringParamsEmpty, textSearch: true }),
        focus: new fields.StringField({ ...stringParamsEmpty, textSearch: true }),
        additionalSentence: new fields.StringField({ ...stringParamsEmpty, textSearch: true }),
        unmaskedForm: new fields.StringField({ ...stringParams, initial: "Mask", choices: unmaskedFormChoices }),
        tier:   new fields.NumberField({ ...integerParams, initial: 1 }),
        effort: new fields.NumberField({ ...integerParams, initial: 1, min: 0, max: 6 }),
        xp:     new fields.NumberField({ ...integerParams, initial: 0 }),
        advancement: new fields.SchemaField({
          stats:  new fields.BooleanField(booleanParamsFalse),
          effort: new fields.BooleanField(booleanParamsFalse),
          edge:   new fields.BooleanField(booleanParamsFalse),
          skill:  new fields.BooleanField(booleanParamsFalse),
          other:  new fields.BooleanField(booleanParamsFalse)
        }),
        gmiRange: new fields.NumberField({...integerParams, initial: 1 })
      }),
      pools: new fields.SchemaField({
        might: new fields.SchemaField({
          value: new fields.NumberField({...integerParams , initial: 10 }),
          max:   new fields.NumberField({ ...integerParams, initial: 10 }),
          edge:  new fields.NumberField({ ...integerParams, initial: 0 })
        }),
        speed: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams, initial: 10 }),
          max:   new fields.NumberField({ ...integerParams, initial: 10 }),
          edge:  new fields.NumberField({ ...integerParams, initial: 0 })
        }),
        intellect: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams, initial: 10 }),
          max:   new fields.NumberField({ ...integerParams, initial: 10 }),
          edge:  new fields.NumberField({ ...integerParams, initial: 0 })
        }),
        additional: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams, initial: 3 }),
          max:   new fields.NumberField({ ...integerParams, initial: 3 }),
          edge:  new fields.NumberField({ ...integerParams, initial: 0 })
        })
      }),
      combat: new fields.SchemaField({
        recoveries: new fields.SchemaField({
          roll: new fields.StringField({ ...stringParams, initial: "1d6+1" }),
          oneAction: new fields.BooleanField(booleanParamsFalse),
          oneAction2: new fields.BooleanField(booleanParamsFalse),
          oneAction3: new fields.BooleanField(booleanParamsFalse),
          oneAction4: new fields.BooleanField(booleanParamsFalse),
          oneAction5: new fields.BooleanField(booleanParamsFalse),
          oneAction6: new fields.BooleanField(booleanParamsFalse),
          oneAction7: new fields.BooleanField(booleanParamsFalse),
          tenMinutes: new fields.BooleanField(booleanParamsFalse),
          tenMinutes2: new fields.BooleanField(booleanParamsFalse),
          oneHour:  new fields.BooleanField(booleanParamsFalse),
          tenHours: new fields.BooleanField(booleanParamsFalse)
        }),
        damageTrack: new fields.SchemaField({
          state: new fields.StringField({ ...stringParams, initial: "Hale", choices: damageTrackChoices }),
          applyImpaired: new fields.BooleanField(booleanParamsTrue),
          applyDebilitated: new fields.BooleanField(booleanParamsTrue)
        }),
        armor: new fields.SchemaField({
          ratingTotal: new fields.NumberField({ ...integerParams,  initial: 0 }),
          costTotal:   new fields.NumberField({ ...integerParams,  initial: 0 })
        })
      }),
      abilities: new fields.SchemaField({
        preparedSpells: new fields.NumberField({ ...integerParams,  initial: 0 })
      }),
      equipment: new fields.SchemaField({
        cypherLimit: new fields.NumberField({ ...integerParams,  initial: 2 })
      }),
      notes: new fields.HTMLField({ ...htmlParamsBlank }),
      gmNotes: new fields.HTMLField({ ...htmlParamsBlank }),
      description: new fields.HTMLField({ ...htmlParamsBlank }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          gameMode: new fields.StringField({ ...stringParams, initial: "Cypher", blank: false, choices: gameModeChoices }),
          additionalSentence: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          additionalPool: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty),
            hasEdge: new fields.BooleanField(booleanParamsFalse)
          }),
          tags: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            labelCategory1: new fields.StringField(stringParamsEmpty),
            labelCategory2: new fields.StringField(stringParamsEmpty),
            labelCategory3: new fields.StringField(stringParamsEmpty),
            labelCategory4: new fields.StringField(stringParamsEmpty)
          }),
          hideArchive: new fields.BooleanField(booleanParamsFalse),
          hideEmptyCategories: new fields.BooleanField(booleanParamsFalse),
          customSheetDesign: new fields.BooleanField(booleanParamsFalse),
          background: new fields.SchemaField({
            image: new fields.StringField({ ...stringParams, initial: "foundry", choices: bgImageChoices }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
            icon: new fields.StringField({ ...stringParams, initial: "none", choices: bgIconChoices }),
            iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
            iconOpacity: new fields.AlphaField({ initial: 0.5 })
          }),
          logo: new fields.SchemaField({
            image: new fields.StringField({ ...stringParams, initial: "black", choices: logoImageChoices }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            imageOpacity: new fields.AlphaField({ initial: 1 })
          })
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField(booleanParamsFalse),
          labelCategory1: new fields.StringField(stringParamsEmpty),
          labelCategory2: new fields.StringField(stringParamsEmpty),
          labelCategory3: new fields.StringField(stringParamsEmpty),
          labelCategory4: new fields.StringField(stringParamsEmpty),
          powerShifts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          })
        }),
        combat: new fields.SchemaField({
          numberOneActionRecoveries: new fields.NumberField({ ...integerParams,  initial: 1, choices: OneActionRecoveryChoices }),
          numberTenMinuteRecoveries: new fields.NumberField({ ...integerParams,  initial: 1, choices: TenMinuteRecoveryChoices }),
          lastingDamage: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          })
        }),
        abilities: new fields.SchemaField({
          labelCategory1: new fields.StringField(stringParamsEmpty),
          labelCategory2: new fields.StringField(stringParamsEmpty),
          labelCategory3: new fields.StringField(stringParamsEmpty),
          labelCategory4: new fields.StringField(stringParamsEmpty),
          labelSpells: new fields.StringField(stringParamsEmpty)
        }),
        equipment: new fields.SchemaField({
          labelCategory1: new fields.StringField(stringParamsEmpty),
          labelCategory2: new fields.StringField(stringParamsEmpty),
          labelCategory3: new fields.StringField(stringParamsEmpty),
          labelCategory4: new fields.StringField(stringParamsEmpty),
          currency: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            hideLabels: new fields.BooleanField(booleanParamsFalse),
            numberCategories: new fields.NumberField({ ...integerParams,  initial: 1, choices: currencyChoices }),
            labelCategory1: new fields.StringField(stringParamsEmpty),
            labelCategory2: new fields.StringField(stringParamsEmpty),
            labelCategory3: new fields.StringField(stringParamsEmpty),
            labelCategory4: new fields.StringField(stringParamsEmpty),
            labelCategory5: new fields.StringField(stringParamsEmpty),
            labelCategory6: new fields.StringField(stringParamsEmpty),
            quantity1: new fields.NumberField({ ...integerParams,  initial: 0 }),
            quantity2: new fields.NumberField({ ...integerParams,  initial: 0 }),
            quantity3: new fields.NumberField({ ...integerParams,  initial: 0 }),
            quantity4: new fields.NumberField({ ...integerParams,  initial: 0 }),
            quantity5: new fields.NumberField({ ...integerParams,  initial: 0 }),
            quantity6: new fields.NumberField({ ...integerParams,  initial: 0 })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsTrue),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            sortyByLevel: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          })
        })
      }),
      teen: new fields.SchemaField({
        basic: new fields.SchemaField({
          name: new fields.StringField(stringParamsEmpty),
          img:  new fields.FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
          descriptor: new fields.StringField(stringParamsEmpty)
        }),
        pools: new fields.SchemaField({
          might: new fields.SchemaField({
            value: new fields.NumberField({ ...integerParams,  initial: 6 }),
            max:   new fields.NumberField({ ...integerParams,  initial: 6 }),
            edge:  new fields.NumberField({ ...integerParams,  initial: 0 })
          }),
          speed: new fields.SchemaField({
            value: new fields.NumberField({ ...integerParams,  initial: 6 }),
            max:   new fields.NumberField({ ...integerParams,  initial: 6 }),
            edge:  new fields.NumberField({ ...integerParams,  initial: 0 })
          }),
          intellect: new fields.SchemaField({
            value: new fields.NumberField({ ...integerParams,  initial: 6 }),
            max:   new fields.NumberField({ ...integerParams,  initial: 6 }),
            edge:  new fields.NumberField({ ...integerParams,  initial: 0 })
          }),
          additional: new fields.SchemaField({
            value: new fields.NumberField({ ...integerParams,  initial: 3 }),
            max:   new fields.NumberField({ ...integerParams,  initial: 3 })
          })
        }),
        combat: new fields.SchemaField({
          damageTrack: new fields.SchemaField({
            state: new fields.StringField({ ...stringParams, initial: "Hale", choices: damageTrackChoices }),
            applyImpaired:    new fields.BooleanField(booleanParamsTrue),
            applyDebilitated: new fields.BooleanField(booleanParamsTrue)
          }),
          armor: new fields.SchemaField({
            ratingTotal: new fields.NumberField({ ...integerParams,  initial: 0 }),
            costTotal:   new fields.NumberField({ ...integerParams,  initial: 0 })
          })
        }),
        notes: new fields.HTMLField({ ...htmlParamsBlank }),
        description: new fields.HTMLField({ ...htmlParamsBlank }),
        settings: new fields.SchemaField({
          general: new fields.SchemaField({
            additionalPool: new fields.SchemaField({
              label: new fields.StringField(stringParamsEmpty),
              active: new fields.BooleanField(booleanParamsFalse)
            }),
            customSheetDesign: new fields.BooleanField(booleanParamsFalse),
            background: new fields.SchemaField({
              image: new fields.StringField({ ...stringParams, initial: "foundry", choices: bgImageChoices }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
              overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
              icon: new fields.StringField({ ...stringParams, initial: "none", choices: bgIconChoices }),
              iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
              iconOpacity: new fields.AlphaField({ initial: 0.5 })
            }),
            logo: new fields.SchemaField({
              image: new fields.StringField({ ...stringParams, initial: "black", choices: logoImageChoices }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] })
            })
          })
        })
      })
    }
  }

  get isTeen() {
    return this.settings.general.gameMode === "Unmasked" && this.basic.unmaskedForm === "Teen";
  }
}

class NPCActorDataModel extends CSBaseActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({ ...integerParams,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams,  initial: 3 }),
          max:   new fields.NumberField({ ...integerParams,  initial: 3 })
        })
      }),
      combat: new fields.SchemaField({
        damage: new fields.NumberField({ ...integerParams,  initial: 1 }),
        armor:  new fields.NumberField({ ...integerParams,  initial: 0 })
      }),
      description: new fields.HTMLField({ ...htmlParamsBlank }),
      notes: new fields.HTMLField({ ...htmlParams, initial: defaultNPCnotes }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({ ...integerParams,  initial: 0 }),
          hideArchive:     new fields.BooleanField(booleanParamsFalse)
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
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
        level: new fields.NumberField({ ...integerParams,  initial: 3 }),
        disposition: new fields.StringField(stringParamsEmpty),
        category: new fields.StringField(stringParamsEmpty),
        ownedBy: new fields.StringField(stringParamsEmpty)
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams,  initial: 8 }),
          max:   new fields.NumberField({ ...integerParams,  initial: 8 })
        })
      }),
      combat: new fields.SchemaField({
        armor:  new fields.NumberField({ ...integerParams,  initial: 0 }),
        damage: new fields.NumberField({ ...integerParams,  initial: 3 })
      }),
      description: new fields.HTMLField({ ...htmlParamsBlank }),
      notes: new fields.HTMLField({ ...htmlParams, initial: defaultCompanionNotes }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({ ...integerParams,  initial: 0 }),
          hideArchive: new fields.BooleanField(booleanParamsFalse)
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField(booleanParamsFalse)
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
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
        rank: new fields.NumberField({ ...integerParams,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams,  initial: 3 }),
          max:   new fields.NumberField({ ...integerParams,  initial: 3 })
        }),
        infrastructure: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams,  initial: 3 }),
          max:   new fields.NumberField({ ...integerParams,  initial: 3 })
        })
      }),
      combat: new fields.SchemaField({
        damage: new fields.NumberField({ ...integerParams,  initial: 0 }),
        armor:  new fields.NumberField({ ...integerParams,  initial: 0 })
      }),
      description: new fields.HTMLField({ ...htmlParamsBlank }),
      notes: new fields.HTMLField({ ...htmlParams, initial: defaultCommunityNotes }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({ ...integerParams,  initial: 0 }),
          hideArchive:     new fields.BooleanField(booleanParamsFalse)
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
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
        level: new fields.NumberField({ ...integerParams,  initial: 1 }),
        crew:  new fields.NumberField({ ...integerParams,  initial: 1 }),
        weaponSystems: new fields.NumberField({ ...integerParams,  initial: 1 })
      }),
      description: new fields.HTMLField({ ...htmlParamsBlank }),
      notes: new fields.HTMLField({ ...htmlParamsBlank }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          hideArchive: new fields.BooleanField(booleanParamsFalse)
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
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
        level: new fields.NumberField({ ...integerParams,  initial: 0 })
      }),
      pools: new fields.SchemaField({
        quantity: new fields.SchemaField({
          value: new fields.NumberField({ ...integerParams,  initial: 0 }),
          max:   new fields.NumberField({ ...integerParams,  initial: 0 }),
        })
      }),
      description: new fields.HTMLField({ ...htmlParams }),
      notes: new fields.HTMLField({ ...htmlParams }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          isCounter:       new fields.BooleanField(booleanParamsTrue),
          counting:        new fields.NumberField({ ...integerParams,  initial: -1 }),
          hideArchive:     new fields.BooleanField(booleanParamsFalse),
          hideNotes:       new fields.BooleanField(booleanParamsFalse),
          hideDescription: new fields.BooleanField(booleanParamsFalse),
          hideEquipment:   new fields.BooleanField(booleanParamsFalse)
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse)
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField(booleanParamsFalse),
            label: new fields.StringField(stringParamsEmpty)
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