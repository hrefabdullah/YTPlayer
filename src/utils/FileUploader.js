import { v2 as cloud } from 'cloudinary'
import fs from 'fs'

cloud.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

const fileUploader = async (filePath) => {
    try {
        if (!filePath) return null
        const res = await cloud.uploader.upload(filePath, {
            resource_type: 'auto'
        })
        return res
    } catch (error) {
        fs.unlinkSync(filePath)
        console.error(error);
        return null
    }
}

export { fileUploader }