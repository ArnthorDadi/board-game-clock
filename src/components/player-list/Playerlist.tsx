import { Player, WebsocketClient } from "@/src/utils/Websocket";
import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export type PlayerListProps = {
  players?: Player[];
  className?: string;
  admin?: Player;
};

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  className,
  admin,
}) => {
  const session = useSession();
  const userId = session.data?.user?.id;

  return (
    <div className={`relative flex flex-1 flex-col overflow-auto ${className}`}>
      <div className={"absolute inset-0 pr-4"}>
        <ul className={"flex flex-col gap-3"}>
          {players?.map((player, index) => (
            <PlayerItem
              key={player.id}
              player={{
                ...player,
                role:
                  player.id === admin?.id ? PlayerRole.Admin : PlayerRole.User,
              }}
              showPlayerOptions={userId === admin?.id}
              isUserCurrentPlayer={player.id === userId}
              playerNr={index + 1}
              isFirst={index === 0}
              isLast={players.length - 1 === index}
            />
          ))}
          {players?.length === 1 ? (
            <p className={"text-xs"}>Waiting for other players to join...</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

export enum PlayerRole {
  Admin = "admin",
  User = "user",
}

export type PlayerItemProps = {
  isUserCurrentPlayer: boolean;
  playerNr: number;
  player: Player & { role: PlayerRole };
  showPlayerOptions: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export const PlayerItem: React.FC<PlayerItemProps> = ({
  isUserCurrentPlayer = false,
  playerNr,
  player,
  showPlayerOptions = false,
  isFirst = false,
  isLast = false,
}) => {
  const isUserCurrentPlayerTextStyle = "font-bold text-orange-500";
  return (
    <li className={"flex flex-row items-center justify-between"}>
      <p
        className={`my-auto text-base ${
          isUserCurrentPlayer ? isUserCurrentPlayerTextStyle : ""
        }`}
      >
        {playerNr}. {player.name}
      </p>
      {showPlayerOptions ? (
        <PlayerItemAdminOptions
          playerId={player.id}
          playerRole={player.role}
          {...{ isFirst, isLast }}
        />
      ) : null}
    </li>
  );
};

type PlayerItemAdminOptionsProps = {
  playerId: string;
  playerRole: PlayerRole;
  isFirst: boolean;
  isLast: boolean;
};

export const PlayerItemAdminOptions: React.FC<PlayerItemAdminOptionsProps> = ({
  playerId,
  playerRole,
  isFirst,
  isLast,
}) => {
  const router = useRouter();
  const roomId = (router.query.id ?? "w") as string;

  const kickPlayer = useCallback(async () => {
    await WebsocketClient.rooms.kickPlayer(roomId, playerId);
  }, [playerId, roomId]);

  const movePlayerDown = useCallback(async () => {
    await WebsocketClient.rooms.movePlayer(roomId, playerId, 1);
  }, [playerId, roomId]);
  const movePlayerUp = useCallback(async () => {
    await WebsocketClient.rooms.movePlayer(roomId, playerId, -1);
  }, [playerId, roomId]);

  return (
    <div className={"flex flex-1 flex-row justify-end gap-3 pl-4"}>
      {playerRole === PlayerRole.User ? (
        <button onClick={kickPlayer} className={"h-full rounded text-white"}>
          <svg
            width="30"
            height="31"
            viewBox="0 0 30 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect y="0.5" width="30" height="30" fill="url(#pattern0)" />
            <defs>
              <pattern
                id="pattern0"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
              >
                <use xlinkHref="#image0_158_792" transform="scale(0.0104167)" />
              </pattern>
              <image
                id="image0_158_792"
                width="96"
                height="96"
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAGrUlEQVR4nO2caYwURRTHC1DEA2Ze9ez2q9mVFYWYrFciiFHQqHhFoyQa4xElMRHkgwnRoFE/qInG+0KMJiLxDB8wnnxQgqgxGg3x5IjxwnghERQEFMSFv6ma2WTZ3enqme6e7pmuX9Lfpmve0fWq3qvXLYTD4XA4HA6Hw+FwJAw66RgwLYCSa6FoR+WSa8H0KHw62jkgKcNPFAdAySeg5B4oiRpXHxQ9jl4xOvS4RAUIMco5zmp8eifA8Nj3opVhnQBFL4Hlv2D6CkyvQ8kHwXQtfO8MKBoPIUbk3jlQ8snwxpeVi2lhKAew/MIy1lm5doCJ+cFhBzXDkU9HBY4txIjqGlJ7HL9wmMgz1QW3XuOjGooeDhy7W3YFzyK5K/frAxSta9wBck2gA3zvNIsD14m8A0XbI8yAbZaxZ1vWkddE3tFGjOCAv4LHlvdbxnhA5J1EQxDTqxYHzhF5x2S4jTvgocCxTTYdtAPyThd5R5cXKhlu3cbvA8vemuMKMRJMOwPHKNOhzdU2o5jyQr0OYFoQOCYXeyz3/+2y4H5j9YrRYHq7DuOvgBD7Bzqg7M2wjLM6zoeoXZyw0BKO+kziZjM+y14oudSyAL/cPO1aCF1e0Bmu3uHA5AgmT1ijF9zAmN9TKIJpLhR9HG4WyXubq1kbAr3QKnk2WC6xLrhDFmB5ddrytxQQYhT8wgSU5ZmmnMz0CFj+1PAWtrNweNo6ZRJ0d0xE2bsQLK+v7o7eBNM3UHJ3hHxhcPh5P3E9fL9TtArVPft8KPldbEZWNRffHegqHpuYLnqGKnoXTL/qgyaRdTC+QFDyveQNL7XxN0LRtNh10OcO5eIFQzYATHNFltHTNMSJFWK49My6FR0dh8Q+c8t0KVh+WeN/10OI/UQWQUcHV7eXSRl9KxQ9b0JCzOe+Og8By1nmnNm+3swSWcOUCZi+TcDofSZL1sZR6qBkkkVj+PCyaycJMVJkBZS9I8H0c6yGZ7MdnZfUzkOHrsomgX5rUL5LRBbQu4/KQhj7k/99EoU1s0FgeRtYbo74gHwet2z1K8PeCWD5R3Ixv3hKzJuDe/SJW0S59upjT617XLI1ppCi6TEog+CLVkaWs7PT1zUiU6qOJo9us1kGVZocjwWjKFWmk2JQCCGn+kUNydgx7giwXGQ66KL9v+7AW4yu0iSRBSpTmX4JL7xcFNEJW+tp4DWVV5YvNngiN0B2+qdSSqfxIkuA5e0hFdgJpvPQ0zMmeqiiDeDiqYFyqdJkML3SYEfewP/aBpb36dAlsoj1ULyixPaBh+NQ9EwM4eg/EwrYm9Kfieq8ACwvBsu3Io9vNhN0B7rHSZFlwHKLRZEteo3Y5x5fTo3BARjwH7vi232ZWtJN8LyxohUAy02W0HN3jfs+jNUJKrITf4SS16G7+0DRSlgbo3QGO8zLE7plPHWjK3OtNxl2T88Y0YqAvavsSnozh7+Xlqdo+NVQdHnLd05XXzv63RKGlg97b1dpktneNdXwtEo/EG3VL1RJ6QMV36sLdMPeq2hOUwzP8gNzoNJOhu/HvIdlTXRqv2gBRc8la3hvhmh3wPINiyH+rFW/h+8fHPOp2R7dlJWJOk2zgKJzQsTfaywlja+jG14uDWrualuqXQ/Bp0gsP7O2q6gGzhIqNaanct8HBKYbrMYalBUPBl3F4yrhKrTxN6NLdg8ZKI+Y3k3bK6NKvmAdx5cn1vFa016USqo5GrYAYHraGi5CnOuC6dzwJWS6ojnatQBQpeMti+QyHevDjUU3hwtDtDh5zVoIKPpo0FO/ydTU/cKEurvR2LK9rVw/JKdNCwIuXlkNDZ9UMt3G+3dgkjzruuI6oYfUh9ibEoczw4cimm1+7EjsUzcbLYv7Emf7BIGiOy0zYGNbFtoy1e6oLGHIfe4s9U8ezEtYhHwDpscs+YD7MkqiDlDeTMsM2NryR4xZBvrriLbyhC+npi1nWwNzphs4C25JW8a2BrbzZ6YVacvY1sDWT6S7LLL60lw7gEr/567gdaC+op+jTsD0aaADynRyvWM66vmehK29PeR5g6PhlwBl0C5od8v2ebYCMN8LCizKrUpbxrYGip6N8p05R1QHsKV5q0yXOSMnBMpjPdOGEjgDij3OAUk5wKfzbYcyzvgJAkV3WRzgvpKYsANWWk7EbkxUgDyDMAmYoulpy9m2QDft2hKwBL4f5KjiErCUge01JpeAJewAdglYasAlYJlPwDakLGJ7A5eAZTwBY5qfsogi7wnYtLTldDgcDofD4XA4HA5RB/8DYQuDIFZUeB4AAAAASUVORK5CYII="
              />
            </defs>
          </svg>
        </button>
      ) : null}
      <button
        disabled={isFirst}
        onClick={movePlayerUp}
        className={`h-8 w-8 origin-center rotate-90 rounded-lg border-2 border-[#5EAEFF] pb-[0.3rem] font-bold text-[#5EAEFF] text-white ${
          isFirst ? "border-0 bg-gray-500 text-gray-300 hover:bg-gray-600" : ""
        }`}
      >
        {"<"}
      </button>
      <button
        disabled={isLast}
        onClick={movePlayerDown}
        className={`h-8 w-8 origin-center rotate-90 rounded-lg border-2 border-[#5EAEFF] pb-[0.1rem] font-bold text-[#5EAEFF] text-white ${
          isLast ? "border-0 bg-gray-500 text-gray-300 hover:bg-gray-600" : ""
        }`}
      >
        {">"}
      </button>
    </div>
  );
};
