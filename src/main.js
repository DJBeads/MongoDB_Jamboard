const mongoose = require('mongoose');
const Board = require('./schema/board');
const User = require('./schema/user')
async function testMongoose() {

    try {
        await mongoose.connect('mongodb://localhost:27017', {
            user: 'root',
            pass: 'example',

            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });

        const user = new User( {
            name: {
                firstname: 'Fred',
                lastname: 'Flintstones'
            }
        })

        await user.save();

        const author = await User.findOne({'name.firstname':'Fred'});
        const board = new Board({
            post: [{
                text:'yabadabadoo',
            author:author._id,
            position: {
            x:1,
            y:1,
            }
            }],
            owner:author._id,
            editor:author._id

        })

        await board.save();


    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testMongoose();