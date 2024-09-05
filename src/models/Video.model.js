import mongoose from 'mongoose';
const { Schema } = mongoose;

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
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

videoSchema.index({ owner: 1 }); // Uncomment if you query by owner frequently
videoSchema.index({ views: -1 }); // Uncomment if you query by views frequently

export const Video = mongoose.model('Video', videoSchema);
