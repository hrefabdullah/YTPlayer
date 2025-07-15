import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // One who is subcribing
        ref: 'User'
    },

    channel: {
        type: Schema.Types.ObjectId, // One who is being subscribed
        ref: 'User'
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)