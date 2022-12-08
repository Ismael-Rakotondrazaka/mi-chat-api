import { createDataResponse } from "#utils/responses/index.js";
import { joinDefaultRooms } from "./joinDefaultRooms.js";
import { storeMessageHandler } from "./storeMessageHandler.js";
import {
  indexUserConnected,
  storeUserConnected,
  destroyUserConnected,
} from "./userConnected.js";

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

  socket.on("disconnect", () => {
    destroyUserConnected(socket?.request?.payload?.user?.id, socket.id);

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
};

export { connectHandler };
