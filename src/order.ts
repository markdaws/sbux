import Customer from './customer'
import OrderItem from './orderItem'

export default class Order {
  public readonly id: string
  public readonly customer: Customer
  public readonly items: OrderItem[]

  constructor(
    id: string,
    customer: Customer) {
    this.id = id
    this.customer = customer
    this.items = []
  }

  public addItem(item: OrderItem) {
    this.items.push(item)
  }
}