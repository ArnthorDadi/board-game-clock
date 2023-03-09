import { useRouter } from "next/router";
import { Command, Player, WebsocketClient } from "@/src/utils/Websocket";
import { SessionStatus } from "@/components/layout/Navbar";
import { Button } from "@/components/button/Button";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useListenToRoom } from "@/src/hooks/WebsocketHooks";
import {
  DropdownIcon,
  DropdownIconProps,
  DropdownIcons,
} from "@/components/dropdown/DropdownIcon";
import { Separator } from "@/components/separator/Separator";
import { getTimeFromSeconds } from "@/src/utils/Utilities";
import {
  MIN_ADD,
  MIN_BUFFER,
  MIN_MINUTES,
} from "@/components/modals/CreateGameModal";
import { PlayerList } from "@/components/player-list/Playerlist";

export default function PostPage() {
  const session = useSession();
  const router = useRouter();

  const roomId = (router.query.id ?? "w") as string;

  const { data: room, loading } = useListenToRoom(roomId);

  const player = useMemo(
    () => ({
      id: session.data?.user?.id ?? "",
      name: session.data?.user?.name ?? "",
    }),
    [session.data?.user?.id, session.data?.user?.name]
  );
  const username = session.data?.user?.name ?? "";
  const players = room?.players;
  const operations = room?.operations;

  useEffect(() => {
    if (
      room?.hasGameStarted ||
      operations?.some((operations) => operations.command === Command.StartGame)
    ) {
      router.push(`/rooms/${roomId}/game`);
    }
  }, [roomId, operations, room?.hasGameStarted, router]);

  const leaveRoom = useCallback(async () => {
    console.log("leaveRoom ", { room, player });
    if (!room?.admin.id || !player.id || !player.name) {
      return;
    }
    await WebsocketClient.rooms.leaveRoom(roomId, player);
    if (room?.admin.id === session.data?.user.id) {
      await WebsocketClient.rooms.deleteRoom(roomId);
    }
    console.log("Leave", {});
  }, [room, session, roomId, player]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const doesRoomNotExist = !loading && !room;
    const isUserUnauthenticated =
      session.status === SessionStatus.Unauthenticated;

    if (isUserUnauthenticated || doesRoomNotExist) {
      console.log("Player is unauthenticated or Room does not exists", {
        isUserUnauthenticated,
        doesRoomNotExist,
      });
      router.back();
      return;
    } else if (
      session.status === SessionStatus.Loading ||
      typeof session.status === "undefined" ||
      typeof players === "undefined" ||
      players?.length === 0
    ) {
      return;
    }

    if (
      !!session?.data?.user.id &&
      !players.some((player) => player.id === session?.data?.user.id)
    ) {
      router.back();
    }
  }, [
    leaveRoom,
    loading,
    players,
    room,
    router,
    session?.data?.user.id,
    session.status,
  ]);

  const dropdownItems = useMemo(
    () =>
      [
        {
          items: [
            {
              text: "Leave",
              onClick: async () => {
                await leaveRoom();
              },
            },
          ],
        },
      ] as DropdownIconProps["itemGroups"],
    [leaveRoom]
  );

  const isUserAdmin = room?.admin.id === player.id;

  return (
    <div className={"flex flex-1 flex-col gap-4"}>
      <div className={"relative"}>
        <h1 className={"justify-self-center text-center text-2xl font-bold"}>
          {room?.name}
        </h1>
        <div className={"absolute top-0 right-0"}>
          <DropdownIcon
            icon={DropdownIcons.Cogwheel}
            itemGroups={dropdownItems}
            className={"flex justify-self-center"}
          />
        </div>
      </div>

      <div>
        <Separator />
        <div className={"flex w-full flex-row justify-between py-2 px-4"}>
          <div>
            <p className={"text-center text-sm text-gray-400"}>Time</p>
            <p className={"text-center text-sm text-gray-400"}>
              {getTimeFromSeconds(room?.seconds ?? MIN_MINUTES)}
            </p>
          </div>
          <div>
            <p className={"text-center text-sm text-gray-400"}>Buffer</p>
            <p className={"text-center text-sm text-gray-400"}>
              {getTimeFromSeconds(room?.buffer ?? MIN_BUFFER)}
            </p>
          </div>
          <div>
            <p className={"text-center text-sm text-gray-400"}>Add</p>
            <p className={"text-center text-sm text-gray-400"}>
              {getTimeFromSeconds(room?.increment ?? MIN_ADD)}
            </p>
          </div>
        </div>
        <Separator />
      </div>

      <div className={"flex flex-row justify-between"}>
        <p className={"text-xl font-bold"}>Admin</p>
        <p
          className={`text-lg font-bold ${
            isUserAdmin ? "text-orange-500" : ""
          }`}
        >
          {room?.admin.name}
        </p>
      </div>

      <Separator />

      <PlayerList players={room?.players} admin={room?.admin} />

      {!!room?.admin.id &&
      !!session.data?.user.id &&
      room?.admin.id === session.data?.user.id ? (
        <Button
          disabled={room?.players?.length <= 1}
          onClick={async () => {
            await WebsocketClient.rooms.startGame(roomId, {
              id: session.data?.user.id ?? "",
              name: session.data?.user.name ?? "",
            });
          }}
          text={"Start Game!"}
          className={"mx-auto"}
        />
      ) : null}
    </div>
  );
}
