import { createDataResponse } from "#utils/responses/index.js";

// usersConnected are stored in this variable
// TODO use cache
let usersConnected = {};

import { joinDefaultRooms } from "./joinDefaultRooms.js";

// store user to usersConnected
const storeUserConnected = (userId, socketId) => {
  if (Object.hasOwnProperty.call(usersConnected, userId.toString())) {
    usersConnected[userId].push(socketId);
  } else {
    usersConnected[userId] = [socketId];
  }
};

// delete the user from the usersConnected
const destroyUserConnected = (userId, socketId) => {
  if (userId) {
    usersConnected[userId] = usersConnected[userId].filter(
      (value) => value !== socketId
    );
  } else {
    for (const userId in usersConnected) {
      if (Object.hasOwnProperty.call(usersConnected, userId)) {
        if (usersConnected[userId].includes(socketId)) {
          usersConnected[userId] = usersConnected[userId].filter(
            (value) => value !== socketId
          );
        }
      }
    }
  }
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

//* we add the socketIO as the first argument to avoid circular dependencies
const connectHandler = (socketIO, socket) => {
  joinDefaultRooms(socketIO, socket);

  storeUserConnected(socket.request.payload.user.id, socket.id);

  socketIO.emit(
    "usersConnected:update",
    createDataResponse({
      users: indexUserConnected(),
    })
  );

  socket.on("disconnect", (reason) => {
    destroyUserConnected(socket?.request?.payload?.user?.id, socket.id);

    socketIO.emit(
      "usersConnected:update",
      createDataResponse({
        users: indexUserConnected(),
      })
    );
  });
};

export { connectHandler };
