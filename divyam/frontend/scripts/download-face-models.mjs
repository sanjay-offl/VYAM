import fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import https from 'node:https'
import path from 'node:path'

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
const targetDir = path.resolve(process.cwd(), 'public', 'models')

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
]

async function downloadFile(fileName) {
  const url = `${baseUrl}/${fileName}`
  const targetPath = path.join(targetDir, fileName)

  try {
    const stat = await fsp.stat(targetPath)
    if (stat.size > 0) {
      console.log(`✓ ${fileName} already exists`) 
      return
    }
  } catch {
    // file not found, proceed
  }

  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetPath)
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${fileName}: ${res.statusCode}`))
        return
      }

      res.pipe(fileStream)
      fileStream.on('finish', () => fileStream.close(resolve))
    }).on('error', reject)
  })

  console.log(`↓ Downloaded ${fileName}`)
}

async function run() {
  await fsp.mkdir(targetDir, { recursive: true })

  for (const file of files) {
    await downloadFile(file)
  }

  console.log('All face-api.js model files are ready in /public/models')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
