import Camera from './camera'

export type Corner = { x: number, y: number }
export type Marker = {
  id: string,
  corners: Corner[]
  cx: number
  cy: number
  px: number
  py: number
}

declare var AR: any;

export default class Tracker {
  private camera: Camera
  private detector: any
  private video: HTMLVideoElement
  private context: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private imageData: any
  private debug: boolean
  private debounce: boolean
  private debouncedMarkers: { [markerId: string]: { lastSeen: number, marker: Marker} }

  constructor(
    camera: Camera,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    debounce: boolean,
    debug: boolean) {
    this.camera = camera
    this.video = video
    this.canvas = canvas
    this.debounce = debounce
    this.debug = debug
    this.debouncedMarkers = {}
  }

  public async start() {
    this.context = this.canvas.getContext("2d");
    this.canvas.width = this.camera.nativeResolution.x / 2
    this.canvas.height = this.camera.nativeResolution.y / 2

    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not found')
    }

    if (!window.URL) {
      throw new Error('window.URL not found')
    }

    const constraints = {
      video: {
        mandatory: {
          minWidth: this.camera.nativeResolution.x,
          minHeight: this.camera.nativeResolution.y,
        }
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.src = window.URL.createObjectURL(stream)
    //stream.getTracks()[0].stop()
    this.video.play()

    if (this.debug) {
      this.video.addEventListener('playing', () => {
        setTimeout(() => {
          console.log(`${this.video.videoWidth}x${this.video.videoHeight}`)
          console.log(`${this.video.playbackRate}`)
        }, 1000)
      })
    }
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

    if (this.debug) {
      this.drawCenter()
    }

    var markers: Marker[] = this.detector.detect(imageData);
    const markersById: any = {}
    markers.forEach((m: Marker) => {
      markersById[m.id] = m

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

      // TODO: re-use
      if (this.debounce) {
        this.debouncedMarkers[m.id] = {
          lastSeen: new Date().getTime(),
          marker: m,
        }
      }
    })

    let finalMarkers: Marker[]
    if (this.debounce) {
      finalMarkers = []
      const now = new Date().getTime()
      Object.keys(this.debouncedMarkers).forEach((id: string) => {
        const record = this.debouncedMarkers[id]
        if (now - record.lastSeen > 3000) {
          delete this.debouncedMarkers[id]
        } else {
          finalMarkers.push(record.marker)
        }
      })
    } else {
      finalMarkers = markers
    }

    if (this.debug) {
      this.drawCorners(finalMarkers)
      this.drawId(finalMarkers)
    }
    return finalMarkers
  }

  private drawCenter() {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const radius = 20

    this.context.beginPath()
    this.context.moveTo(centerX - radius, centerY)
    this.context.lineTo(centerX + radius, centerY)
    this.context.moveTo(centerX, centerY - radius)
    this.context.lineTo(centerX, centerY + radius)
    this.context.lineWidth = 2
    this.context.strokeStyle = '#f00'
    this.context.stroke()
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