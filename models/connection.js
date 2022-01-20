const { DateTime } = require("luxon");
const {v4: uuidv4} = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionsSchema = new Schema({
    title: {type: String, required: [true, 'Cannot be empty']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    date: {type: String, required: [true, 'Cannot be empty']},
    starttime: {type: String, required: [true, 'Cannot be empty']},
    endtime: {type: String, required: [true, 'Cannot be empty']},
    venue: {type: String, required: [true, 'Cannot be empty']},
    description: {type: String, required: [true, 'Cannot be empty'], 
        minLength: [10, 'Should have atleast 10 characters']},
    img: {type: String, required: [true, 'Cannot be empty']},
    category: {type: String, required: [true, 'Cannot be empty']}
},
{timestamps: true}
);

module.exports = mongoose.model('Connection', connectionsSchema);
//The name of the collection is connections.
