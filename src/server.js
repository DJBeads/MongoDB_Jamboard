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

        board.save();

        res.send('successful');
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})


app.post('/newEditor', async (req, res) => {

    const editorData = req.body;

    try {
        const board = await Board.findOne({_id: editorData.idBoard});
        console.log(board)
        console.log(board.editor)

        board.editor.push(editorData.idEditor);

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

    const boardData = req.body;
    console.log(boardData);

    try{
        const board = new Board({
            post: [],
            owner:boardData.owner,
            editor:[boardData.owner]
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

    const postData = req.body;

    try {
        const board = await Board.findOne({_id: postData.idBoard});

        let post = postData.postid;

        console.log(board);

        for(let i=0;i < board.post.length; i++){
            if (post==board.post[i]._id){

                board.post[i].overwrite({
                    text: postData.text,
                    author:postData.author,
                    position: {
                        x:postData.x,
                        y:postData.y
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

app.delete('/deleteEditor', async (req, res) => {

    const editorData = req.body;

    try {
        const board = await Board.findOne({_id: editorData.idBoard});

        console.log(board.editor);

        let editor = editorData.idEditor;
        console.log(editor);



        for(let i=0;i < board.editor.length; i++){
            if (editor==board.editor[i]){

                board.editor.splice([i]);

                board.save();

                console.log(board.editor);
            }else {
                console.log(board.editor[i]);
            }
        }


        res.send('successful');
    } catch (e){
        res
            .status(404)
            .send('Not found.');
    }
})

app.delete('/deletePost', async (req, res) => {

    const postData = req.body;

    try {
        const board = await Board.findOne({_id: postData.idBoard});

        let post = postData.idPost;

        for(let i=0;i < board.post.length; i++){
            if (post==board.post[i]._id){
                board.post.splice(i,1);

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


app.delete('/deleteBoard/:id', async (req, res) => {

    const {id} = req.params;

    try {
        Board.deleteOne({ _id: id }, function (err) {
            if(err) console.log(err);
            console.log("Deleted");
        });

        res.send('successful');
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