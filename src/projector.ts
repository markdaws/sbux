export default class Projector {
  public position: THREE.Vector3
  public nativeResolution: THREE.Vector2

  constructor(position: THREE.Vector3, nativeResolution: THREE.Vector2) {
    this.position = position
    this.nativeResolution = nativeResolution
  }
}