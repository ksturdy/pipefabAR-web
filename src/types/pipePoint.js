import { FittingType, PipeSize, MeasurementType } from './fittings'

export class PipePoint {
  constructor(id, position, fittingType = FittingType.NONE, pipeSize = PipeSize.ONE) {
    this.id = id
    this.position = position // { x, y } in canvas coordinates
    this.fittingType = fittingType
    this.pipeSize = pipeSize
    this.measurementType = MeasurementType.FACE_TO_CENTER
    this.fittingOrientation = null // Angle in degrees 0-360
    this.branchParentId = null // For branch points, ID of parent tee
    this.olets = [] // Array of Olet objects
    this.dimensionLabelOffset = { x: 0, y: 0 }
    this.sizeLabelOffset = { x: 0, y: 0 }
    this.bubbleLabelOffset = { x: 0, y: 0 }
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      fittingType: this.fittingType,
      pipeSize: this.pipeSize,
      measurementType: this.measurementType,
      fittingOrientation: this.fittingOrientation,
      branchParentId: this.branchParentId,
      olets: this.olets,
      dimensionLabelOffset: this.dimensionLabelOffset,
      sizeLabelOffset: this.sizeLabelOffset,
      bubbleLabelOffset: this.bubbleLabelOffset,
    }
  }

  static fromJSON(data) {
    const point = new PipePoint(data.id, data.position, data.fittingType, data.pipeSize)
    point.measurementType = data.measurementType || MeasurementType.FACE_TO_CENTER
    point.fittingOrientation = data.fittingOrientation
    point.branchParentId = data.branchParentId
    point.olets = data.olets || []
    point.dimensionLabelOffset = data.dimensionLabelOffset || { x: 0, y: 0 }
    point.sizeLabelOffset = data.sizeLabelOffset || { x: 0, y: 0 }
    point.bubbleLabelOffset = data.bubbleLabelOffset || { x: 0, y: 0 }
    return point
  }
}

export class Olet {
  constructor(id, type, position, orientation, size) {
    this.id = id
    this.type = type
    this.position = position // 0.0-1.0 along segment
    this.orientation = orientation // Angle 0-360
    this.size = size
    this.dimensionLabelOffset = { x: 0, y: 0 }
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      orientation: this.orientation,
      size: this.size,
      dimensionLabelOffset: this.dimensionLabelOffset,
    }
  }

  static fromJSON(data) {
    const olet = new Olet(data.id, data.type, data.position, data.orientation, data.size)
    olet.dimensionLabelOffset = data.dimensionLabelOffset || { x: 0, y: 0 }
    return olet
  }
}
