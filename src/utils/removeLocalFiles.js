import fs from 'fs'

const removeLocalFiles = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${filePath}`, err)
      } else {
        console.log(`File removed successfully: ${filePath}`)
      }
    })
  } else {
    console.warn(`File not found: ${filePath}`)
  }
}

export default removeLocalFiles