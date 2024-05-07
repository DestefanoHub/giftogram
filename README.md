# giftogram

giftogram assessment

### Name:

Andrew De Stefano

### Completion Time:

3 hours

### Methodology:

The application is a Node.js application that uses Express for the API and mysql2 for the database. It is split into two files, index.js and database.js.

index.js is the API file, where the Express server is created and the endpoints and other server logic are handled. The five endpoints are defined, along with an error handler to deal with returning an error response if the application encounters a problem. Each endpoint can return an error response, structured as specified in the document, whether or not the API document indicated the endpoint should return an error response. The error handling is mostly basic; for example, it does not differentiate between the different database errors that could arise (such as failing a foreign key constraint on receiver_user_id when sending a message). Each of the endpoints also checks that the necessary data is provided, and for send_message and view_messages it requires that the two user ids are not the same.

database.js is the file that handles connecting to the MySQL database. This module exports five functions, one for each of the API requests. All of the queries have parameterized inputs to avoid sql injections. The verifyUser function is not exported as it is an internal helper function. While it would be possible to use the login function to verify if a user id corresponds to a valid user, this would not be a valid strategy long-term as the login function may eventually feature other functionality that would be improper to repeat.

All of the queries are straightforward, with the exception of the viewing all messages between two users. The API states that the request should contain two user ids, and that the request should return all messages exchanged between these two users. However, it does not stipulate that one user is the sender or receiver. I interpreted this as: (messages where user a is the sender OR receiver) AND (messages where user b is the sender OR receiver).

The database itself contains a users and messages table.

The users table has the following fields:

1. user_id as the autoincrementing primary key
2. email with a unique constraint
3. first_name
4. last_name
5. password

The messages table has the following fields:

1. message_id as the autoincrementing primary key
2. sender_user_id which is indexed and is a foreign key for users.user_id
3. receiver_user_id which is indexed and is a foreign key for users.user_id
4. message
5. epoch (seconds since the unix epoch)

### API Issues

#### /register

1. It does not stipulate that this endpoint is to be accessed while unauthenticated only.
2. This is an API, and thus while the API consumer should not be privy to the details of how the API handles the request, there should be some description of the security measures taken to secure the password, such as the use of a salt with a hashing algorithm.

#### /login

1. It does not stipulate that this endpoint is to be accessed while unauthenticated only.
2. This endpoint does not describe or return any sort of token or value to use to prove authentication.

#### /view_messages

1. It does not stipulate that this endpoint requires authentication, or how to provide said authentication.
2. Sending a GET request with a BODY is atypical, see [GET - HTTP | MDN (mozilla.org)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET).
3. There should be some concept of a conversation so that messages can be grouped together.
4. The results should also be paged so that the user isn’t flooded with a large number of results at once. This may also include some sort of filter/sort functionality.
5. It does not indicate that either the sender or recipient of the messages is the user making the request. Thus, anyone could read all the messages between any two users knowing either the sender_user_id or the receiver_user_id.

#### send_message

1. It does not stipulate that this endpoint requires authentication, or how to provide said authentication.
2. There should be some way to prevent a user from sending messages to another user if the intended recipient does not wish to receive messages from the sender.
3. It does not indicate that the message sender is the authenticated user. Thus, anyone could pretend to be any user by simply knowing the user_id and send messages masquerading as another user.

#### list_all_users

1. It does not stipulate that this endpoint requires authentication, or how to provide said authentication.
2. Sending a GET request with a BODY is atypical, see [GET - HTTP | MDN (mozilla.org)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET).
3. The results should also be paged so that the user isn’t flooded with a large number of results at once. This may also include some sort of filter/sort functionality.

### API Changes

1. None of the endpoints state their necessary request headers and values. For example, it may be fine to infer things such as the request content type from the examples, but the API may support multiple content types. It should be clearly indicated what header/value pairs the requests expect.
2. None of the endpoints state their response headers and values. Like the point above, the idea is simply that if the API is for external consumption (or really, in general), it should be evidently clear exactly what the response, in its entirety, would look like.
3. None of the endpoints state their status codes. Both the error_code in the response and the HTTP status codes should be listed per request to allow applications using the API to properly handle errors.
4. The /login endpoint does not provide any authentication means in the response. Some of these requests clearly would require authentication to prevent non-users from accessing the application’s data.
5. There are no user types, so there cannot be admin users. Some of the requests provide too much information that a regular user should not have access to, such as viewing all messages sent by all other users. User types and admin users should be included, even if the admin users need to be created manually in the database.