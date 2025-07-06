import mongoose, { Schema, model } from 'mongoose'

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String, 
        required: true
    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    views: {
        type: Number, 
        deafult: 0
    },
    isPublished: {
        type: boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema)