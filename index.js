import express from 'express';
import bodyParser from 'body-parser';

import { register, login, sendMessage, viewMessages, listAllUsers } from './database.js';

const app = express();
const port = 3000;

const jsonParser = bodyParser.json();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//GET
//View Messages
app.get('/view_messages', jsonParser, async (req, res) => {
    const queryResult = await viewMessages(req.body.user_id_a, req.body.user_id_b);
    const responsePayload = {};
    let responseCode = 200;

    if(queryResult.error){
        responsePayload.error_code = 400;
        responsePayload.error_title = 'Error';
        responsePayload.error_message = 'Error';
        responseCode = 400;
    }else{
        console.log(queryResult);
        responsePayload.users = queryResult.data;
    }

    res.status(responseCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//List All Users
app.get('/list_all_users', jsonParser, async (req, res) => {
    const queryResult = await listAllUsers(req.body.requester_user_id);
    const responsePayload = {};
    let responseCode = 200;

    if(queryResult.error){
        responsePayload.error_code = 400;
        responsePayload.error_title = 'Error';
        responsePayload.error_message = 'Error';
        responseCode = 400;
    }else{
        if(queryResult.data.length){
            responsePayload.users = queryResult.data;
        }else{
            responsePayload.error_code = 404;
            responsePayload.error_title = 'Error';
            responsePayload.error_message = 'Error';
            responseCode = 404;
        }
    }

    res.status(responseCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//POST
//Register
app.post('/register', jsonParser, async (req, res) => {
    const queryResult = await register(req.body.email, req.body.password, req.body.first_name, req.body.last_name);
    const responsePayload = {};
    let responseCode = 201;

    if(queryResult.error){
        responsePayload.error_code = 400;
        responsePayload.error_title = 'Registration Error';
        responsePayload.error_message = 'We were unable to register your account.';
        responseCode = 400;
    }else{
        responsePayload.user_id = queryResult.data;
        responsePayload.email = req.body.email;
        responsePayload.first_name = req.body.first_name;
        responsePayload.last_name = req.body.last_name;
    }

    res.status(responseCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//Login
app.post('/login', jsonParser, async (req, res) => {
    const queryResult = await login(req.body.email, req.body.password);
    const responsePayload = {};
    let responseCode = 200;

    if(queryResult.error){
        responsePayload.error_code = 401;
        responsePayload.error_title = 'Invalid Credentials';
        responsePayload.error_message = 'It seems that you have entered the wrong email and/or password.';
        responseCode = 401;
    }else{
        responsePayload.user_id = queryResult.data.user_id;
        responsePayload.email = queryResult.data.email;
        responsePayload.first_name = queryResult.data.first_name;
        responsePayload.last_name = queryResult.data.last_name;
    }

    res.status(responseCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//Send Message
app.post('/send_message', jsonParser, async (req, res) => {
    const queryResult = await sendMessage(req.body.sender_user_id, req.body.receiver_user_id, req.body.message);
    const responsePayload = {};
    let responseCode = 201;

    if(queryResult.error){
        responsePayload.error_code = 400;
        responsePayload.error_title = 'Error';
        responsePayload.error_message = 'Error';
        responseCode = 400;
    }else{
        responsePayload.success_code = 201;
        responsePayload.success_title = 'Message Sent';
        responsePayload.success_message = 'Message was sent successfully.';
    }

    res.status(responseCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});