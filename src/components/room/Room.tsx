import React, { FC } from "react";
import firebase from "firebase/compat";
import {
  Collection,
  CollectionType,
  WebsocketClient,
} from "@/src/utils/Websocket";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { getTimeFromSeconds } from "@/src/utils/Utilities";

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGxpYnJhcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGxpYnJhcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1419640303358-44f0d27f48e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGxpYnJhcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
  "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__340.jpg",
  "https://cdn.pixabay.com/photo/2018/02/13/23/41/nature-3151869__340.jpg",
];
const IMAGE_URLS_LENGTH = IMAGE_URLS.length;

function getImageUrl(index: number): string {
  return IMAGE_URLS[index % IMAGE_URLS_LENGTH] as string;
}

function formatDate(createdAt: CollectionType<Collection.Rooms>["createdAt"]) {
  const createdDate = new Date((createdAt?.seconds ?? 0) * 1000);
  const day = createdDate.getUTCDate();
  const year = createdDate.getUTCFullYear();
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  let dayCounter = "th";
  switch (true) {
    case day === 1:
      dayCounter = "st";
      break;
    case day === 2:
      dayCounter = "nd";
      break;
    case day === 3:
      dayCounter = "td";
      break;
  }

  return `${createdDate.toLocaleTimeString()} - ${formatter.format(
    createdDate
  )} ${day} ${dayCounter}, ${year}`;
}

export type RoomProps = {
  id: string;
  index: number;
} & CollectionType<Collection.Rooms>;

export const Room: React.FC<RoomProps> = ({
  index,
  id,
  createdAt,
  admin,
  players,
  name,
  seconds,
  buffer,
  increment,
}) => {
  const session = useSession();
  const router = useRouter();

  const player = {
    id: session.data?.user.id ?? "",
    name: session.data?.user.name ?? "",
  };

  return (
    <button
      className={
        "relative flex w-full overflow-hidden rounded-lg border-2 border-[rgba(255,255,255,0.50)] pl-4 pr-14 pb-2 pt-12"
      }
      type={"button"}
      onClick={async () => {
        await WebsocketClient.rooms.joinRoom(id, player);
        await router.push(`rooms/${id}`);
      }}
    >
      <div
        className={
          "z-10 flex min-h-[80px] flex-col place-content-end"
        }
      >
        <p className={"text-left font-serif text-2xl"}>{name}</p>
        <p
          className={
            "text-left text-xl font-bold text-orange-400 subpixel-antialiased"
          }
        >
          {admin.name}
        </p>
        <p className={"text-left text-xs italic text-gray-400"}>
          {formatDate(createdAt)}
        </p>
      </div>
      <>
        <div className={"absolute inset-0"}>
          <img
            src={getImageUrl(index)}
            alt={"Room background image"}
            className={"h-auto w-full"}
          />
        </div>
      </>
      <>
        <div
          className={
            "absolute top-0 left-0 bottom-0 right-0 rounded-b-lg bg-gradient-to-t from-black"
          }
        />
      </>
      <RoomNumbers
        nrOfPlayers={players.length}
        {...{
          time: seconds,
          buffer,
          add: increment,
        }}
      />
    </button>
  );
};

type RoomNumbersProps = {
  nrOfPlayers: number;
  time: number;
  buffer: number;
  add: number;
};

export const RoomNumbers: React.FC<RoomNumbersProps> = ({
  nrOfPlayers,
  time,
  buffer,
  add,
}) => {
  return (
    <>
      {/* Number of people in game */}
      <div className={"absolute top-3 left-0"}>
        <div
          className={
            "flex min-w-[30px] flex-row items-center gap-1.5 rounded-l-lg rounded-r-full border border-l-0 bg-orange-400 py-[0.05rem] pl-1"
          }
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.18945 7.79614C3.3418 7.32739 4.44531 7.09302 5.5 7.09302C6.55469 7.09302 7.64844 7.32739 8.78125 7.79614C9.93359 8.24536 10.5098 8.84106 10.5098 9.58325V10.843H0.490234V9.58325C0.490234 8.84106 1.05664 8.24536 2.18945 7.79614ZM7.25781 5.10083C6.76953 5.58911 6.18359 5.83325 5.5 5.83325C4.81641 5.83325 4.23047 5.58911 3.74219 5.10083C3.25391 4.61255 3.00977 4.02661 3.00977 3.34302C3.00977 2.65942 3.25391 2.07349 3.74219 1.58521C4.23047 1.07739 4.81641 0.823486 5.5 0.823486C6.18359 0.823486 6.76953 1.07739 7.25781 1.58521C7.74609 2.07349 7.99023 2.65942 7.99023 3.34302C7.99023 4.02661 7.74609 4.61255 7.25781 5.10083Z"
              fill="white"
            />
          </svg>
          <p className={"pr-2 text-left text-sm font-bold"}>{nrOfPlayers}</p>
        </div>
      </div>
      {/* Game time, buffer, add */}
      <div
        className={
          "absolute top-1.5 right-0 flex flex-col justify-end gap-[3px]"
        }
      >
        {/* Time */}
        <RoomData value={getTimeFromSeconds(time)} text={"Time"} />
        {/* Buffer */}
        <RoomData value={getTimeFromSeconds(buffer)} text={"Buffer"} />
        {/* Add */}
        <RoomData value={getTimeFromSeconds(add)} text={"Add"} />
      </div>
    </>
  );
};

const RoomData: FC<{ text: string; value: string }> = ({ text, value }) => {
  return (
    <div className={"flex flex-col"}>
      <p className={"pr-[0.2rem] text-right text-[0.6rem] text-gray-500"}>
        {text}
      </p>
      <div className={"place-self-end"}>
        <p
          className={
            "rounded-l-lg rounded-l-full border border-r-0 bg-orange-400 py-[0.05rem] pr-[0.2rem] pl-[0.4rem] text-right text-xs"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
};
