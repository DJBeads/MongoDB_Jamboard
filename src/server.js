const mongoose = require('mongoose');
const express = require('express')
const User = require('./schema/user');
const Board = require('./schema/board');
const app = express()
// Parse JSON bodies for this app ... access via request.body,
app.use(express.json());
const port = 3000


// get - lesen
// post - create
// put - update / create
// delete - löschen


app.get('/', function (req, res) {
    res.send('This is a Post-It Board')
})

app.get('/users', async (req, res) => {
    const {name} = req.query;
    const filter = {};
    if(name){
        filter['firstname'] = name;
    }
    const users = await User.find(filter);
    res.send(users);
})



app.get('/users/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findOne({_id: id});
        res.send(user);
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})

app.post('/newPost/:id', async (req, res) => {
    const {id} = req.params;
    const post = req.body;
    console.log(post)
    try {
        const board = await Board.findOne({_id: id});

        board.post.push({
            text: post.text,
            author:post.author,
            position: {
                x:post.x,
                y:post.y
            }
        })

        await board.save();

        res.send(board);
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})


app.post('/newEditor', async (req, res) => {

    const newEditor = req.body;

    try {
        const board = await Board.findOne({_id: newEditor.boardId});
        console.log(board)
        console.log(board.editor)

        board.editor.push(newEditor.boardId);

        await board.save();

        res.send('successful');
    } catch (e){

        console.log(e);

        res
            .status(404)
            .send('Not found.');
    }
})

app.post('/newBoard', async (req, res) => {

    const newBoard = req.body;
    console.log(newBoard);

    try{
        const board = new Board({
            post: [],
            owner:newBoard.owner,
            editor:[newBoard.owner]
        });

        await board.save();

        res.send('successful')
    }catch (e) {
        res
            .status(409)
            .send('not possible');
    }
})

app.put('/updatePost', async (req, res) => {

    const updatePost = req.body;

    try {
        const board = await Board.findOne({_id: updatePost.boardId});

        let post = updatePost.postId;

        console.log(board);

        for(let i=0;i < board.post.length; i++){
            if (post==board.post[i]._id){

                board.post[i].overwrite({
                    text: updatePost.text,
                    author:updatePost.author,
                    position: {
                        x:updatePost.x,
                        y:updatePost.y
                    }

                });

                console.log(board);
                await board.save();
                break

            }else {
                console.log('not possible');
            }
        }

        res.send('successful');
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})

app.delete('/deleteEditor/:boardId/:editorId', async (req, res) => {
    try {
        const deleteEditor = await Board.updateOne(
            {_id: req.params.boardId},
            {$pull: {editor: req.params.editorId}});
        console.log(deleteEditor);

        res.send('successful');
    } catch(e) {
        res
            .status(404)
            .send('Not Found.');
    }
});


app.delete('/deletePost/:boardId/:postId', async (req, res) => {

    try {
        const deletePost = await Board.updateOne(
            {_id: req.params.boardId},
            {$pull: {post: {_id: req.params.postId}}});
        console.log(deletePost)

        res.send('successful');
    } catch(e) {
        res
            .status(404)
            .send('Not Found.');
    }
});


app.delete('/deleteBoard/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await Board.deleteOne({ _id: id })

        res.send('deleted');
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})


mongoose.connect('mongodb://localhost:27017', {
    user: 'root',
    pass: 'example',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, error => {
    if(!error) {
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    } else {
        console.error('Failed to open a connection to mongo db.', error);
    }
});