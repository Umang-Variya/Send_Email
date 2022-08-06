const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notiSchema = new Schema({
    update: {
        type: String
    },
    sender: {
        type: String
    }
}, {
    timestamps: true
});

let Noti = mongoose.model("notification", notiSchema);

module.exports = Noti;