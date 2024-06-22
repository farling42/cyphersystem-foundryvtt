const poolNameChoices = {
  Might: "CYPHERSYSTEM.Might",
  Speed: "CYPHERSYSTEM.Speed",
  Intellect: "CYPHERSYSTEM.Intellect",
  Pool: "CYPHERSYSTEM.AnyPool",
  XP: "CYPHERSYSTEM.XP"
}

const skillLevelChoices = {
  Specialized: 'CYPHERSYSTEM.Specialized',
  Trained:   'CYPHERSYSTEM.Trained',
  Practiced: 'CYPHERSYSTEM.Practiced',
  Inability: 'CYPHERSYSTEM.Inability',
}

const armorTypeChoices = {
  ["light armor"]:  'CYPHERSYSTEM.LightArmor',
  ["medium armor"]: 'CYPHERSYSTEM.MediumArmor',
  ["heavy armor"]:  'CYPHERSYSTEM.HeavyArmor',
  ["artifact"]: 'CYPHERSYSTEM.Artifact',
  ["special ability"]: 'CYPHERSYSTEM.SpecialAbility',
  ["n/a"]: 'CYPHERSYSTEM.n/a'
}

const atttackTypeChoices = {
  ["light weapon"]: 'CYPHERSYSTEM.LightWeapon',
  ["medium weapon"]: 'CYPHERSYSTEM.MediumWeapon',
  ["heavy weapon"]: 'CYPHERSYSTEM.HeavyWeapon',
  ["artifact"]: 'CYPHERSYSTEM.Artifact',
  ["special ability"]: 'CYPHERSYSTEM.SpecialAbility',
  ["n/a"]: 'CYPHERSYSTEM.n/a',
}

const modifierChoices = {
  eased:    'CYPHERSYSTEM.easedBy',
  hindered: 'CYPHERSYSTEM.hinderedBy'
}

const lastingDamageChoices = {
  Lasting: 'CYPHERSYSTEM.lastingDamage',
  Permanent: 'CYPHERSYSTEM.permanent'
}

const lastingPoolChoices = {
  Might: "CYPHERSYSTEM.Might",
  Speed: "CYPHERSYSTEM.Speed",
  Intellect: "CYPHERSYSTEM.Intellect"
}

const SpellTierChoices = {
  ["low"]: 'CYPHERSYSTEM.LowTier',
  ["mid"]: 'CYPHERSYSTEM.MidTier',
  ["high"]: 'CYPHERSYSTEM.HighTier'
}

const unmaskedChoices = {
  ["Mask"]: 'CYPHERSYSTEM.Mask',
  ["Teen"]: 'CYPHERSYSTEM.Teen'
}

// The following SORTING choices have dynamically created labels, based on the ACTOR to which the Item is attached.
const AbilitySortingChoices   = [ "Ability", "AbilityTwo", "AbilityThree", "AbilityFour", "Spell" ]
const EquipmentSortingChoices = [ "Equipment", "EquipmentTwo", "EquipmentThree", "EquipmentFour" ]
const SkillSortingChoices     = [ "Skill", "SkillTwo", "SkillThree", "SkillFour" ]
const TagSortingChoices       = [ "Tag", "TagTwo", "TagThree", "TagFour" ]

// VALUE for an array is the INDEX into the array, not the value stored at that position within the array.
const assetsChoices = [ 0, 1, 2 ];
let effortChoices;  // filled with correct translations on first call to defineSchema

// Default options for DataField:
// required: false
// nullable: false
// initial: undefined
// readonly: false
// gmOnly: false
// label: ""
// hint: ""

// Default options for NumberField
// initial: null
// nullable: true
// min: undefined
// max: undefined
// step: undefined
// integer: false
// positive: false
// choices: undefined

// Default options for StringField
// blank: true
// trim: true
// nullable: false
// initial: { !required ? undefined : blank ? "" : nullable ? null : undefined }
// choices: undefined
// textSearch: false

// Default options for HTMLField:
// required: true
// blank: true

