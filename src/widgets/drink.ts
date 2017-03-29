import { Marker } from '../tracker'
import Order from '../order'

// TODO: Fix types
declare var d3: any;

const innerArc: any = d3.arc()
  .innerRadius(150)
  .outerRadius(200)
  .startAngle(2 * Math.PI)

const outerArc: any = d3.arc()
  .innerRadius(208)
  .outerRadius(204)
  .startAngle(2 * Math.PI)

export default class Drink {

  public static setup(svg: any) {
    const radialGradient = svg.append("defs")
      .append("radialGradient")
      .attr("id", "radial-gradient");

    radialGradient.append("stop")
      .attr("offset", "0")
      .attr("stop-color", "#fff");

    radialGradient.append("stop")
      .attr("offset", "0.82")
      .attr("stop-color", "#fff");

    radialGradient.append("stop")
      .attr("offset", "1")
      .attr("stop-color", "#fff")
      .attr('stop-opacity', 0)
  }

  public static existing(items: any, orderFromMarkerId: (markerId: string) => Order) {
    items.attr('transform', (d: Marker) => {
      //console.log(`existing: ${d.id} - translate(${d.cx},${d.cy}) scale(0.5)`)
      return `translate(${Math.floor(d.px)},${Math.floor(d.py)}) scale(0.5)`
    })
  }

  public static enter(itemsX: any, orderFromMarkerId: (markerId: string) => Order) {
    const items = itemsX
      .append('g')
      .classed('item', true)
      .attr('transform', (d: Marker) => {
        //console.log(`entering - ${d.id}`)
        return `translate(${d.px},${d.py}) scale(0.5)`
      })
      .append('g')

    /*
    const rotateAnim = (delay: number) => {
      items.transition()
        .duration(6000)
        .delay(delay)
        .ease((t: number) => t)
        .attrTween('transform', () => {
          return d3.interpolateString('rotate(0)', 'rotate(360)')
        })
      .on('end', () => rotateAnim(0))
    }
    rotateAnim(2000)
    */

    /*
    const background = items
      .append('circle')
      .attr('r', 180)
      .attr('opacity', 0)
      .attr('fill', 'url(#radial-gradient)')
      .transition()
      .duration(1000)
      .attr('opacity', 1)
    */

    const inner = items
      .append('path')
      .attr('id', (d: Marker) => 'innerarc_' + d.id)
      .datum({endAngle: 2 * Math.PI})
      .attr('fill', '#00704a')
      .attr('d', innerArc)
      .transition()
      .duration(1000)
      .attrTween("d", Drink.arcTween(innerArc, 0 * 2 * Math.PI));

    const center = items
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 10)
      .attr('fill', 'red')

    const name = items
      .append('text')
      .attr('font-size', 50)
      .attr('font-family', 'Santana-Black')
      .attr('letter-spacing', 18)
      .attr('dy', -8)
      .attr('x', 300)
      .attr('fill', '#fff')
      .attr('opacity', 0)
    
    name.transition()
      .duration(1000)
      .delay(1000)
      .attr('opacity', 1)

    name.append('textPath')
      .attr('xlink:href', (d: Marker) => '#innerarc_' + d.id)
      .text((d: Marker) => {
        const order = orderFromMarkerId(d.id)
        if (!order) {
          return ''
        }
        return order.customer.displayName.toUpperCase()
      })

    const outer = items
      .append('path')
      .datum({endAngle:  2 * Math.PI})
      .attr('fill', '#00704a')
      .attr('d', outerArc)
      .transition()
      .delay(200)  
      .duration(1000)
      .attrTween("d", Drink.arcTween(outerArc, 0 * Math.PI));
  }

  public static exit(items: any, orderFromMarkerId: (markerId: string) => Order) {
    //items.attr('foo', ((d: Marker) => console.log(`removing marker: ${d.id}`)))
    //return
    /*
    items.transition()
      .duration(5000)
      .delay(3000)
      .attr('opacity', 0)
    .on('end', () => { items.remove() })*/
  }

   private static arcTween(arc: any, newAngle: number) {
    return (d: any) => {
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return (t: number) => {
        d.endAngle = interpolate(t)
        return arc(d)
      }
    }
  }
}