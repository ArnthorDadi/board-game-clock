/* Players */
import {
  Collection,
  CollectionType,
  db,
  Player,
  WebsocketClient,
} from "@/src/utils/Websocket";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export const PlayersCollectionHelpingFunctions = {
  setPlayerInRoom: async (
    roomId: string | undefined | null,
    roomName: string | undefined | null,
    player: Player
  ) => {
    if (!roomId || !roomName || !player.id || !player.name) {
      return;
    }

    // Check if the player is in a room already
    const playerDocument = await getDoc(doc(db, Collection.Players, player.id));
    const room = await WebsocketClient.rooms._getRoom(roomId);
    const doesPlayerDocumentExist = playerDocument.exists();
    const doesRoomDocumentExist = !!room;

    if (doesPlayerDocumentExist && doesRoomDocumentExist) {
      await updateDoc(doc(db, Collection.Players, player.id), {
        inRoom: { id: roomId, name: roomName, joinedAt: serverTimestamp() },
      });
      return;
    } else if (!doesPlayerDocumentExist && doesRoomDocumentExist) {
      await addDoc(collection(db, Collection.Players), {
        id: player.id,
        name: player.name,
        inRoom: { id: roomId, name: roomName, joinedAt: serverTimestamp() },
      } as CollectionType<Collection.Players>);
    } else {
      await addDoc(collection(db, Collection.Players), {
        id: player.id,
        name: player.name,
        inRoom: undefined,
      } as CollectionType<Collection.Players>);
    }
  },
  getPlayerRooms: async (playerId: string) => {
    const playerDocument = await getDoc(doc(db, Collection.Players, playerId));
    return playerDocument.exists()
      ? (playerDocument.data() as CollectionType<Collection.Players>)
      : undefined;
  },
  leaveRoom: async (player: Player) => {
    await addDoc(collection(db, Collection.Players), {
      id: player.id,
      name: player.name,
      inRoom: undefined,
    } as CollectionType<Collection.Players>);
  },
};
