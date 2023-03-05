import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { CountdownClock } from "@/components/CountdownClock";
import {
  Collection,
  CollectionType,
  WebsocketClient,
} from "@/src/utils/Websocket";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { useCountdown } from "@/src/hooks/useCountdown";
import { useListenToRoom } from "@/src/hooks/WebsocketHooks";
import { clamp } from "lodash";
import { MIN_NR_MINUTES } from "@/src/pages";
import { Button } from "@/components/button/Button";


const Game: NextPage = () => {
  const session = useSession();
  const player = useMemo(
    () => ({
      id: session.data?.user.id ?? "",
      name: session.data?.user.name ?? "",
    }),
    [session]
  );
  const router = useRouter();

  const roomId = (router.query.id ?? "w") as string;

  const { data: room, loading, error } = useListenToRoom(roomId);

  const currentPlayer = room?.players.find(
    (player) => player.id === room?.playerTurn?.id
  ) as CollectionType<Collection.Rooms>["players"][0];

  const isCurrentPlayer =
    typeof player !== "undefined" &&
    typeof currentPlayer !== "undefined" &&
    player?.id === currentPlayer?.id;
  const isTimePaused = !!room?.isPaused;
  const buffer = room?.buffer??20

  const [currentPlayerTime, bufferSeconds] = useCountdown(
    currentPlayer?.id,
      buffer,
    currentPlayer?.seconds ?? MIN_NR_MINUTES * 60,
    !isTimePaused
  );
  const nrOfPlayers = room?.players.length ?? 0;
  const isTimeUp = currentPlayerTime === 0;
  const remainingTimeInPercentages = clamp(
    currentPlayerTime / (room?.seconds ?? MIN_NR_MINUTES),
    0,
    1
  );
  const remainingBufferTimeInPercentages = clamp(
    (bufferSeconds - 1) / buffer,
    0,
    1
  );

  const onQuitGameClick = useCallback(async () => {
    if (!room?.admin.id || !player.id || !player.name) {
      return;
    }
    // console.log("Delete room", {});
    await WebsocketClient.rooms.deleteRoom(roomId);
    router.back();
  }, [room?.admin.id, player.id, player.name, roomId, router]);

  useEffect(() => {
    const doesRoomExists = async () => {
      const initialRoom = await WebsocketClient.rooms._getRoom(roomId);
      if (
        (!room || !room.hasGameStarted) &&
        (!initialRoom || !initialRoom.hasGameStarted)
      ) {
        console.error("Room does not exists or the game has not started", {
          room,
          hasGameStarted: room?.hasGameStarted,
          initialRoom,
          initialRoomHasGameStarted: initialRoom?.hasGameStarted,
        });
        router.back();
      }
    };
    doesRoomExists();
  }, [roomId, room, router]);

  // const onQuitGameClick = useCallback(() => {
  //   // todo:
  //   // - Remove the player from the room
  //   // - if the player is the admin kick everyone and delete the room
  //   // - Check if the room would have lower then the minimum number of players,
  //   //   kick everyone and delete the room
  //   // localStorage.clear();
  //   // router.push("/");
  // }, []);

  const nextPlayerTurn = useCallback(async () => {
    if (isTimeUp) {
      console.error("Time is up!", {});
      return;
    }
    if (
      !!session.data?.user.id &&
      room?.playerTurn.id !== session.data?.user.id
    ) {
      console.error("not your turn", {
        playerTurnId: room?.playerTurn.id,
        yourId: session.data?.user.id,
      });
      return;
    }
    await WebsocketClient.rooms.endTurn(roomId, currentPlayerTime, player);
    // Todo:
  }, [
    isTimeUp,
    session.data?.user.id,
    room?.playerTurn.id,
    roomId,
    currentPlayerTime,
    player,
  ]);

  const previousPlayerTurn = useCallback(async () => {
    // console.log("Previous player", {});
    if (isTimeUp) {
      // console.error("Time is up!", {});
      return;
    }
    if (
      !!session.data?.user.id &&
      room?.playerTurn.id !== session.data?.user.id
    ) {
      console.error("not your turn", {
        playerTurnId: room?.playerTurn.id,
        yourId: session.data?.user.id,
      });
      return;
    }
    if (!player || !player.id || !player.name) {
      console.error("Player is not ready", { player });
      return;
    }
    await WebsocketClient.rooms.previousPlayer(roomId, player);
    // console.log("Previous player done", {});
  }, [isTimeUp, player, room?.playerTurn.id, roomId, session.data?.user.id]);

  const onPauseTimeClick = useCallback(async () => {
    await WebsocketClient.rooms.stopOrStartTimer(
      roomId,
      player,
      currentPlayerTime
    );
    // Todo:
  }, [currentPlayerTime, roomId, player]);

  const onResetMyTimeClick = useCallback(async () => {
    await WebsocketClient.rooms.resetTime(roomId, player);
    // Todo:
  }, [player, roomId]);

  return (
    <div className={"flex flex-1 flex-col gap-4"}>
      <div className={"mr-auto"}>
        <Button onClick={onQuitGameClick} text={"Quit"} />
      </div>
      {/* Clock */}
      <button
        type="button"
        className={"relative flex flex-1"}
        onClick={nextPlayerTurn}
      >
        <div className={"flex h-full w-full flex-col py-4"}>
          <div
            className={"align-center flex flex-[0.75] flex-row justify-evenly"}
          >
            {room?.players.map((player, index) => (
              <Fragment key={player.id}>
                <p
                  className={`my-auto ${
                    player.id === currentPlayer.id && "text-2xl font-bold"
                  } ${
                    player.id === session?.data?.user.id && "text-orange-500"
                  }`}
                >
                  {player.name}
                </p>
                {index + 1 !== nrOfPlayers ? (
                  <p className={"my-auto"}>-</p>
                ) : null}
              </Fragment>
            ))}
          </div>
          <CountdownClock
            {...{
              countdownKey: currentPlayer?.id,
              currentPlayerTime,
              remainingTimeInPercentages,
              bufferSeconds,
              remainingBufferSecondsInPercentages:
                remainingBufferTimeInPercentages,
              isTimeUp,
            }}
          />
        </div>
      </button>
      <div className={"flex w-full flex-col justify-items-center gap-4"}>
        {isTimeUp && isCurrentPlayer ? (
          <Button
            onClick={onResetMyTimeClick}
            text={"Reset my time"}
            className={"mx-auto"}
          />
        ) : null}
        <div className={"flex w-full flex-row justify-center gap-4"}>
          {!isTimeUp ? (
            <Button
              onClick={onPauseTimeClick}
              text={isTimePaused ? "Start" : "Stop"}
            />
          ) : null}
          {isCurrentPlayer ? (
            <Button onClick={previousPlayerTurn} text={"Previous"} />
          ) : null}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div>
  //     <h1>Online Game</h1>
  //     {/* Clock */}
  //     <button
  //       type="button"
  //       className={"relative flex flex-1"}
  //       onClick={nextPlayerTurn}
  //     >
  //       <div className={"flex h-full w-full flex-col py-4"}>
  //         <div
  //           className={"align-center flex flex-[0.75] flex-row justify-evenly"}
  //         >
  //           {room?.players.map((player, index) => (
  //             <Fragment key={`${player.id}`}>
  //               <p
  //                 className={`my-auto ${
  //                   player.id === room?.playerTurn?.id && "text-2xl font-bold"
  //                 } ${
  //                   player.id === session?.data?.user.id && "text-orange-500"
  //                 }`}
  //               >
  //                 {player.name}
  //               </p>
  //               {index + 1 !== nrOfPlayers ? (
  //                 <p className={"my-auto"}>-</p>
  //               ) : null}
  //             </Fragment>
  //           ))}
  //         </div>
  //         <CountdownClock
  //           {...{
  //             countdownKey: currentPlayer.id,
  //             currentPlayerTime,
  //             remainingTimeInPercentages,
  //             isTimeUp,
  //           }}
  //         />
  //       </div>
  //     </button>
  //     <div className={"flex w-full flex-col justify-items-center gap-4"}>
  //       {isTimeUp ? (
  //         <Button
  //           onClick={onResetMyTimeClick}
  //           text={"Reset my time"}
  //           className={"mx-auto"}
  //         />
  //       ) : null}
  //       <div className={"flex w-full flex-row justify-center gap-4"}>
  //         <Button
  //           onClick={onPauseTimeClick}
  //           text={isTimePaused ? "Start" : "Stop"}
  //         />
  //         <Button onClick={previousPlayerTurn} text={"Previous"} />
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default Game;
