const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
    chatId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    caller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt : Date,
    rating:{
        fromCaller:{
            type: Number,
            min: 1,
            max: 5
        },
        fromReceiver:{
            type: Number,
            min: 1,
            max: 5
        }
    }
});

module.exports = mongoose.model('CallSession', callSessionSchema);