// Default options for BooleanField:
// required: true
// nullable: false
// initial: false

// Default options for DocumentUUIDField:
// required: true
// blank: false
// nullable: true
// initial: null
// type: undefined
// embedded: undefined

// Default options for SchemaField:
// required: true
// nullable: false
// initial: { calls this.clean() }

const defaultParams = { required: true, nullable: false };  // Foundry: required: true, nullable: false
const integerParams = { ...defaultParams, integer: true };  // Foundry: nullable: true, integer: false, positive: false
const stringParams  = { ...defaultParams };                 // Foundry: blank: true, trim: true, nullable: false, textSearch: false, initial: (!required ? undefined : blank ? "" : nullable ? null : undefined)
const stringParamsEmpty  = { ...defaultParams, blank: true, initial: "" };   // Foundry: 
const stringParamsNotBlank  = { ...defaultParams, blank: false };   // Foundry: 
const booleanParamsFalse = { ...defaultParams, initial: false };  // Foundry: required: true, nullable: false, initial: false
const booleanParamsTrue  = { ...defaultParams, initial: true };
const htmlParams = { ...defaultParams, textSearch: true };  // Foundry: required: true, blank: true
const htmlParamsBlank = { ...defaultParams, textSearch: true, initial: "" };

const defaultCypherDescription = "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p>";
const defaultArtifactDescription = "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p><p><strong>Depletion:</strong>&nbsp;</p>";


function rollButtonFields(fields) {
  // needs to be called from within `settings`
  return new fields.SchemaField({
    pool:    new fields.StringField({ ...stringParams, initial: "Pool", choices: poolNameChoices }),
    skill:   new fields.StringField({ ...stringParams, initial: "Practiced", choices: skillLevelChoices }),
    assets:  new fields.NumberField({ ...integerParams, initial: 0, min: 0, max: 2, choices: assetsChoices }),
    effort1: new fields.NumberField({ ...integerParams, initial: 0, min: 0, max: 6, choices: effortChoices }),
    effort2: new fields.NumberField({ ...integerParams, initial: 0, min: 0, max: 6, choices: effortChoices }),
    effort3: new fields.NumberField({ ...integerParams, initial: 0, min: 0, max: 6, choices: effortChoices }),
    stepModifier:    new fields.StringField({ ...stringParams, initial: "eased", choices: modifierChoices }),
    additionalSteps: new fields.NumberField({ ...integerParams,  initial: 0 }),
    additionalCost:  new fields.NumberField({ ...integerParams,  initial: 0 }),
    damage: new fields.NumberField({ ...integerParams,  initial: 0 }),
    damagePerLOE: new fields.NumberField({ ...integerParams,  initial: 3 }),
    teen:  new fields.StringField({ ...stringParamsEmpty, choices: unmaskedChoices }),
    bonus: new fields.NumberField({ ...integerParams,  initial: 0 }),
    macroUuid: new fields.DocumentUUIDField({ required: true, nullable: true })
  })
}

class CSBaseItemDataModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {

    // First time setup
    if (!effortChoices) {
      const level = game.i18n.localize('CYPHERSYSTEM.level')
      effortChoices = {
        0: game.i18n.localize("CYPHERSYSTEM.None"),
        1: `1 ${level}`,
        2: `2 ${level}`,
        3: `3 ${level}`,
        4: `4 ${level}`,
        5: `5 ${level}`,
        6: `6 ${level}`
      }    
    }

    const fields = foundry.data.fields;
    return {
      version: new fields.NumberField({ ...integerParams, initial: 2 }),
      description: new fields.HTMLField(htmlParamsBlank),
      archived: new fields.BooleanField(booleanParamsFalse),
    }
  }

  chatDetails() {
    if (this.basic.level) return game.i18n.localize("CYPHERSYSTEM.level") + " " + this.basic.level;
    return "";
  }
}

class AbilityItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        cost: new fields.StringField({ ...stringParamsNotBlank, initial: "0"}),   // might be something like "3+" rather than purely numeric
        pool: new fields.StringField({ ...stringParamsNotBlank, initial: "Pool", choices: poolNameChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ ...stringParamsNotBlank, initial: "Ability", choices: AbilitySortingChoices }),
          spellTier: new fields.StringField({ ...stringParamsNotBlank, initial: "low", choices: SpellTierChoices }),
          unmaskedForm: new fields.StringField({ ...stringParamsNotBlank, initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }

  toAttack() {
    return {
      name: this.parent.name,
      type: "attack",
      "system.basic.type": "special ability",
      "system.settings.rollButton": this.settings.rollButton,
      "system.description": this.description,
      "system.basic.damage": this.settings.rollButton.damage,
      "system.basic.modifier": this.settings.rollButton.stepModifier,
      "system.basic.steps": this.settings.rollButton.additionalSteps,
      "system.basic.skillRating": this.settings.rollButton.skill,
      "system.settings.rollButton.pool": this.basic.pool,
      "system.settings.rollButton.additionalCost": this.basic.cost
    };
  }
  toArmor() {
    return {
      name: this.parent.name,
      type: "armor",
      "system.basic.type": "special ability",
      "system.description": this.description
    }
  };
  toSkill() {
    return {
      name: this.parent.name,
      type: "skill",
      "system.settings.rollButton": this.settings.rollButton,
      "system.description": this.description,
      "system.basic.rating": this.settings.rollButton.skill,
      "system.settings.rollButton.pool": this.basic.pool,
      "system.settings.rollButton.additionalCost": this.basic.cost
    };
  }

  chatDetails() {
    if (this.basic.cost != 0) {
      return this.basic.cost + " " + this.basic.pool + " " + 
        game.i18n.localize((this.basic.cost == "1") ? "CYPHERSYSTEM.Point" : "CYPHERSYSTEM.Points");
    }
    return "";  
  }
}

class AmmoItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams),
        quantity: new fields.NumberField({ ...integerParams, initial: 1 })
      })
    }
  }
}

class ArmorItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        type: new fields.StringField({ ...stringParams, initial: "light armor", choices: armorTypeChoices }),
        rating: new fields.NumberField({ ...integerParams, initial: 0 }),
        cost: new fields.NumberField({ ...integerParams, initial: 0 }),
        notes: new fields.StringField(stringParams),
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ ...stringParams, initial: "Mask", choices: unmaskedChoices })
        })
      }),
      active: new fields.BooleanField(booleanParamsTrue)
    }
  }

  toEquipment() {
    return {
      name: this.parent.name,
      type: "equipment",
      "system.description": this.description
    };
  }

  chatDetails() {
    let result = this.basic.type;
    if (this.basic.notes != "") result += ", " + this.basic.notes;
    return result;
  }
}

class ArtifactItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams),
        depletion: new fields.StringField({ ...stringParams, initial: "1 in [[/r d6]]" }),
        identified: new fields.BooleanField(booleanParamsTrue)
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField(stringParams),
        })
      }),
      description: new fields.HTMLField({ ...htmlParams, initial: defaultArtifactDescription })
    }
  }
}

class AttackItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        type: new fields.StringField({ ...stringParams, initial: "light weapon", choices: atttackTypeChoices }),
        damage: new fields.NumberField({ ...integerParams, initial: 0 }),
        modifier: new fields.StringField({ ...stringParams, initial: "eased", choices: modifierChoices }),
        steps: new fields.NumberField({ ...integerParams, initial: 0 }),
        range: new fields.StringField(stringParams),
        notes: new fields.StringField(stringParams),
        skillRating: new fields.StringField({ ...stringParams, initial: "Practiced", choices: skillLevelChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ ...stringParams, initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }
  toEquipment() {
    return {
      name: this.parent.name,
      type: "equipment",
      "system.description": this.description
    };
  }

  chatDetails() {
    let result = this.basic.type + ", " + this.basic.damage + " " +
      game.i18n.localize((this.basic.damage == 1) ? "CYPHERSYSTEM.PointOfDamage" : "CYPHERSYSTEM.PointsOfDamage");
    if (this.basic.range) result += ", " + this.basic.range;
    if (this.basic.notes) result += ", " + this.basic.notes;
    return result;
  }
}


class CypherItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams),
        identified: new fields.BooleanField(booleanParamsTrue)
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField(stringParams)
        })
      }),
      description: new fields.HTMLField({ ...htmlParams, initial: defaultCypherDescription })
    }
  }
}

class EquipmentItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams),
        quantity: new fields.NumberField({ ...integerParams, initial: 1 })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ ...stringParamsNotBlank, initial: "Equipment", choices: EquipmentSortingChoices })
        })
      })
    }
  }
}

class LastingDamageItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        damage: new fields.NumberField({ ...integerParams, initial: 0 }),
        effect: new fields.StringField(stringParams),
        pool: new fields.StringField({ ...stringParams, initial: "Might",   choices: lastingPoolChoices }),
        type: new fields.StringField({ ...stringParams, initial: "Lasting", choices: lastingDamageChoices })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ ...stringParams, initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }

  chatDetails() {
    let result = this.basic.pool;
    if (this.basic.type == "Permanent") result += ", " + game.i18n.localize("CYPHERSYSTEM.permanent");
    return result;
  }
}

class MaterialItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams),
        quantity: new fields.NumberField({ ...integerParams, initial: 1 })
      })
    }
  }
}

class OddityItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(stringParams)
      })
    }
  }
}

class PowerShiftItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        shifts: new fields.NumberField({ ...integerParams, initial: 1 }),
        temporary: new fields.BooleanField(booleanParamsFalse)
      })
    }
  }
  chatDetails() {
    return this.basic.shifts + " " + game.i18n.localize((this.basic.shifts==1) ? "CYPHERSYSTEM.Shift" : "CYPHERSYSTEM.Shifts");
  }
}

function poolField(fields, name) {
  return new fields.SchemaField({
    value: new fields.NumberField({ ...integerParams, initial: 0 }),
    edge:  new fields.NumberField({ ...integerParams, initial: 0 })
  })
}

class RecursionItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        focus: new fields.StringField(stringParams)
      }),
      settings: new fields.SchemaField({
        statModifiers: new fields.SchemaField({
          might: poolField(fields),
          speed: poolField(fields),
          intellect: poolField(fields)
        })
      }),
      active: new fields.BooleanField(booleanParamsFalse)
    }
  }
}

class SkillItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        rating: new fields.StringField({ ...stringParams, initial: "Trained", choices: skillLevelChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ ...stringParamsNotBlank, initial: "Skill", choices: SkillSortingChoices }),
          initiative: new fields.BooleanField(booleanParamsFalse),
          unmaskedForm: new fields.StringField({ ...stringParamsNotBlank, initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }

  chatDetails() {
    return this.basic.rating;
  }
}

class TagItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ ...stringParamsNotBlank, initial: "Tag", choices: TagSortingChoices })
        }),
        statModifiers: new fields.SchemaField({
          might: poolField(fields),
          speed: poolField(fields),
          intellect: poolField(fields)
        }),
        macroUuid: new fields.DocumentUUIDField(),
      }),
      active: new fields.BooleanField(booleanParamsFalse),
      exclusive: new fields.BooleanField(booleanParamsFalse)
    }
  }
}


export function defineItemDataModels() {
  CONFIG.Item.dataModels = {
    ability: AbilityItemDataModel,
    ammo: AmmoItemDataModel,
    armor: ArmorItemDataModel,
    artifact: ArtifactItemDataModel,
    attack: AttackItemDataModel,
    cypher: CypherItemDataModel,
    equipment: EquipmentItemDataModel,
    ["lasting-damage"]: LastingDamageItemDataModel,
    material: MaterialItemDataModel,
    oddity: OddityItemDataModel,
    ["power-shift"]: PowerShiftItemDataModel,
    recursion: RecursionItemDataModel,
    skill: SkillItemDataModel,
    tag: TagItemDataModel,
  }
}