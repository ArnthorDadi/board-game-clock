import { type NextPage } from "next";
import { Fragment, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { clamp } from "lodash";
import { useCountdown } from "@/src/hooks/useCountdown";
import { LocalStorageKey, useLocalStorage } from "@/src/hooks/useLocalStorage";
import { Button, ButtonSize, ButtonTypes } from "@/components/button/Button";
import { CountdownClock } from "@/components/CountdownClock";
import { BUFFER_SECONDS } from "@/src/pages/_app";
import { MIN_MINUTES } from "@/components/modals/CreateGameModal";

const Game: NextPage = () => {
  const router = useRouter();
  const [timeData, _] = useLocalStorage(LocalStorageKey.Time, {
    seconds: MIN_MINUTES * 60,
  });

  const [playersData, setPlayersData] = useLocalStorage(
    LocalStorageKey.Players,
    {
      players: [],
    }
  );
  const { seconds } = timeData;
  const { players } = playersData;
  const nrOfPlayers = players.length;

  const [currentPlayerTurnIndex, setCurrentPlayerTurnIndex] = useState(0);
  const [isTimePaused, setIsTimePaused] = useState(false);

  const [currentPlayerTime, bufferSeconds] = useCountdown(
    currentPlayerTurnIndex,
    BUFFER_SECONDS,
    players[currentPlayerTurnIndex]?.seconds ?? 0,
    !isTimePaused
  );

  const isTimeUp = currentPlayerTime === 0;
  const remainingTimeInPercentages = clamp(currentPlayerTime / seconds, 0, 1);
  const remainingBufferTimeInPercentages = clamp(
    (bufferSeconds - 1) / BUFFER_SECONDS,
    0,
    1
  );

  const onQuitGameClick = useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  const onChangePlayerTurnClick = useCallback(
    (changeIndex: number, setTime: boolean) => {
      setTime &&
        setPlayersData((prev) => ({
          players: prev.players.map((player, index) => ({
            seconds:
              index === currentPlayerTurnIndex
                ? currentPlayerTime
                : player.seconds,
          })),
        }));
      setCurrentPlayerTurnIndex((prev) => {
        const next = (prev + changeIndex) % nrOfPlayers;
        if (next < 0) {
          return nrOfPlayers - 1;
        }
        return next;
      });
    },
    [
      nrOfPlayers,
      isTimeUp,
      currentPlayerTurnIndex,
      currentPlayerTime,
      setPlayersData,
    ]
  );

  const nextPlayerTurn = useCallback(
    () => !isTimeUp && onChangePlayerTurnClick(1, true),
    [onChangePlayerTurnClick, isTimeUp]
  );

  const previousPlayerTurn = useCallback(
    () => !isTimeUp && onChangePlayerTurnClick(-1, false),
    [onChangePlayerTurnClick, isTimeUp]
  );

  const onPauseTimeClick = useCallback(
    () => !isTimeUp && setIsTimePaused((prev) => !prev),
    [isTimeUp]
  );

  const onResetMyTimeClick = useCallback(() => {
    if (!isTimeUp) {
      return;
    }
    onChangePlayerTurnClick(1, false);
    setPlayersData((prev) => ({
      players: prev.players.map((player, index) => ({
        seconds: index === currentPlayerTurnIndex ? seconds : player.seconds,
      })),
    }));
  }, [
    isTimeUp,
    currentPlayerTurnIndex,
    currentPlayerTime,
    onChangePlayerTurnClick,
  ]);

  return (
    <div className={"flex flex-1 flex-col gap-4"}>
      <div className={"mr-auto"}>
        <Button
          type={ButtonTypes.Ghost}
          isSquare={true}
          size={ButtonSize.Small}
          onClick={onQuitGameClick}
          text={"Quit"}
        />
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
            {players.map((player, index) => (
              <Fragment key={`${index}-${player.seconds}`}>
                <p
                  className={`my-auto ${
                    index === currentPlayerTurnIndex && "text-2xl font-bold"
                  }`}
                >
                  {index + 1}
                </p>
                {index + 1 !== nrOfPlayers ? (
                  <p className={"my-auto"}>-</p>
                ) : null}
              </Fragment>
            ))}
          </div>
          <CountdownClock
            {...{
              countdownKey: currentPlayerTurnIndex,
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
        {isTimeUp ? (
          <Button
            type={ButtonTypes.Secondary}
            onClick={onResetMyTimeClick}
            text={"Reset my time"}
            className={"mx-auto"}
          />
        ) : null}
        <div className={"flex w-full flex-row justify-center gap-4"}>
          <Button
            disabled={isTimeUp}
            type={ButtonTypes.Ghost}
            onClick={onPauseTimeClick}
            text={isTimePaused ? "Start" : "Stop"}
          />
          <Button
            disabled={isTimeUp}
            onClick={previousPlayerTurn}
            text={"Previous"}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
