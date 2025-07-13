import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import { v2 } from 'cloudinary'
import fs from 'fs'


v2.config({
    cloud_name: 'hrefabdullah',
    api_key: 326965842787698,
    api_secret: 'YTt7djfcbfVGqXCyo8XJZYFIC7U'
})


const fileUploader = async (filePath) => {
    try {
        if (!filePath) return null
        const res = await v2.uploader.upload(filePath, {
            resource_type: 'auto'
        })
        return res
    } catch (error) {
        fs.unlinkSync(filePath)
        console.error("hey", error);
        return null
    }
}

export { fileUploader }