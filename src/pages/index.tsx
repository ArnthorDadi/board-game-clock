import { useRouter } from "next/router";
import { FC, useCallback, useState } from "react";
import { clamp } from "lodash";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import Image from "next/image";

import { LocalStorageKey, useLocalStorage } from "@/src/hooks/useLocalStorage";
import { Button, ButtonTypes } from "@/src/components/button/Button";
import SunsetClock from "../assets/png/clocks/SunsetClock.png";
import { SessionStatus } from "@/components/layout/Navbar";
import { CreateGameModal } from "@/components/modals/CreateGameModal";

export const MIN_NR_PLAYERS = 2;
export const MAX_NR_PLAYERS = 10;

export const MIN_NR_MINUTES = 1;
export const MAX_NR_MINUTES = 30;

const Home: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  const [createGame, setCreateGame] = useState(false);

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
        <Button
          onClick={() => {
            setCreateGame(true);
          }}
          text={"Local game"}
        />
        {session.status === SessionStatus.Authenticated ? (
          <Button
            type={ButtonTypes.Secondary}
            onClick={() => router.push("/rooms")}
            text={"Online game"}
          />
        ) : null}
        <CreateGameModal
          showModal={createGame}
          closeModal={() => {
            setCreateGame(false);
          }}
          isLocalGame={true}
        />
      </div>
    </div>
  );
};

export default Home;
