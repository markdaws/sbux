import Order from '../order'
import { OrderItemType } from '../orderItem'

// TODO: Fix types
declare var d3: any;

const imgPathForType = {
  [OrderItemType.Americano]: 'assets/img/cup.png',
  [OrderItemType.MochaFrap]: 'assets/img/frap.png',
}

export default class Queue {

  public static setup(svg: any) {
  }

  public static existing(items: any) {
  }

  public static enter(items: any) {
    const cups = items
      .append('g')
      .attr('transform', 'translate(3500, 1700)')
      .classed('queueItem', true)

    const icon = cups
      .append('image')
      //.attr('x', 3500)
      .attr('xlink:href', (d: Order) => {
        return imgPathForType[d.items[0].type]
      })

    cups.transition()
      .duration(1000)
      .attrTween('transform', (d: Order, i: number) => {
        const x = 200 + i * 500
        console.log(i)
        return d3.interpolateString(
          `translate(3500, 1700)`,
          `translate(${x}, 1700)`)
      })
      //.attr('x', (d: Order, i: number) => i * 500)
    
    const name = cups
      .append('text')
      .attr('y', 600)
      .attr('x', 210)
      .attr('text-anchor', 'middle')
      .attr('font-size', 86)
      .attr('font-family', 'Santana-Black')
      .attr('style', 'text-transform:uppercase')
      .text((d: Order) => d.customer.displayName)
      /*
      .attrTween('transform', (d: Order, i: number) => {
        const x = i * 500
        console.log(i)
        return d3.interpolateString(`translate(600, 0)`, `translate(${x}, 0)`)
      })*/
  }

  public static exit(items: any) {
  }
}
