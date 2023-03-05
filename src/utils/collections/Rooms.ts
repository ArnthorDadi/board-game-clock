/* Rooms */
import { getRandomHarryPotterName } from "@/assets/harry-potter/Utilities";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  Collection,
  CollectionType,
  Command,
  db,
  Player,
} from "@/src/utils/Websocket";
import rooms from "@/src/pages/rooms";

export const RoomsCollectionHelpingFunctions = {
  createRoom: async (
    id: string | undefined | null,
    name: string | undefined | null,
    game: { minutes: number; buffer: number; increment: number }
  ) => {
    if (!name || !id) {
      return;
    }
    const admin = { id, name } as Player;
    const roomName = getRandomHarryPotterName();
    const addedDoc = await addDoc(collection(db, Collection.Rooms), {
      name: roomName,
      admin,
      playerTurn: admin,
      players: [{ ...admin, seconds: game.minutes * 60 }],
      operations: [],
      seconds: game.minutes * 60,
      buffer: game.buffer,
      increment: game.increment,
      hasGameStarted: false,
      isPaused: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    } as CollectionType<Collection.Rooms>);
    return addedDoc;
  },

  joinRoom: async (
    id: string | undefined | null,
    player: Player | undefined
  ) => {
    if (!id || !player || !player.id || !player.name) {
      return;
    }

    const room = await RoomsCollectionHelpingFunctions._getRoom(id);
    if (!room) {
      console.error("Room does not exist", { id });
      return;
    }

    if (room.hasGameStarted) {
      console.error("game has already started", { roomId: id });
      return;
    }

    if (room.players.some((roomPlayer) => roomPlayer.id === player.id)) {
      console.error("Player is already in room", {
        id,
        playerId: player.id,
        playerName: player.name,
      });
      return;
    }

    await updateDoc(doc(db, Collection.Rooms, id), {
      players: [...room.players, { ...player, seconds: room.seconds }],
    });
  },

  _getRoom: async (id: string | undefined | null) => {
    if (!id) {
      return undefined;
    }
    const roomDocument = await getDoc(doc(db, Collection.Rooms, id));
    if (!roomDocument.exists()) {
      console.error("Room does not exist", { id });
      return undefined;
    }
    return roomDocument.data() as CollectionType<Collection.Rooms>;
  },

  leaveRoom: async (
    id: string | undefined | null,
    player: Player | undefined
  ) => {
    if (!id || !player || !player.id || !player.name) {
      return;
    }

    const room = await RoomsCollectionHelpingFunctions._getRoom(id);
    if (!room) {
      console.error("Room does not exist", { id });
      return;
    }

    if (!room.players.some((roomPlayer) => roomPlayer.id === player.id)) {
      console.error("Player is not in room", {
        id,
        playerId: player.id,
        playerName: player.name,
      });
      return;
    }

    await updateDoc(doc(db, Collection.Rooms, id), {
      players: room.players.filter((roomPlayer) => roomPlayer.id !== player.id),
    });
  },

  deleteRoom: async (id: string | undefined | null) => {
    if (!id) {
      return;
    }

    const room = await RoomsCollectionHelpingFunctions._getRoom(id);
    if (!room) {
      console.error("Room does not exist", { id });
      return;
    }

    await deleteDoc(doc(db, Collection.Rooms, id));
  },
  startGame: async (roomId: string | undefined | null, player: Player) => {
    if (!roomId || !player.id || !player.name) {
      return;
    }
    const room = await RoomsCollectionHelpingFunctions._getRoom(roomId);
    if (!room || room.hasGameStarted) {
      console.error("Room does not exists or the game has already started", {
        hasGameStarted: !!room?.hasGameStarted,
        room: !!room,
      });
      return;
    }
    await updateDoc(doc(db, Collection.Rooms, roomId), {
      operations: [
        {
          command: Command.StartGame,
          sentBy: player,
        },
        ...(room?.operations ?? []),
      ],
      hasGameStarted: true,
    });
  },
  endTurn: async (
    roomId: string | undefined | null,
    remainingSeconds: number,
    player: Player
  ) => {
    if (!roomId) {
      return;
    }
    const room = await RoomsCollectionHelpingFunctions._getRoom(roomId);
    if (!room || !room.hasGameStarted) {
      console.error("Room does not exists or the game has not started", {
        hasGameStarted: !!room?.hasGameStarted,
        room: !!room,
      });
      return;
    }
    const nextPlayerIndex =
      (room.players.findIndex((player) => player.id === room.playerTurn.id) +
        1) %
      room.players.length;
    const nextPlayer = room.players[nextPlayerIndex] as typeof room.players[0];

    await updateDoc(doc(db, Collection.Rooms, roomId), {
      players: room.players.map((roomPlayer) => {
        if (roomPlayer.id === room.playerTurn.id) {
          return {
            id: roomPlayer.id,
            name: roomPlayer.name,
            seconds: remainingSeconds + room.increment,
          };
        }
        return roomPlayer;
      }),
      operations: [
        {
          command: Command.EndTurn,
          sentBy: player,
        },
        ...(room?.operations ?? []),
      ],
      playerTurn: { id: nextPlayer.id, name: nextPlayer.name },
    });
  },
  stopOrStartTimer: async (
    roomId: string | undefined | null,
    player: Player,
    remainingSeconds: number
  ) => {
    if (!roomId || typeof remainingSeconds === "undefined") {
      return;
    }
    const room = await RoomsCollectionHelpingFunctions._getRoom(roomId);
    if (!room || !room.hasGameStarted) {
      console.error("Room does not exists or the game has not started", {
        hasGameStarted: !!room?.hasGameStarted,
        room: !!room,
      });
      return;
    }
    await updateDoc(doc(db, Collection.Rooms, roomId), {
      players: room.players.map((roomPlayer) => {
        if (roomPlayer.id === room.playerTurn.id) {
          return {
            id: roomPlayer.id,
            name: roomPlayer.name,
            seconds: remainingSeconds,
          };
        }
        return roomPlayer;
      }),
      isPaused: !room.isPaused,
      operations: [
        {
          command: Command.StopTime,
          sentBy: player,
        },
        ...(room?.operations ?? []),
      ],
    });
  },
  resetTime: async (roomId: string, player: Player) => {
    const room = await RoomsCollectionHelpingFunctions._getRoom(roomId);
    if (!room || !room.hasGameStarted) {
      console.error("Room does not exists or the game has not started", {
        hasGameStarted: !!room?.hasGameStarted,
        room: !!room,
      });
      return;
    }
    const defaultTime = room.seconds;
    const playerTurn = room.playerTurn;
    const newPlayersWithTime = room.players.map((player) => {
      if (player.id === playerTurn.id) {
        return {
          id: player.id,
          name: player.name,
          seconds: defaultTime,
        };
      }
      return player;
    });
    const nextPlayerIndex =
      (room.players.findIndex((player) => player.id === room.playerTurn.id) +
        1) %
      room.players.length;
    const nextPlayer = room.players[nextPlayerIndex] as typeof room.players[0];

    await updateDoc(doc(db, Collection.Rooms, roomId), {
      playerTurn: nextPlayer,
      players: newPlayersWithTime,
      operations: [
        {
          command: Command.ResetTime,
          sentBy: player,
        },
        ...(room?.operations ?? []),
      ],
    });
  },
  previousPlayer: async (roomId: string, player: Player) => {
    const room = await RoomsCollectionHelpingFunctions._getRoom(roomId);
    if (!room || !room.hasGameStarted) {
      console.error("Room does not exists or the game has not started", {
        hasGameStarted: !!room?.hasGameStarted,
        room: !!room,
      });
      return;
    }
    const playerIndex = room.players.findIndex(
      (player) => player.id === room.playerTurn.id
    );
    const previousPlayerIndex =
      playerIndex - 1 >= 0 ? playerIndex - 1 : room.players.length - 1;
    const previousPlayer = room.players[
      previousPlayerIndex
    ] as typeof room.players[0];

    await updateDoc(doc(db, Collection.Rooms, roomId), {
      operations: [
        {
          command: Command.PreviousTurn,
          sentBy: player,
        },
        ...(room?.operations ?? []),
      ],
      playerTurn: { id: previousPlayer.id, name: previousPlayer.name },
    });
  },
};
