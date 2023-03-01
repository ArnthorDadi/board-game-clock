// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore, Timestamp} from "firebase/firestore";
import {getAuth, signInAnonymously} from "firebase/auth";
import {RoomsCollectionHelpingFunctions} from "@/src/utils/collections/Rooms";
import {PlayersCollectionHelpingFunctions} from "@/src/utils/collections/Players";
import {env} from "@/src/env.mjs";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export type Player = {
  id: string;
  name: string;
};

export enum Command {
  StartGame = "StartGame",
  EndTurn = "EndTurn",
  StopTime = "StopTime",
  PreviousTurn = "PreviousTurn",
  ResetTime = "ResetTime",
  SetTime = "SetTime",
}

type Operation = {
  command: Command;
  sentBy: Player;
};

export enum Collection {
  Rooms = "rooms",
  Players = "players",
}

type DbTypes<C extends Collection> = {
  collection: C;
} & (
  | {
      collection: Collection.Rooms;
      name: string;
      /* Admin is the one that created the game and has all administrator privileges in the room */
      admin: Player;
      /* Yes, the players array contains the admin */
      players: (Player & { seconds: number })[];
      operations: Operation[];
      playerTurn: Player;
      seconds: number;
      isPaused: boolean;
      hasGameStarted: boolean;
      createdAt: Timestamp;
      updatedAt: Timestamp;
    }
  | {
      collection: Collection.Players;
      id: string;
      name: string;
      inRoom: { id: string; name: string; joinedAt: Timestamp } | undefined;
    }
);

export type CollectionType<C extends Collection> = Omit<
  DbTypes<C>,
  "collection"
>;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/* Websocket */
export class WebsocketClient {
  /* Collections */

  static rooms = RoomsCollectionHelpingFunctions;
  static players = PlayersCollectionHelpingFunctions;

  static async loginAnonymously() {
    await signInAnonymously(auth);
  }

  static isLoggedIn = () => !!auth.currentUser;
  static getCurrentUser = () => auth.currentUser;

  static async logout() {
    await auth.signOut();
  }
}
