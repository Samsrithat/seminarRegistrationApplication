const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    status: {type: String, required: [true, 'Status is required']},
    userid: {type: Schema.Types.ObjectId, ref: 'User'},
    connectionid: {type: Schema.Types.ObjectId, ref: 'Connection'}
},
{timestamps:true}
);

module.exports = mongoose.model('RSVP', rsvpSchema);