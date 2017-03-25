import DrinkWidget from './drinkWidget'
import Order from './order'
import Tracker, { Marker, Corner } from './tracker'

// TODO: Fix types
declare var d3: any;

export default class Surface {
  private orders: Order[]
  private tracker: Tracker
  private markers: Map<string, Marker> = new Map()
  private svg: any

  constructor() {
    this.orders = []
    this.svg = d3.select('svg')

    DrinkWidget.setup(this.svg)
  }

  public async init() {
    this.tracker = new Tracker(
      document.getElementById("video") as HTMLVideoElement,
      document.getElementById("canvas") as HTMLCanvasElement,
      true
    )
    await this.tracker.start()

    // TODO: Don't need to do this so frequently
    const detect = () => {
      requestAnimationFrame(detect)
      const ms = this.tracker.detect() || []
      this.markers.clear()
      ms.forEach(m => {
        this.markers.set(m.id, m)
      })
      this.update()
    }
    requestAnimationFrame(detect)
  }

  public addOrder(order: Order) {
    this.orders.push(order)
  }

  private update() {
    const existing = this.svg
      .selectAll('.item')
      .data(Array.from(this.markers.values()), (d: Marker) => { return d.id })
    const enter = existing.enter()
    const exit = existing.exit()

    const orderFromMarkerId = (id: string): Order => {
      return this.orders.find(o => o.items[0].markerId === id)
    }

    DrinkWidget.existing(existing, orderFromMarkerId)
    DrinkWidget.enter(enter, orderFromMarkerId)
    DrinkWidget.exit(exit, orderFromMarkerId)
  }
}