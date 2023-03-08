import { useRouter } from "next/router";
import { Command, WebsocketClient } from "@/src/utils/Websocket";
import { SessionStatus } from "@/components/layout/Navbar";
import { Button } from "@/components/button/Button";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useListenToRoom } from "@/src/hooks/WebsocketHooks";
import {
  DropdownGroupItems,
  DropdownIcon,
  DropdownIconProps,
  DropdownIcons,
} from "@/components/dropdown/DropdownIcon";

export default function PostPage() {
  const session = useSession();
  const router = useRouter();

  const teamId = (router.query.id ?? "w") as string;

  const { data: room, loading } = useListenToRoom(teamId);

  const username = session.data?.user?.name ?? "";
  const players = room?.players;
  const operations = room?.operations;

  useEffect(() => {
    if (
      room?.hasGameStarted ||
      operations?.some((operations) => operations.command === Command.StartGame)
    ) {
      router.push(`/rooms/${teamId}/game`);
    }
  }, [teamId, operations, room?.hasGameStarted, router]);

  const leaveRoom = useCallback(async () => {
    if (!room?.admin.id || !session.data?.user.id || !session.data?.user.name) {
      return;
    }
    await WebsocketClient.rooms.leaveRoom(teamId, {
      id: session.data?.user.id ?? "",
      name: session.data?.user.name ?? "",
    });
    if (room?.admin.id === session.data?.user.id) {
      await WebsocketClient.rooms.deleteRoom(teamId);
    }
  }, [teamId, room?.admin.id, session.data?.user.id, session.data?.user.name]);

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
      console.log("Player is not in room", { id: session?.data?.user.id });
      // router.back();
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
              text: "Change admin",
              onClick: () => console.log("Change admin", {}),
            },
          ],
        },
      ] as DropdownIconProps["itemGroups"],
    []
  );
  const bottomItem = useMemo(
    () =>
      ({
        text: "Leave",
        onClick: () => console.log("Leave", {}),
      } as DropdownIconProps["bottomItem"]),
    []
  );

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
            bottomItem={bottomItem}
            className={"flex justify-self-center"}
          />
        </div>
      </div>
      <div className={"grid grid-cols-2 grid-rows-2 content-center gap-4"}>
        <p
          className={"my-auto justify-self-start text-center text-lg font-bold"}
        >
          Admin:
        </p>
        <p
          className={`my-auto justify-self-end text-base font-bold ${
            room?.admin.name === username ? "text-orange-500" : ""
          }`}
        >
          {room?.admin.name}
        </p>
        <p className={"justify-self-start text-center text-lg font-bold"}>
          Players:
        </p>
        <ul className={"my-auto"}>
          {players?.map((player) => (
            <li key={player.id}>
              <p
                className={`text-right text-base ${
                  player.name === username ? "font-bold text-orange-500" : ""
                }`}
              >
                {player.name}
              </p>
            </li>
          ))}
          {room?.players.length === 1 ? (
            <p className={"my-auto text-right text-xs"}>
              Waiting for other players to join...
            </p>
          ) : null}
        </ul>
      </div>
      {!!room?.admin.id &&
      !!session.data?.user.id &&
      room?.players?.length > 1 &&
      room?.admin.id === session.data?.user.id ? (
        <Button
          onClick={async () => {
            await WebsocketClient.rooms.startGame(teamId, {
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
