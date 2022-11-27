# mi-chat-api

## Errors

### Error code
| code   | Description                                               |
| ------ | --------------------------------------------------------- |
| **E0** | General UnkownError                                       |
| **E1** | General ServerError                                       |
| E1_1   | trying to set 'fullName' of an User model                 |
| **E2** | General BadRequestError                                   |
| E2_1   | Field 'email' is missing                                  |
| E2_2   | Field 'email' is not a string                             |
| E2_3   | Field 'email' is an invalid email address                 |
| E2_4   | Field 'password' is missing                               |
| E2_5   | Field 'password' is not a string                          |
| E2_6   | Field 'password' is less than 8 (default) characters      |
| E2_7   | Field 'firstName' is missing                              |
| E2_8   | Field 'firstName' is not a string                         |
| E2_9   | Field 'firstName' is more than 20 (default) characters    |
| E2_10  | Field 'lastName' is missing                               |
| E2_11  | Field 'lastName' is not a string                          |
| E2_12  | Field 'lastName' is more than 20 (default) characters     |
| E2_13  | Field 'passwordValidation' is missing                     |
| E2_14  | Field 'passwordValidation' is different of 'password'     |
| E2_15  | Field 'description' is not a string                       |
| E2_16  | Field 'description' is more than 100 (default) characters |
| E2_17  | Field 'refreshToken' is missing                           |
| **E3** | General NotFoundError                                     |
| **E4** | General ConflictError                                     |
| E4_1   | 'email' is already in use                                 |
| **E5** | General UnauthorizedError                                 |
| **E6** | General ForbiddenError                                    |
