import * as path from 'path'
import { NowRequest, NowResponse } from '@now/node'
import {createCanvas, registerFont} from 'canvas'

type Params = {
  title: string
}

const getParams = (req: NowRequest): Params => {
  const title: string = req.query.title as string
  return {
    title
  }
}

const generateOgpImage = (params: Params): Buffer => {
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 630;
  const BACKGROUND_COLOR = "#ffffff";
  const TITLE_COLOR = "#000000";
  const TITLE_SIZE = 64
  const FONT_FAMILY = 'rounded-mplus-1p-medium'
  const FONT_PATH = path.join(__dirname, '..', 'fonts', 'rounded-mplus-1p-medium.ttf')

  registerFont(FONT_PATH, { family: FONT_FAMILY })
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const context = canvas.getContext('2d')

  // Draw background
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Draw title at center
  context.font = `${TITLE_SIZE}px ${FONT_FAMILY}`
  context.fillStyle = TITLE_COLOR
  const textWidth:number = context.measureText(params.title).width
  context.fillText(params.title, (CANVAS_WIDTH - textWidth)/2, CANVAS_HEIGHT/2)

  return canvas.toBuffer()
}

export default function(req: NowRequest, res: NowResponse) {
  const params: Params = getParams(req)
  const imageBinary: Buffer = generateOgpImage(params)

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imageBinary.length
  })
  res.end(imageBinary, 'binary')
}
