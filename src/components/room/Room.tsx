import React from "react";
import firebase from "firebase/compat";
import {
  Collection,
  CollectionType,
  WebsocketClient,
} from "@/src/utils/Websocket";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export type RoomProps = {
  id: string;
} & CollectionType<Collection.Rooms>;

export const Room: React.FC<RoomProps> = ({
  id,
  createdAt,
  admin,
  players,
  name,
}) => {
  const session = useSession();
  const router = useRouter();
  const createdDate = new Date((createdAt?.seconds ?? 0) * 1000);
  const day = createdDate.getUTCDate();
  const year = createdDate.getUTCFullYear();
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const player = {
    id: session.data?.user.id ?? "",
    name: session.data?.user.name ?? "",
  };
  return (
    <button
      type={"button"}
      onClick={async () => {
        await WebsocketClient.rooms.joinRoom(id, player);
        await router.push(`rooms/${id}`);
      }}
    >
      <div
        className={
          "relative flex min-h-[200px] w-full items-end rounded-xl border-2 border-[rgba(255,255,255,0.5)] px-6 py-4"
        }
      >
        <div
          className={
            "absolute inset-0 rounded-xl bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0eCquNpev5EKoZcaNJpIlsOUYdTF2YrhV6h-wrZF9sYuf1YBPV1AEXP2kYYoMFe6keTc&usqp=CAU')] bg-cover bg-center bg-no-repeat"
          }
        />
        <div className={"z-[1]"}>
          <p className={"text-left font-serif text-4xl"}>{name}</p>
          <p
            className={
              "text-left text-2xl font-bold text-orange-400 subpixel-antialiased"
            }
          >
            {admin.name}
          </p>
          <p className={"text-left text-xs italic text-gray-400"}>
            {createdDate.toLocaleTimeString()} - {formatter.format(createdDate)}{" "}
            {day}
            {day === 1
              ? "st"
              : day === 2
              ? "nd"
              : day === 3
              ? "td"
              : "th"}, {year}
          </p>
        </div>
        <div
          className={
            "absolute top-0 left-0 bottom-0 right-0 rounded-b-lg bg-gradient-to-t from-black"
          }
        />
        <div
          className={
            "absolute top-5 -left-[0.18rem] flex flex-row items-center rounded-l-lg rounded-r-full bg-orange-400 py-[0.05rem]"
          }
        >
          <div className={"ml-2 mr-1"}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1005_395)">
                <path
                  d="M3.05263 12.5263C5.1228 11.6842 7.10527 11.2631 9.00001 11.2631C10.8947 11.2631 12.8596 11.6842 14.8948 12.5263C16.9649 13.3334 18 14.4035 18 15.7368V18H0V15.7368C0 14.4035 1.01754 13.3334 3.05263 12.5263ZM12.1579 7.68422C11.2807 8.56141 10.2281 9.00001 9.00001 9.00001C7.77194 9.00001 6.7193 8.56141 5.84211 7.68422C4.96491 6.80703 4.52632 5.75439 4.52632 4.52632C4.52632 3.29825 4.96491 2.24562 5.84211 1.36842C6.7193 0.456142 7.77194 0 9.00001 0C10.2281 0 11.2807 0.456142 12.1579 1.36842C13.0351 2.24562 13.4737 3.29825 13.4737 4.52632C13.4737 5.75439 13.0351 6.80703 12.1579 7.68422Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_1005_395">
                  <rect width="18" height="18" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <p className={"ml-2 mr-4 text-lg"}>{players.length}</p>
        </div>
      </div>
    </button>
  );
};
