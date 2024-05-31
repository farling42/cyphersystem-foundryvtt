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

const AbilitySortingChoices = [ "Ability", "AbilityTwo", "AbilityThree", "AbilityFour", "Spell" ]
const EquipmentSortingChoices = [ "Equipment", "EquipmentTwo", "EquipmentThree", "EquipmentFour" ]
const SkillSortingChoices = [ "Skill", "SkillTwo", "SkillThree", "SkillFour" ]
const TagSortingChoices = [ "Tag", "TagTwo", "TagThree", "TagFour" ]

// VALUE for an array is the INDEX into the array, not the value stored at that position within the array.
const assetsChoices = [ 0, 1, 2 ];
const effortChoices = [ 0, 1, 2, 3, 4, 5, 6 ];

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

function rollButtonFields(fields) {
  // needs to be called from within `settings`
  return new fields.SchemaField({
    pool:    new fields.StringField({ required: true, initial: "Pool", choices: poolNameChoices }),
    skill:   new fields.StringField({ required: true, initial: "Practiced", choices: skillLevelChoices }),
    assets:  new fields.NumberField({integer: true,  initial: 0, choices: assetsChoices }),
    effort1: new fields.NumberField({integer: true,  initial: 0, choices: effortChoices }),
    effort2: new fields.NumberField({integer: true,  initial: 0, choices: effortChoices }),
    effort3: new fields.NumberField({integer: true,  initial: 0, choices: effortChoices }),
    stepModifier:    new fields.StringField({ initial: "eased", choices: modifierChoices }),
    additionalSteps: new fields.NumberField({integer: true,  initial: 0 }),
    additionalCost:  new fields.NumberField({integer: true,  initial: 0 }),
    damage: new fields.NumberField({integer: true,  initial: 0 }),
    damagePerLOE: new fields.NumberField({integer: true,  initial: 3 }),
    teen:  new fields.StringField({ initial: "", blank: true, choices: unmaskedChoices }),
    bonus: new fields.NumberField({integer: true,  initial: 0 }),
    macroUuid: new fields.DocumentUUIDField({ nullable: true })
  })
}

class CSBaseItemDataModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      version: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 2 }),
      description: new fields.HTMLField({ textSearch: true }),
      archived: new fields.BooleanField({ required: true, initial: false }),
    }
  }
}

class AbilityItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        cost: new fields.NumberField({integer: true}),
        pool: new fields.StringField({ initial: "Pool", choices: poolNameChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Ability", choices: AbilitySortingChoices }),
          spellTier: new fields.StringField({ initial: "low", choices: SpellTierChoices }),
          unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }
}

class AmmoItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({integer: true, initial: 1 })
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
        type: new fields.StringField({ initial: "light armor", choices: armorTypeChoices }),
        rating: new fields.NumberField({ integer: true, initial: 0 }),
        cost: new fields.NumberField({ integer: true, initial: 0 }),
        notes: new fields.StringField(),
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedChoices })
        })
      }),
      active: new fields.BooleanField({ initial: true })
    }
  }
}

class ArtifactItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        depletion: new fields.StringField({ initial: "1 in [[/r d6]]" }),
        identified: new fields.BooleanField({ initial: true })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField(),
        })
      }),
      description: new fields.HTMLField({ initial: "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p><p><strong>Depletion:</strong>&nbsp;</p>", textSearch: true })
    }
  }
}

class AttackItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        type: new fields.StringField({ initial: "light weapon", choices: atttackTypeChoices }),
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        modifier: new fields.StringField({ initial: "eased", choices: modifierChoices }),
        steps: new fields.NumberField({ integer: true, initial: 0 }),
        range: new fields.StringField(),
        notes: new fields.StringField(),
        skillRating: new fields.StringField({ required: true, initial: "Practiced", choices: skillLevelChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }
}

class CypherItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        identified: new fields.BooleanField({ initial: true })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField()
        })
      }),
      description: new fields.HTMLField({ initial: "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p>", textSearch: true })
    }
  }
}

class EquipmentItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Equipment", choices: EquipmentSortingChoices })
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
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        effect: new fields.StringField(),
        pool: new fields.StringField({ initial: "Might",   choices: lastingPoolChoices }),
        type: new fields.StringField({ initial: "Lasting", choices: lastingDamageChoices })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }
}

class MaterialItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
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
        level: new fields.StringField()
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
        shifts: new fields.NumberField({ integer: true, initial: 1 }),
        temporary: new fields.BooleanField({ initial: false })
      })
    }
  }
}

function poolField(fields, name) {
  return new fields.SchemaField({
    value: new fields.NumberField({ integer: true, initial: 0 }),
    edge:  new fields.NumberField({ integer: true, initial: 0 })
  })
}

class RecursionItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        focus: new fields.StringField()
      }),
      settings: new fields.SchemaField({
        statModifiers: new fields.SchemaField({
          might: poolField(fields),
          speed: poolField(fields),
          intellect: poolField(fields)
        })
      }),
      active: new fields.BooleanField({ initial: false })
    }
  }
}

class SkillItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      basic: new fields.SchemaField({
        rating: new fields.StringField({ initial: "Trained", choices: skillLevelChoices })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Skill", choices: SkillSortingChoices }),
          initiative: new fields.BooleanField({ initial: false }),
          unmaskedForm: new fields.StringField({ initial: "Mask", choices: unmaskedChoices })
        })
      })
    }
  }
}

class TagItemDataModel extends CSBaseItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(fields),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Tag", choices: TagSortingChoices })
        }),
        statModifiers: new fields.SchemaField({
          might: poolField(fields),
          speed: poolField(fields),
          intellect: poolField(fields)
        }),
        macroUuid: new fields.DocumentUUIDField(),
      }),
      active: new fields.BooleanField({ initial: false }),
      exclusive: new fields.BooleanField({ initial: false })
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