const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb://localhost:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB Connected!!!!');
    })
    .catch(err => console.log(err))

module.exports = connect;