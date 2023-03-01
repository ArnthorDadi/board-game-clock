import { useRouter } from "next/router";
import { FC, useCallback, useState } from "react";
import { clamp } from "lodash";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import Image from "next/image";

import { LocalStorageKey, useLocalStorage } from "@/src/hooks/useLocalStorage";
import { Button } from "@/src/components/button/Button";
import SunsetClock from "../assets/png/clocks/SunsetClock.png";

export const MIN_NR_PLAYERS = 2;
export const MAX_NR_PLAYERS = 10;

export const MIN_NR_MINUTES = 1;
export const MAX_NR_MINUTES = 30;

const Home: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  const [openCreateLocalGame, setOpenCreateLocalGame] = useState(false);

  return (
    <div className={"flex min-h-full min-w-full flex-col gap-4"}>
      <div className={"mx-auto flex flex-1 items-center"}>
        <Image
          src={SunsetClock}
          alt={"Sunset clock"}
          className={"max-h-[500px] w-auto rounded-full"}
        />
      </div>
      <div className={"mx-auto flex items-center"}>
        <p className={"text-center text-base"}>
          Bringing people together for unforgettable{" "}
          <span className={"text-orange-400"}>game nights</span>, where every
          player gets their fair share of the spotlight
        </p>
      </div>
      <div className={`flex flex-row justify-center gap-4`}>
        {!openCreateLocalGame ? (
          <>
            <Button
              onClick={() => {
                setOpenCreateLocalGame(true);
              }}
              text={"Create Local game"}
            />
            {session.status === "authenticated" ? (
              <Button
                onClick={() => router.push("/rooms")}
                text={"Join online game"}
              />
            ) : null}
          </>
        ) : null}
        {openCreateLocalGame ? (
          <CreateLocalGame onCancel={() => setOpenCreateLocalGame(false)} />
        ) : null}
      </div>
    </div>
  );
};

const CreateLocalGame: FC<{ className?: string; onCancel: () => void }> = ({
  className,
  onCancel,
}) => {
  const router = useRouter();

  const [nrOfPlayers, setNrOfPlayers] = useState(MIN_NR_PLAYERS);
  const [nrOfMinutes, setNrOfMinutes] = useState(MIN_NR_MINUTES);

  const [_, setTime] = useLocalStorage(LocalStorageKey.Time, {
    seconds: MIN_NR_MINUTES * 60,
  });

  const [__, setPlayers] = useLocalStorage(LocalStorageKey.Players, {
    players: [],
  });

  const onCreateGameClick = useCallback(() => {
    setTime({ seconds: nrOfMinutes * 60 });
    setPlayers((prev) => {
      const newPlayers = [];
      for (let i = 0; i < nrOfPlayers; i++) {
        newPlayers.push({
          seconds: nrOfMinutes * 60,
        });
      }
      return { players: newPlayers };
    });
    router.push("/game");
  }, [setTime, nrOfMinutes, setPlayers, router, nrOfPlayers]);

  return (
    <div
      className={`${
        className ? className : ""
      } flex w-full max-w-md flex-1 flex-col gap-4`}
    >
      <p className={"text-center text-xl sm:text-left"}>Create local game</p>
      <div className={"flex w-full flex-row justify-between"}>
        <button
          onClick={() =>
            setNrOfPlayers((prevNrOfPlayers) =>
              clamp(prevNrOfPlayers - 1, MIN_NR_PLAYERS, MAX_NR_PLAYERS)
            )
          }
          className={"rounded bg-[#5F545D] py-2 px-4 text-white"}
        >
          -
        </button>
        <p className={"my-auto text-lg"}>
          {nrOfPlayers} <span className={"text-orange-400"}>players</span>
        </p>
        <button
          onClick={() =>
            setNrOfPlayers((prevNrOfPlayers) =>
              clamp(prevNrOfPlayers + 1, MIN_NR_PLAYERS, MAX_NR_PLAYERS)
            )
          }
          className={"rounded bg-[#7451FF] py-2 px-4 text-white"}
        >
          +
        </button>
      </div>
      <div className={"row flex w-full justify-between"}>
        <button
          onClick={() =>
            setNrOfMinutes((prevNrOfMinutes) =>
              clamp(prevNrOfMinutes - 1, MIN_NR_MINUTES, MAX_NR_MINUTES)
            )
          }
          className={"rounded bg-[#5F545D] py-2 px-4 text-white"}
        >
          -
        </button>
        <p className={"my-auto text-lg"}>
          {nrOfMinutes} <span className={"text-orange-400 "}>minutes</span>
        </p>
        <button
          onClick={() =>
            setNrOfMinutes((prevNrOfMinutes) =>
              clamp(prevNrOfMinutes + 1, MIN_NR_MINUTES, MAX_NR_MINUTES)
            )
          }
          className={"rounded bg-[#7451FF] py-2 px-4 text-white"}
        >
          +
        </button>
      </div>
      <div className={"flex flex-row gap-4"}>
        <Button onClick={onCancel} text={"Cancel"} />
        <Button onClick={onCreateGameClick} text={"Create game!"} />
      </div>
    </div>
  );
};

export default Home;
