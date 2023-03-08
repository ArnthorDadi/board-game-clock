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
import { CreateGameModal } from "@/components/modals/CreateGameModal";

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
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className={"flex w-full flex-col bg-green-500"}>
      {loading ? <p>Loading rooms...</p> : null}
      {(rooms?.length ?? 0) == 0 ? (
        <p className={"mb-5 text-center text-xs"}>
          There are no active rooms right now, so lets create one!
        </p>
      ) : null}
      <input
        placeholder={"Search..."}
        type={"text"}
        className={"rounded py-2 px-3"}
      />
      <div className={"shrink-1 relative flex flex-1 basis-auto bg-green-500"}>
        <div
          className={
            "absolute inset-0 flex flex-col overflow-auto bg-red-500 pt-4"
          }
        >
          {rooms?.map((room, index) => (
            <Room key={room.id} index={index} {...room} />
          ))}
        </div>
      </div>
      <div className={" mx-auto w-full pt-3"}>
        <Button
          onClick={() => setShowModal(true)}
          text={"Create room"}
          className={"min-w-full"}
        />
      </div>
      <CreateGameModal
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        isLocalGame={false}
      />
    </div>
  );
};

export default Rooms;
