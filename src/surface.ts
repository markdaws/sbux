import Camera from './camera'
import Drink from './widgets/drink'
import Order, { Source } from './order'
import Projector from './projector'
import Queue from './widgets/queue'
import Tracker, { Marker, Corner } from './tracker'

// TODO: Fix types
declare var d3: any;

const INCH_TO_CM = 2.54

export default class Surface {
  private dimension: THREE.Vector2
  private isDebug: boolean
  private projector: Projector
  private camera: Camera
  private orders: Order[]
  private tracker: Tracker
  private markers: Map<string, Marker> = new Map()
  private svg: any
  private surfaceBoundsInCameraSpace: {
    topLeft: THREE.Vector2,
    width: number,
    height: number
  }
  private dimensionInCm: THREE.Vector2
  private cameraPixelToCm: number

  constructor(dimension: THREE.Vector2, isDebug: boolean) {
    this.dimension = dimension
    this.isDebug = isDebug
    this.orders = []
    this.svg = d3.select('svg')
    this.projector = new Projector(
      new THREE.Vector3(13.5 * INCH_TO_CM, 0, 41 * INCH_TO_CM),
      new THREE.Vector2(800, 480)
    )
    this.camera = new Camera(
      new THREE.Vector3(),
      new THREE.Vector2(1280, 720)
    )

    // TODO: We can easily work this value out automatically, once the 
    // 3D hardware parameters are known, such as physical position etc.
    this.surfaceBoundsInCameraSpace = {
      topLeft: new THREE.Vector2(22, 76),
      width: 396 - 22,
      height: 309 - 76
    }

    this.dimensionInCm = new THREE.Vector2(21.5 * INCH_TO_CM, 14 * INCH_TO_CM)
    this.cameraPixelToCm = this.dimensionInCm.x / this.surfaceBoundsInCameraSpace.width

    Drink.setup(this.svg)
    Queue.setup(this.svg)
  }

  public async init() {
    if (this.isDebug) {
      document.getElementById('surface').classList.add('debug')
    }

    const track = true
    if (track) {
      this.tracker = new Tracker(
        this.camera,
        document.getElementById("video") as HTMLVideoElement,
        document.getElementById("canvas") as HTMLCanvasElement,
        true,
        this.isDebug
      )
      await this.tracker.start()

      // TODO: Don't need to do this so frequently
      let count = 0;
      const detect = () => {
        requestAnimationFrame(detect)
        count++
        if (count < 5) {
          return
        }
        count = 0
        const ms = this.tracker.detect() || []
        // NOTE: The marker positions are in camera space
        this.markers.clear()

        const sx = this.dimension.x / this.surfaceBoundsInCameraSpace.width
        const sy = this.dimension.y / this.surfaceBoundsInCameraSpace.height
        ms.forEach(m => {
          this.markers.set(m.id, m)

          let cx = m.cx
          let cy = m.cy

          //debugger;          
          const cupHeight = (5.5 * INCH_TO_CM) / this.cameraPixelToCm

          const zInPixels = this.projector.position.z / this.cameraPixelToCm
          const xInPixels = this.projector.position.x / this.cameraPixelToCm

          let xOffset = cupHeight * Math.tan(Math.PI/2 - Math.atan2(zInPixels, xInPixels - cx))
          let yOffset

          cx += xOffset
          //console.log(xOffset)

          // TODO: Better place
          m.px = (cx - this.surfaceBoundsInCameraSpace.topLeft.x) * sx
          m.py = (cy - this.surfaceBoundsInCameraSpace.topLeft.y) * sy
          //console.log(`${sx} => ${m.cx}x${m.cy}`)
        })
        this.update()
      }
      requestAnimationFrame(detect)
    }
  }

  public addOrder(order: Order) {
    this.orders.push(order)
    this.update()
  }

  private update() {
    //console.log('markersize: ' + JSON.stringify(this.markers.size))
    const drawMarkers = true
    if (drawMarkers) {
      const existing = this.svg
        .selectAll('.item')
        .data(Array.from(this.markers.values()), (d: Marker) => { return d.id })
      const enter = existing.enter()
      const exit = existing.exit()

      const orderFromMarkerId = (id: string): Order => {
        return this.orders.find(o => o.items[0].markerId === id)
      }

      Drink.existing(existing, orderFromMarkerId)
      Drink.enter(enter, orderFromMarkerId)
      Drink.exit(exit, orderFromMarkerId)
    }

    const drawQueue = true
    if (drawQueue) {
      const mopOrders = this.orders.filter(o => o.source === Source.MOP)
      //console.log(mopOrders)
      const queue = d3.select('.queue')
      const existingQueue = queue
        .selectAll('.queueItem')
        .data(mopOrders, (d: Order) => d.id)
      const enterQueue = existingQueue.enter()
      const exitQueue = existingQueue.exit()
      Queue.existing(exitQueue)
      Queue.enter(enterQueue)
      Queue.exit(exitQueue)
    }
  }
}