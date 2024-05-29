function baseFields(fields) {
  return {
    version: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 2 }),
    description: new fields.HTMLField({ required: false, textSearch: true }),
    archived: new fields.BooleanField({ required: true, initial: false }),
  }
}

function rollButtonFields(fields) {
  // needs to be called from within `settings`
  return new fields.SchemaField({
    pool: new fields.StringField({ initial: "Pool" }),
    skill: new fields.StringField({ initial: "Practised" }),
    assets: new fields.NumberField({integer: true,  initial: 0 }),
    effort1: new fields.NumberField({integer: true,  initial: 0 }),
    effort2: new fields.NumberField({integer: true,  initial: 0 }),
    effort3: new fields.NumberField({integer: true,  initial: 0 }),
    stepModifier: new fields.StringField({ initial: "eased" }),
    additionalSteps: new fields.NumberField({integer: true,  initial: 0 }),
    additionalCost: new fields.NumberField({integer: true,  initial: 0 }),
    damage: new fields.NumberField({integer: true,  initial: 0 }),
    damagePerLOE: new fields.NumberField({integer: true,  initial: 3 }),
    teen: new fields.StringField({ initial: "" }),
    bonus: new fields.NumberField({integer: true,  initial: 0 }),
    macroUuid: new fields.DocumentUUIDField({ nullable: true })
  })
}

class AbilityItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        cost: new fields.NumberField({integer: true}),
        pool: new fields.StringField({ initial: "Pool" })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Ability" }),
          spellTier: new fields.StringField({ initial: "low" }),
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}

class AmmoItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({integer: true, initial: 1 })
      })
    }
  }
}

class ArmorItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        type: new fields.StringField({ initial: "light armor" }),
        rating: new fields.NumberField({ integer: true, initial: 0 }),
        cost: new fields.NumberField({ integer: true, initial: 0 }),
        notes: new fields.StringField(),
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      }),
      active: new fields.BooleanField({ initial: true })
    }
  }
}

class ArtifactItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
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

class AttackItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        type: new fields.StringField({ initial: "light weapon" }),
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        modifier: new fields.StringField({ initial: "eased" }),
        steps: new fields.NumberField({ integer: true, initial: 0 }),
        range: new fields.StringField(),
        notes: new fields.StringField(),
        skillRating: new fields.StringField({ initial: "Practised" })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}

class CypherItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
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

class EquipmentItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Equipment}" })
        })
      })
    }
  }
}

class LastingDamageItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        effect: new fields.StringField(),
        pool: new fields.StringField({ initial: "Might" }),
        type: new fields.StringField({ initial: "Lasting" })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}

class MaterialItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField(),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
      })
    }
  }
}

class OddityItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        level: new fields.StringField()
      })
    }
  }
}

class PowerShiftItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
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

class RecursionItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
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

class SkillItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      basic: new fields.SchemaField({
        rating: new fields.StringField({ initial: "Trained" })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonFields(fields),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Skill" }),
          initiative: new fields.BooleanField({ initial: false }),
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}

class TagItemDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...baseFields(fields),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Tag" })
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