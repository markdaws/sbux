import Customer from './customer'
import OrderItem from './orderItem'

export enum Source {
  // The order was created in the store
  Store = 0,

  // The order came from a mobile order and pay client
  MOP,
}

export default class Order {
  public readonly id: string
  public readonly customer: Customer
  public readonly items: OrderItem[]
  public readonly source: Source

  constructor(
    id: string,
    source: Source,
    customer: Customer) {
    this.id = id
    this.source = source
    this.customer = customer
    this.items = []
  }

  public addItem(item: OrderItem) {
    this.items.push(item)
  }
}