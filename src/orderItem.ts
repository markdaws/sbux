export enum OrderItemType {
  MochaFrap = 0,
  Americano,
}
export default class OrderItem {
  public readonly markerId: string
  public readonly type: OrderItemType
  
  constructor(markerId: string, type: OrderItemType) {
    this.markerId = markerId
    this.type = type
  }

  // TODO:
  /*
  category
  type
  source
  status
  */
}
