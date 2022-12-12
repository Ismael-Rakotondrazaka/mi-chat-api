import { createDataResponse } from "#utils/responses/index.js";
import { joinDefaultRooms } from "./joinDefaultRooms.js";
import { joinRoomHandler } from "./joinRoomHandler.js";
import { leaveRoomHandler } from "./leaveRoomHandler.js";
import { storeMessageHandler } from "./storeMessageHandler.js";
import {
  indexUserConnected,
  storeUserConnected,
  destroyUserConnected,
} from "./userConnected.js";

//* we add the socketIO as the first argument to avoid circular dependencies
const connectHandler = (socketIO, socket) => {
  joinDefaultRooms(socketIO, socket);

  const isNew = storeUserConnected(socket.request.payload.user.id, socket.id);

  if (isNew) {
    // if a new user is connected for the first time, we notify everyone
    socketIO.emit(
      "usersConnected:update",
      createDataResponse({
        users: indexUserConnected(),
      })
    );
  } else {
    // otherwise we notify only the new socket connected
    socket.emit(
      "usersConnected:update",
      createDataResponse({
        users: indexUserConnected(),
      })
    );
  }

  socket.on("disconnect", () => {
    const isEmpty = destroyUserConnected(
      socket?.request?.payload?.user?.id,
      socket.id
    );

    if (isEmpty)
      // if this socket was the last connected we notify the others user
      socketIO.emit(
        "usersConnected:update",
        createDataResponse({
          users: indexUserConnected(),
        })
      );
  });

  socket.on("messages:store", (payload) => {
    storeMessageHandler(socketIO, socket, payload);
  });

  socket.on("conversations:join", (payload) => {
    joinRoomHandler(socketIO, socket, payload);
  });

  socket.on("conversations:leave", (payload) => {
    leaveRoomHandler(socketIO, socket, payload);
  });
};

export { connectHandler };
