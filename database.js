import mysql from 'mysql2';

const conPool = mysql.createPool({
    host: 'localhost',
    database: 'giftogram',
    user: 'gog_user',
    password: 'gog_user'
}).promise();

export const register = async (email, password, firstName, lastName) => {
    const result = {
        error: false,
        data: null
    };
    const query = 'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)';
    const queryParams = [email, password, firstName, lastName];
    const [queryResult] = await conPool.query(query, queryParams);
    result.data = queryResult.insertId;

    return result;
};

export const login = async (email, password) => {
    const result = {
        error: false,
        data: null
    };
    const query = 'SELECT user_id, email, first_name, last_name FROM users WHERE email = ? AND password = ?';
    const queryParams = [email, password];
    const [queryResult] = await conPool.query(query, queryParams);
    result.data = queryResult[0];

    return result;
};

export const sendMessage = async (sender, receiver, message) => {
    const result = {
        error: false,
        data: null
    };
    const senderVerified = await verifyUser(sender);
    const receiverVerified = await verifyUser(receiver);

    if(senderVerified.length && receiverVerified.length){
        const query = 'INSERT INTO messages (sender_user_id, receiver_user_id, message, epoch) VALUES (?, ?, ?, ?)';
        const queryParams = [sender, receiver, message, Math.floor(Date.now() / 1000)];
        const [queryResult] = await conPool.query(query, queryParams);
        result.data = queryResult.insertId;
    }else{
        result.error = true;
    }

    return result;
};

export const viewMessages = async (user1, user2) => {
    const result = {
        error: false,
        data: null
    };
    const user1Verified = await verifyUser(user1);
    const user2Verified = await verifyUser(user2);

    if(user1Verified.length && user2Verified.length){
        const query = '(SELECT message_id, sender_user_id, message, epoch FROM messages WHERE sender_user_id = ? OR receiver_user_id = ?) INTERSECT (SELECT message_id, sender_user_id, message, epoch FROM messages WHERE sender_user_id = ? OR receiver_user_id = ?) ORDER BY epoch ASC';
        const queryParams = [user1, user1, user2, user2];
        const [queryResult] = await conPool.query(query, queryParams);
        result.data = queryResult;
    }else{
        result.error = true;
    }

    return result;
};

export const listAllUsers = async (requester) => {
    const result = {
        error: false,
        data: null
    };
    const userVerified = await verifyUser(requester);

    if(userVerified.length){
        const query = 'SELECT user_id, email, first_name, last_name FROM users WHERE user_id <> ?';
        const queryParams = [requester];
        const [queryResult] = await conPool.query(query, queryParams);
        result.data = queryResult;
    }else{
        result.error = true;
    }
    
    return result;
};

const verifyUser = async (userID) => {
    const query = 'SELECT user_id FROM users WHERE user_id = ?';
    const queryParams = [userID];
    let [queryResult] = await conPool.query(query, queryParams);
    return queryResult;
}