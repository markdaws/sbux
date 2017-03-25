export type Corner = { x: number, y: number }
export type Marker = {
  id: string,
  corners: Corner[]
  cx: number
  cy: number
}

declare var AR: any;

export default class Tracker {
  private detector: any
  private video: HTMLVideoElement
  private context: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private imageData: any
  private debug: boolean

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement, debug: boolean) {
    this.video = video
    this.canvas = canvas
    this.debug = debug
  }

  public async start() {
    this.context = this.canvas.getContext("2d");
    this.canvas.width = parseInt(this.canvas.style.width);
    this.canvas.height = parseInt(this.canvas.style.height);
    
    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not found')
    }

    if (!window.URL) {
      throw new Error('window.URL not found')
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.src = window.URL.createObjectURL(stream)
    this.detector = new AR.Detector();
  }

  public detect(): Marker[] {
    if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return
    }

    this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )

    var markers: Marker[] = this.detector.detect(imageData);
    const markersById = {}
    markers.forEach((m: Marker) => {
      let cx = 0;
      let cy = 0;
      m.corners.forEach((c: Corner) => {
        cx += c.x
        cy += c.y
      })
      cx /= 4
      cy /= 4
      m.cx = cx
      m.cy = cy
      m.id = m.id + ''
    })

    if (this.debug) {
      this.drawCorners(markers)
      this.drawId(markers)
    }
    return markers
  }

  private drawCorners(markers: Marker[]) {
    let corners, corner, i, j;

    this.context.lineWidth = 3;
    for (i = 0; i !== markers.length; ++ i){
      corners = markers[i].corners;

      this.context.strokeStyle = "red";
      this.context.beginPath();

      for (j = 0; j !== corners.length; ++ j){
        corner = corners[j];
        this.context.moveTo(corner.x, corner.y);
        corner = corners[(j + 1) % corners.length];
        this.context.lineTo(corner.x, corner.y);
      }
      this.context.stroke();
      this.context.closePath();
      this.context.strokeStyle = "green";
      this.context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
    }
  }

  private drawId(markers: Marker[]){
    let corners, corner, x, y, i, j;

    this.context.strokeStyle = "blue";
    this.context.lineWidth = 1;

    for (i = 0; i !== markers.length; ++ i){
      corners = markers[i].corners;

      x = Infinity;
      y = Infinity;

      for (j = 0; j !== corners.length; ++ j){
        corner = corners[j];
        x = Math.min(x, corner.x);
        y = Math.min(y, corner.y);
      }
      this.context.strokeText(markers[i].id + '', x, y)
    }
  }
}