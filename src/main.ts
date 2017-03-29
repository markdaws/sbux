import Customer from './customer'
import Order, { Source } from './order'
import OrderItem, { OrderItemType } from './orderItem'
import Surface from './surface'

let surface: Surface
let orderNumber = 0

window.onload = () => {
  const dimension = new THREE.Vector2(800, 480)
  const offset = new THREE.Vector2();
  surface = new Surface(dimension, isDebug())
  surface.init()

  // In the real system, new orders would come in and update
  // this but for now assume these two orders are available
  const mark = new Customer('mark d')
  const weelee = new Customer('wee lee')
  const bob = new Customer('bob j')

  const orderMark = new Order((orderNumber++) + '', Source.MOP, mark)
  orderMark.addItem(new OrderItem('177', OrderItemType.Americano))
  surface.addOrder(orderMark)

  const orderWee = new Order((orderNumber++) + '', Source.Store, weelee)
  orderWee.addItem(new OrderItem('838', OrderItemType.Americano))
  surface.addOrder(orderWee)

  let i = 0
  setInterval(() => {
    console.log('adding order')
    // TODO: correct marker id
    const orderBob = new Order((orderNumber++) + '', Source.MOP, bob)
    orderBob.addItem(new OrderItem(
      '838',
      i % 2 === 0 ? OrderItemType.Americano : OrderItemType.MochaFrap
    ))
    surface.addOrder(orderBob)
    ++i
  }, 8000)

  if (isDebug()) {
    initDebug()
  }
}

const isDebug = () => {
  return window.location.search.indexOf('debug=true') !== -1
}

const initDebug = () => {
  window.addEventListener('mousedown', (e: MouseEvent) => {
    alert(`${e.clientX}:${e.clientY}`)
  })
}