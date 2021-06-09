const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        validate: {
            validator(value){
                return value.length >= 5;
            },
            message: props => 'at least 5 characters required!'
        },
    },
    text: String,
    date: Date,
    likes:{
        type: 'Number',
        min: 0,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        text: String
    }]
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message