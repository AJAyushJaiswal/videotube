import mongoose, {Schema} from 'mongoose';


const postSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true}
);