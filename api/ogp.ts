import * as path from 'path'
import { NowRequest, NowResponse } from '@now/node'
import {createCanvas, registerFont, loadImage } from 'canvas'
import { CanvasRenderingContext2D } from 'canvas/types'

type Params = {
  title: string
}

const getParams = (req: NowRequest): Params => {
  const title: string = req.query.title as string
  return {
    title
  }
}

// サロゲートペアを考慮し、実際のフォントのサイズで文字列を分割
const splitByMeasureWidth = (str: string, maxWidth: number, context: CanvasRenderingContext2D): string[] => {
  const lines: string[] = []
  let line: string = ''
  str.split('').forEach((char) => {
    line += char
    if (context.measureText(line).width > maxWidth) {
      lines.push(line.slice(0, -1))
      line = line.slice(-1)
    }
  })
  lines.push(line)
  return lines
}

const generateOgpImage = async (params: Params): Promise<Buffer> => {
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 630
  const BACKGROUND_IMAGE_PATH = path.join(__dirname, '..', 'images', 'background.png')
  const TITLE_COLOR = "#000000"
  const TITLE_SIZE = 68
  const TITLE_LINE_MARGIN_SIZE = 16
  const TITLE_MARGIN_X = 32
  const FONT_FAMILY = 'rounded-mplus-1p-medium'
  const FONT_PATH = path.join(__dirname, '..', 'fonts', 'rounded-mplus-1p-medium.ttf')

  registerFont(FONT_PATH, { family: FONT_FAMILY })
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const context = canvas.getContext('2d')

  // Draw background
  const backgroundImage = await loadImage(BACKGROUND_IMAGE_PATH)
  context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Draw title at center
  context.font = `${TITLE_SIZE}px ${FONT_FAMILY}`
  context.fillStyle = TITLE_COLOR
  const titleLines: string[] = splitByMeasureWidth(params.title, CANVAS_WIDTH - TITLE_MARGIN_X, context)
  let lineY: number = CANVAS_HEIGHT/2 - (TITLE_SIZE+TITLE_LINE_MARGIN_SIZE)/2 * (titleLines.length - 1)
  titleLines.forEach((line: string) => {
    const textWidth: number = context.measureText(line).width
    context.fillText(line, (CANVAS_WIDTH - textWidth)/2, lineY)
    lineY += TITLE_SIZE + TITLE_LINE_MARGIN_SIZE
  })

  return canvas.toBuffer()
}

export default async function(req: NowRequest, res: NowResponse) {
  const params: Params = getParams(req)

  const imageBinary: Buffer = await generateOgpImage(params)

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imageBinary.length
  })
  res.end(imageBinary, 'binary')
}
