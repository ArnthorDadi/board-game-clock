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

  const createRoom = async () => {
    const { id, name } = session.data?.user ?? {};
    setShowModal(false);
    const doc = await WebsocketClient.rooms.createRoom(id, name, {minutes, buffer,increment});
    if (!doc) {
      return;
    }
    router.push(`/rooms/${doc.id}`);
  };

  const [minutes, setMinutes] = useState(10);
  const [buffer, setBuffer] = useState(20);
  const [increment, setIncrement] = useState(15);

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
            onClick={()=>setShowModal(true)}
            text={"Create room"}
            className={"min-w-full"}
          />
        </div>
      </div>
      <CreateGameModal
        showModal={showModal}
        title={"Create Game"}
        onCrossClick={() => setShowModal(false)}
        onCancelClick={() => setShowModal(false)}
        onAcceptClick={createRoom}
      >
        <div className={'flex flex-col gap-4'}>
          <div className={"row space-between flex"}>
            <Button
              className={"max-w-[50px] justify-self-start"}
              onClick={() => setMinutes(prev=>prev-1)}
              text={"-"}
            />
            <div className={"mx-auto my-auto flex-1"}>
              <p className={"my-auto text-center"}>
                {minutes} <span className={'text-orange-500'}>minutes</span>
              </p>
            </div>
            <Button
              className={"max-w-[50px] justify-self-end"}
              onClick={() => setMinutes(prev => prev + 1)}
              text={"+"}
            />
          </div>
          <p className={'text-base'}>Each Turn</p>
          <div className={"row space-between flex"}>
            <Button
                className={"max-w-[50px] justify-self-start"}
                onClick={() => setBuffer(prev => prev - 5)}
                text={"-"}
            />
            <div className={"mx-auto my-auto flex-1"}>
              <p className={"my-auto text-center"}>
                {buffer} <span className={'text-orange-500'}>buffer sec</span>
              </p>
            </div>
            <Button
                className={"max-w-[50px] justify-self-end"}
                onClick={() => setBuffer(prev => prev + 5)}
                text={"+"}
            />
          </div>
          <div className={"row space-between flex"}>
            <Button
                className={"max-w-[50px] justify-self-start"}
                onClick={() => setIncrement(prev => prev - 5)}
                text={"-"}
            />
            <div className={"mx-auto my-auto flex-1"}>
              <p className={"my-auto text-center"}>
                {increment} <span className={'text-orange-500'}>increment</span>
              </p>
            </div>
            <Button
                className={"max-w-[50px] justify-self-end"}
                onClick={() => setIncrement(prev => prev + 5)}
                text={"+"}
            />
          </div>
        </div>
      </CreateGameModal>
    </div>
  );
};

export default Rooms;
