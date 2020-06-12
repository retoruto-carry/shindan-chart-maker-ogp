import * as path from 'path'
import { NowRequest, NowResponse } from '@now/node'
const { createCanvas, registerFont } = require('canvas')

export default function(_req: NowRequest, res: NowResponse) {
  registerFont(path.join(__dirname, '..', 'fonts', 'rounded-mplus-1p-medium.ttf'), {
    family: 'rounded-mplus-1p-medium'
  })

  const canvas = createCanvas(600, 315)
  const context = canvas.getContext('2d')

  const canvasWidth = 1200;
  const canvasHeight = 630;
  const backgroundColor = "#d3ffb1";

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  context.font = '15px rounded-mplus-1p-medium'
  context.fillStyle = '#424242'
  context.fillText('hello', 100, 100)

  const image = canvas.toBuffer()

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': image.length
  })
  res.end(image, 'binary')
}
