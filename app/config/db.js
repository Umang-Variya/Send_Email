const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb+srv://umang:umang1433@cluster0.eobmkg1.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB Connected!!!!');
    })
    .catch(err => console.log(err))

module.exports = connect;