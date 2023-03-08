import { Player } from "@/src/utils/Websocket";
import React from "react";

export type PlayerListProps = {
  players: Player[];
  className?: string;
};

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  className,
}) => {
  return null;
};

export type PlayerItemProps = { player: Player[] };

export const PlayerItem: React.FC<Player> = ({ player }) => {
  return null;
};
