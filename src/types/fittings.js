// Fitting types
export const FittingType = {
  NONE: 'none',
  ELBOW_90: 'elbow90',
  ELBOW_45: 'elbow45',
  TEE: 'tee',
  COUPLING: 'coupling',
  REDUCER: 'reducer',
  CAP: 'cap',
  VALVE: 'valve',
  FLANGE: 'flange',
};

export const FittingTypeInfo = {
  [FittingType.NONE]: { symbol: '○', displayName: 'None' },
  [FittingType.ELBOW_90]: { symbol: '⌐', displayName: '90° Elbow' },
  [FittingType.ELBOW_45]: { symbol: '⌐', displayName: '45° Elbow' },
  [FittingType.TEE]: { symbol: '⊥', displayName: 'Tee' },
  [FittingType.COUPLING]: { symbol: '=', displayName: 'Coupling' },
  [FittingType.REDUCER]: { symbol: '◡', displayName: 'Reducer' },
  [FittingType.CAP]: { symbol: '⌢', displayName: 'Cap' },
  [FittingType.VALVE]: { symbol: '◆', displayName: 'Valve' },
  [FittingType.FLANGE]: { symbol: '⊗', displayName: 'Flange' },
};

// Pipe sizes
export const PipeSize = {
  NONE: 'none',
  HALF: 'half',
  THREE_QUARTER: 'threeQuarter',
  ONE: 'one',
  ONE_AND_QUARTER: 'oneAndQuarter',
  ONE_AND_HALF: 'oneAndHalf',
  TWO: 'two',
  TWO_AND_HALF: 'twoAndHalf',
  THREE: 'three',
  FOUR: 'four',
  SIX: 'six',
  EIGHT: 'eight',
  TEN: 'ten',
  TWELVE: 'twelve',
};

export const PipeSizeInfo = {
  [PipeSize.NONE]: { shortName: '-', nominalDiameter: 0, outerDiameter: 0 },
  [PipeSize.HALF]: { shortName: '½"', nominalDiameter: 0.5, outerDiameter: 0.84 },
  [PipeSize.THREE_QUARTER]: { shortName: '¾"', nominalDiameter: 0.75, outerDiameter: 1.05 },
  [PipeSize.ONE]: { shortName: '1"', nominalDiameter: 1, outerDiameter: 1.315 },
  [PipeSize.ONE_AND_QUARTER]: { shortName: '1¼"', nominalDiameter: 1.25, outerDiameter: 1.66 },
  [PipeSize.ONE_AND_HALF]: { shortName: '1½"', nominalDiameter: 1.5, outerDiameter: 1.9 },
  [PipeSize.TWO]: { shortName: '2"', nominalDiameter: 2, outerDiameter: 2.375 },
  [PipeSize.TWO_AND_HALF]: { shortName: '2½"', nominalDiameter: 2.5, outerDiameter: 2.875 },
  [PipeSize.THREE]: { shortName: '3"', nominalDiameter: 3, outerDiameter: 3.5 },
  [PipeSize.FOUR]: { shortName: '4"', nominalDiameter: 4, outerDiameter: 4.5 },
  [PipeSize.SIX]: { shortName: '6"', nominalDiameter: 6, outerDiameter: 6.625 },
  [PipeSize.EIGHT]: { shortName: '8"', nominalDiameter: 8, outerDiameter: 8.625 },
  [PipeSize.TEN]: { shortName: '10"', nominalDiameter: 10, outerDiameter: 10.75 },
  [PipeSize.TWELVE]: { shortName: '12"', nominalDiameter: 12, outerDiameter: 12.75 },
};

// Valve types
export const ValveType = {
  GATE: 'gate',
  GLOBE: 'globe',
  CHECK: 'check',
  BALL: 'ball',
  BUTTERFLY: 'butterfly',
  PLUG: 'plug',
};

export const ValveTypeInfo = {
  [ValveType.GATE]: { symbol: '◊', displayName: 'Gate' },
  [ValveType.GLOBE]: { symbol: '◆', displayName: 'Globe' },
  [ValveType.CHECK]: { symbol: '⊙', displayName: 'Check' },
  [ValveType.BALL]: { symbol: '●', displayName: 'Ball' },
  [ValveType.BUTTERFLY]: { symbol: '⬤', displayName: 'Butterfly' },
  [ValveType.PLUG]: { symbol: '◉', displayName: 'Plug' },
};

// System types
export const SystemType = {
  HOT_WATER: 'hotWater',
  COLD_WATER: 'coldWater',
  CHILLED_WATER: 'chilledWater',
  GAS: 'gas',
  HVAC: 'hvac',
  DRAIN: 'drain',
  VENT: 'vent',
  STEAM: 'steam',
  COMPRESSED_AIR: 'compressedAir',
  CUSTOM: 'custom',
};

export const SystemTypeInfo = {
  [SystemType.HOT_WATER]: { color: '#FF6B6B', displayName: 'Hot Water' },
  [SystemType.COLD_WATER]: { color: '#4ECDC4', displayName: 'Cold Water' },
  [SystemType.CHILLED_WATER]: { color: '#45B7D1', displayName: 'Chilled Water' },
  [SystemType.GAS]: { color: '#FFD93D', displayName: 'Gas' },
  [SystemType.HVAC]: { color: '#6C5CE7', displayName: 'HVAC' },
  [SystemType.DRAIN]: { color: '#A29BFE', displayName: 'Drain' },
  [SystemType.VENT]: { color: '#74B9FF', displayName: 'Vent' },
  [SystemType.STEAM]: { color: '#FFA502', displayName: 'Steam' },
  [SystemType.COMPRESSED_AIR]: { color: '#FDCB6E', displayName: 'Compressed Air' },
  [SystemType.CUSTOM]: { color: '#888888', displayName: 'Custom' },
};

// Measurement types
export const MeasurementType = {
  FACE_TO_CENTER: 'F-C',
  END_TO_CENTER: 'E-C',
  CENTER_TO_CENTER: 'C-C',
};

// O'let types
export const OletType = {
  WELDOLET: 'weldolet',
  THREADOLET: 'threadolet',
  SOCKOLET: 'sockolet',
  LATROLET: 'latrolet',
  ELBOLET: 'elbolet',
};

export const OletTypeInfo = {
  [OletType.WELDOLET]: { symbol: '◇', displayName: 'Weldolet' },
  [OletType.THREADOLET]: { symbol: '◇', displayName: 'Threadolet' },
  [OletType.SOCKOLET]: { symbol: '◇', displayName: 'Sockolet' },
  [OletType.LATROLET]: { symbol: '◇', displayName: 'Latrolet' },
  [OletType.ELBOLET]: { symbol: '◇', displayName: 'Elbolet' },
};
