import { type NextPage } from "next";
import { SessionStatus } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import {
  Collection,
  CollectionType,
  db,
  WebsocketClient,
} from "@/src/utils/Websocket";
import { useSession } from "next-auth/react";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Room } from "@/src/components/room/Room";
import { FC, useEffect, useState } from "react";
import { Button } from "@/components/button/Button";

const Rooms: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  const [websocketLoading, setWebsocketLoading] = useState(false);

  useEffect(() => {
    const signInAnonymously = async () => {
      setWebsocketLoading(true);
      try {
        await WebsocketClient.loginAnonymously();
      } catch (e) {
        console.error("WebsocketClient.loginAnonymously", { e });
      }
      setWebsocketLoading(false);
    };
    if (!WebsocketClient.isLoggedIn() && !websocketLoading) {
      signInAnonymously();
    }
  }, []);

  useEffect(() => {
    if (session.status === SessionStatus.Unauthenticated) {
      router.back();
    }
  }, [router, session.status]);

  return (
    <>
      {!WebsocketClient.isLoggedIn() && websocketLoading ? (
        <h1>Creating websocket connection...</h1>
      ) : null}
      {!WebsocketClient.isLoggedIn() && !websocketLoading ? (
        <h1>Failed creating websocket connection...</h1>
      ) : null}
      {WebsocketClient.isLoggedIn() ? <RoomList /> : null}
    </>
  );
};

const RoomList: FC = () => {
  const router = useRouter();
  const session = useSession();

  const [roomsData, loading, error] = useCollection(
    query(
      collection(db, Collection.Rooms),
      orderBy("createdAt", "desc"),
      limit(5)
    )
  );
  const rooms = roomsData?.docs
    .map(
      (doc) =>
        ({ id: doc.id, ...doc.data() } as {
          id: string;
        } & CollectionType<Collection.Rooms>)
    )
    .filter((room) => !room.hasGameStarted);

  const createRoom = async () => {
    const { id, name } = session.data?.user ?? {};
    const doc = await WebsocketClient.rooms.createRoom(id, name);
    if (!doc) {
      return;
    }
    router.push(`/rooms/${doc.id}`);
  };

  return (
    <div className={"w-full"}>
      {loading ? <p>Loading rooms...</p> : null}
      <h1 className={"text-lg font-bold"}>Rooms</h1>
      {(rooms?.length ?? 0) == 0 ? (
        <p className={"mb-5 text-xs"}>
          There are no active rooms right now, so lets create one!
        </p>
      ) : null}
      {(rooms?.length ?? 0) > 0 ? (
        <div className={"-z-10 flex w-full flex-col gap-4 p-6 pb-14"}>
          {rooms?.map((room) => (
            <Room key={room.id} {...room} />
          ))}
        </div>
      ) : null}
      <div className={"fixed bottom-16 left-0 right-0 z-10"}>
        <div className={"container mx-auto px-6"}>
          <Button
            onClick={createRoom}
            text={"Create room"}
            className={"min-w-full"}
          />
        </div>
      </div>
    </div>
  );
};

export default Rooms;
