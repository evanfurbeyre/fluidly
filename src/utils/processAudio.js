/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("node:child_process")
const { readdir, unlink, writeFileSync } = require("node:fs")

const AUDIO_FOLDER = "src/data/audio/"
const B64_FOLDER = "src/data/b64_audio/"

async function compress(inFile) {
  return new Promise((resolve, reject) => {
    const inf = `${AUDIO_FOLDER}${inFile}`
    const outFile = `${AUDIO_FOLDER}tmp.${inFile}`
    const args = "-map 0:a:0 -b:a".split(" ")
    const bitrate = "36k"
    const cmd = spawn("ffmpeg", ["-i", inf, ...args, bitrate, outFile])

    cmd.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`)
    })

    cmd.stderr.on("data", (data) => {
      // There is output here each run but things work fine??
      // console.error(`stderr: ${data}`)
    })

    cmd.on("close", (code) => {
      if (code !== 0) {
        console.log(`child process exited with code ${code}`)
      }
      resolve(outFile)
    })
  })
}

const base64ify = async (inFile) =>
  new Promise((resolve, reject) => {
    let s = ""
    const cmd = spawn("base64", [`${inFile}`])
    cmd.stdout.on("data", (data) => {
      s = s.concat(data)
    })

    cmd.stderr.on("data", (data) => {
      console.error(`base64 stderr: ${data}`)
      reject()
    })

    cmd.on("close", (code) => {
      if (code !== 0) {
        console.log(`child process exited with code ${code}`)
      }
      resolve(s)
    })
  })

const getDirFiles = async (path) =>
  new Promise((resolve, reject) => {
    readdir(path, (err, filenames) => {
      if (err) reject()
      resolve(filenames)
    })
  })

const remove = async (path) =>
  new Promise((resolve, reject) => {
    unlink(path, (err) => {
      if (err) reject(err)
      resolve()
    })
  })

async function main() {
  const inFiles = await getDirFiles(AUDIO_FOLDER)
  const outFiles = await getDirFiles(B64_FOLDER)
  const files = inFiles
    .map((f) => f.split(".mp3")[0])
    .filter((f) => !outFiles.includes(f))
    .filter((f) => !f.startsWith("tmp."))
    .filter((f) => ![".DS_Store"].includes(f))
  console.log("files to convert:", files)

  let tmpFile
  try {
    for (let i = 0; i < files.length; i += 1) {
      tmpFile = await compress(files[i] + ".mp3")
      const b64 = await base64ify(tmpFile, `${B64_FOLDER}${files[i]}`)
      const outF = `${B64_FOLDER}${files[i]}`
      writeFileSync(outF, b64)
      await remove(tmpFile)
    }
  } catch (e) {
    console.error(e)
  }
}

main()
