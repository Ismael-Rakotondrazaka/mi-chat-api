import { messageResource } from "./messageResource.js";

/*
! if we want to get all messages from a conversation
! (no regarding if a message has been deleted by any user),
! then messageCollection won't work
  const messages = await targetConversation.getMessages(messageParams);
  const result = messageCollection(messages); // ! not working
*/
const messageCollection = (collection) =>
  collection.map((message) => messageResource(message));

export { messageCollection };
