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
app.get('/view_messages', jsonParser, async (req, res, next) => {
    if(!(req.body.user_id_a && req.body.user_id_b)){
        const error = new Error('Missing request information.');
        error.statusCode = 400;
        error.status = 'Error';
        next(error);
        return;
    }

    if(req.body.user_id_a === req.body.user_id_b){
        const error = new Error('The user ids must be different.');
        error.statusCode = 409;
        error.status = 'Same User';
        next(error);
        return;
    }
    
    const queryResult = await viewMessages(req.body.user_id_a, req.body.user_id_b);
    const responsePayload = {};

    if(queryResult.error){
        const error = new Error('Error attempting to retrieve messages');
        error.statusCode = 500;
        error.status = 'Error';
        next(error);
        return;
    }

    if(!queryResult.data.length){
        const error = new Error('No messages.');
        error.statusCode = 404;
        error.status = 'Error';
        next(error);
        return;
    }
    
    responsePayload.messages = queryResult.data;

    res.status(200);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//List All Users
app.get('/list_all_users', jsonParser, async (req, res, next) => {
    if(!(req.body.requester_user_id)){
        const error = new Error('Missing request information.');
        error.statusCode = 400;
        error.status = 'Error';
        next(error);
        return;
    }
    
    const queryResult = await listAllUsers(req.body.requester_user_id);
    const responsePayload = {};

    if(queryResult.error){
        const error = new Error('Error attempting to retrieve users.');
        error.statusCode = 500;
        error.status = 'Error';
        next(error);
        return;
    }

    if(!queryResult.data.length){
        const error = new Error('No users.');
        error.statusCode = 404;
        error.status = 'Error';
        next(error);
        return;
    }

    responsePayload.users = queryResult.data;

    res.status(200);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//POST
//Register
app.post('/register', jsonParser, async (req, res, next) => {
    if(!(req.body.email && !req.body.password && req.body.first_name && req.body.last_name)){
        const error = new Error('Missing account information.');
        error.statusCode = 400;
        error.status = 'Registration Error';
        next(error);
        return;
    }

    const queryResult = await register(req.body.email, req.body.password, req.body.first_name, req.body.last_name);
    const responsePayload = {};

    if(queryResult.error){
        const error = new Error('We were unable to register your account.');
        error.statusCode = 500;
        error.status = 'Registration Error';
        next(error);
        return;
    }

    responsePayload.user_id = queryResult.data;
    responsePayload.email = req.body.email;
    responsePayload.first_name = req.body.first_name;
    responsePayload.last_name = req.body.last_name;

    res.status(201);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//Login
app.post('/login', jsonParser, async (req, res, next) => {
    if(!(req.body.email && req.body.password)){
        const error = new Error('It seems that you have entered the wrong email and/or password.');
        error.statusCode = 401;
        error.status = 'Invalid Credentials';
        next(error);
        return;
    }

    const queryResult = await login(req.body.email, req.body.password);
    const responsePayload = {};

    if(queryResult.error){
        const error = new Error('It seems that you have entered the wrong email and/or password.');
        error.statusCode = 401;
        error.status = 'Invalid Credentials';
        next(error);
        return;
    }

    if(typeof queryResult.data === 'undefined'){
        const error = new Error('It seems that you have entered the wrong email and/or password.');
        error.statusCode = 401;
        error.status = 'Invalid Credentials';
        next(error);
        return;
    }

    responsePayload.user_id = queryResult.data.user_id;
    responsePayload.email = queryResult.data.email;
    responsePayload.first_name = queryResult.data.first_name;
    responsePayload.last_name = queryResult.data.last_name;

    res.status(200);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

//Send Message
app.post('/send_message', jsonParser, async (req, res, next) => {
    if(!(req.body.sender_user_id && req.body.receiver_user_id && req.body.message)){
        const error = new Error('Missing message information.');
        error.statusCode = 400;
        error.status = 'Message Not Sent';
        next(error);
        return;
    }

    if(req.body.sender_user_id === req.body.receiver_user_id){
        const error = new Error('The user ids must be different.');
        error.statusCode = 409;
        error.status = 'Same User';
        next(error);
        return;
    }

    const queryResult = await sendMessage(req.body.sender_user_id, req.body.receiver_user_id, req.body.message);
    const responsePayload = {};

    if(queryResult.error){
        const error = new Error('Error attempting to send message.');
        error.statusCode = 500;
        error.status = 'Message Not Sent';
        next(error);
        return;
    }

    responsePayload.success_code = 201;
    responsePayload.success_title = 'Message Sent';
    responsePayload.success_message = 'Message was sent successfully.';

    res.status(201);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(responsePayload);
});

app.use((error, req, res, next) => {
    const errorPayload = {};
    errorPayload.error_code = error.statusCode || 500;
    errorPayload.error_title = error.status || 'Error';
    errorPayload.error_message = error.message || 'An unexpected error has occurred.';

    res.status(error.statusCode);
    res.set({
        'Content-Type': 'application/json'
    });
    res.json(errorPayload);
});

//Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});