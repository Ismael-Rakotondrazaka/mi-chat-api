// usersConnected are stored in this variable
// TODO use cache
let usersConnected = {};

/*
  store user to usersConnected
  return true if it is the first socket connected of the user,
  false otherwise
*/
const storeUserConnected = (userId, socketId) => {
  let wasEmpty = false;

  if (Object.hasOwnProperty.call(usersConnected, userId.toString())) {
    if (usersConnected[userId].length === 0) wasEmpty = true;

    usersConnected[userId].push(socketId);
  } else {
    wasEmpty = true;
    usersConnected[userId] = [socketId];
  }

  return wasEmpty;
};

/*
  delete the user from the usersConnected
  return true if no socket of the user is connected after deletion,
  false otherwise
*/
const destroyUserConnected = (userId, socketId) => {
  let isEmpty = false;

  if (userId) {
    usersConnected[userId] = usersConnected[userId].filter(
      (value) => value !== socketId
    );

    if (usersConnected[userId].length === 0) isEmpty = true;
  } else {
    for (const userId in usersConnected) {
      if (Object.hasOwnProperty.call(usersConnected, userId)) {
        if (usersConnected[userId].includes(socketId)) {
          usersConnected[userId] = usersConnected[userId].filter(
            (value) => value !== socketId
          );

          if (usersConnected[userId].length === 0) isEmpty = true;
        }
      }
    }
  }

  return isEmpty;
};

// return an array of users connected
const indexUserConnected = () => {
  let result = [];
  for (const userId in usersConnected) {
    if (Object.hasOwnProperty.call(usersConnected, userId)) {
      if (usersConnected[userId].length > 0) {
        result.push(parseInt(userId));
      }
    }
  }
  return result;
};

export { indexUserConnected, storeUserConnected, destroyUserConnected };
