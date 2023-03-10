# mi-chat-api

mi-chat is a free instant messaging web application. You can make friends and chat with them. You can share photos, videos or files. To chat with a group of peoples, you just need to create group chat.

Live: [https://mi-chat.onrender.com](https://mi-chat.onrender.com), enjoy :wink:

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Production mode

```sh
npm run start
```

## Responses
There are two types of responses with this api: **data** and **error**

### Data
```js
data: {
    user: {
        id: 1,
        ...
    },
    ...
}
```

### Error
```js
error: {
    message: "The resource is not found.",
    statusCode: 400,
    statusText: "Not Found",
    code: "E3",
    dateTime: "2023-01-21T16:47:21.886Z",
}
```

### Error codes
They are **NOT** arranged by topic or subject.
| code   | Description                                                                       |
| ------ | --------------------------------------------------------------------------------- |
| **E0** | General UnknownError                                                              |
| **E1** | General ServerError                                                               |
| E1_1   | trying to set 'fullName' of an User model                                         |
| E1_2   | trying to use inexistant source policy                                            |
| E1_3   | trying to use inexistant action policy                                            |
| E1_4   | Not implemented yet                                                               |
| **E2** | General BadRequestError                                                           |
| E2_1   | Field 'email' is missing                                                          |
| E2_2   | Field 'email' is not a string                                                     |
| E2_3   | Field 'email' is an invalid email address                                         |
| E2_4   | Field 'password' is missing                                                       |
| E2_5   | Field 'password' is not a string                                                  |
| E2_6   | Field 'password' is less than 8 (default) characters                              |
| E2_7   | Field 'firstName' is missing                                                      |
| E2_8   | Field 'firstName' is not a string                                                 |
| E2_9   | Field 'firstName' is more than 20 (default) characters                            |
| E2_10  | Field 'lastName' is missing                                                       |
| E2_11  | Field 'lastName' is not a string                                                  |
| E2_12  | Field 'lastName' is more than 20 (default) characters                             |
| E2_13  | Field 'passwordValidation' is missing                                             |
| E2_14  | Field 'passwordValidation' is different of 'password'                             |
| E2_15  | Field 'description' is not a string                                               |
| E2_16  | Field 'description' is more than 100 (default) characters                         |
| E2_17  | Field 'refreshToken' is missing                                                   |
| E2_18  | No change found                                                                   |
| E2_19  | Field 'userId' is required                                                        |
| E2_20  | Field 'userId' is in a bad format                                                 |
| E2_21  | Field user with 'userId' as id does not exist                                     |
| E2_22  | Field 'firstName' contains non-Unicode letters, numbers or special characters     |
| E2_23  | Field 'lastName' contains non-Unicode letters, numbers or special characters      |
| E2_24  | Field 'groupName' is missing                                                      |
| E2_25  | Field 'participants' is missing                                                   |
| E2_26  | Field 'participants' is in a bad format                                           |
| E2_27  | One or more id in field 'participants' are in a bad format                        |
| E2_28  | Field 'participants' contains auth user id                                        |
| E2_29  | User with id in field 'participants' does not exist                               |
| E2_30  | User with id in field 'participants' are not friends of the auth user             |
| E2_31  | Field 'description' (of conversation) is not a string                             |
| E2_32  | Field 'description' (of conversation) is more than 100 (default) characters       |
| E2_33  | Field 'groupName' is not a string                                                 |
| E2_34  | Field 'groupName' is more than 40 (default) characters                            |
| E2_35  | Field 'participants' does not contain enough user id                              |
| E2_36  | Field 'role' is missing                                                           |
| E2_37  | Field 'role' is other than 'participant' or 'admin'                               |
| E2_38  | Trying to downgrade an admin of a conversation                                    |
| E2_39  | Field 'nickname' is not a string                                                  |
| E2_40  | Field 'nickname' is more than 20 (default) characters                             |
| E2_41  | Field 'content' is missing                                                        |
| E2_42  | Field 'content' of message with type 'text' is not a string                       |
| E2_43  | Field 'content' of message is an empty string                                     |
| E2_44  | Field 'content' of message with type 'text' is more than 300 (default) characters |
| E2_45  | Field 'conversationId' is missing                                                 |
| E2_46  | Field 'conversationId' is in a bad format                                         |
| E2_47  | Conversation with id 'conversationId' does not exist                              |
| E2_48  | The file uploaded has not a valid image mimetype                                  |
| E2_49  | Field 'database' is missing                                                       |
| **E3** | General NotFoundError                                                             |
| **E4** | General ConflictError                                                             |
| E4_1   | 'email' is already in use                                                         |
| E4_2   | Trying to send friend request to itself                                           |
| E4_3   | Trying to send a friend request to a friend                                       |
| E4_4   | Already have a friend request from the target user when creating a friend request |
| E4_5   | Already sent a friend request to the target user when creating a friend request   |
| E4_6   | Trying to add a participant to a conversation where he is already a member        |
| **E5** | General UnauthorizedError                                                         |
| **E6** | General ForbiddenError                                                            |
| E6_1   | Authentication check failed                                                       |
| E6_2   | Authentication failed                                                             |
