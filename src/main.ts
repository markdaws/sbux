import Customer from './customer'
import Order from './order'
import OrderItem from './orderItem'
import Surface from './surface'

let surface: Surface
let orderNumber = 0

window.onload = () => {
  surface = new Surface()
  surface.init()

  // In the real system, new orders would come in and update
  // this but for now assume these two orders are available
  const mark = new Customer('mark d')
  const weelee = new Customer('wee lee')

  const orderMark = new Order((orderNumber++) + '', mark)
  orderMark.addItem(new OrderItem('177'))
  surface.addOrder(orderMark)

  const orderWee = new Order((orderNumber++) + '', weelee)
  orderWee.addItem(new OrderItem('838'))
  surface.addOrder(orderWee)
}
