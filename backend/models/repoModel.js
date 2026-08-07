const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
    },
    content:[{
        name: { type: String },
        content: { type: String },
        updatedAt: { type: Date, default: Date.now }
    }],
    visibility:{
        type:Boolean,
        default:true,
    },
    Owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    issues:[
        {
            type:Schema.Types.ObjectId,
            ref:"Issue",
        },
    ],
    starCount:{
        type:Number,
        default:0
    }
});

const Repository = mongoose.model("Repository", RepositorySchema);

module.exports = Repository;