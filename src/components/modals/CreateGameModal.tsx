import React, { FC, useCallback, useState } from "react";
import { Modal, ModalProps } from "@/components/modals/Modal";
import { Button, ButtonTypes } from "@/components/button/Button";
import { clamp } from "lodash";
import { LocalStorageKey, useLocalStorage } from "@/src/hooks/useLocalStorage";
import { MIN_NR_MINUTES } from "@/src/pages";
import { useRouter } from "next/router";
import { Route } from "@/src/pages/_app";
import { WebsocketClient } from "@/src/utils/Websocket";
import { useSession } from "next-auth/react";

export const MIN_NUMBER_OF_PLAYERS = 2;
export const MAX_NUMBER_OF_PLAYERS = 20;

export const MIN_MINUTES = 1;
export const MAX_MINUTES = 40;

export const MIN_BUFFER = 0;
export const MAX_BUFFER = 60 * 3;

export const MIN_ADD = 0;
export const MAX_ADD = 60 * 3;

type CreateGameModalProps = {
  isLocalGame?: boolean;
  closeModal: () => void;
} & Pick<ModalProps, "showModal">;

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  showModal = false,
  isLocalGame = false,
  closeModal,
}) => {
  const router = useRouter();
  const session = useSession();

  const title = isLocalGame ? "Local Game" : "Online Game";

  const [_, setTime] = useLocalStorage(LocalStorageKey.Time, {
    seconds: MIN_NR_MINUTES * 60,
  });

  const [__, setPlayers] = useLocalStorage(LocalStorageKey.Players, {
    players: [],
  });

  const [numberOfPlayers, setNumberOfPlayers] = useState(MIN_NUMBER_OF_PLAYERS);
  const [minutes, setMinutes] = useState(MIN_MINUTES);
  const [buffer, setBuffer] = useState(MIN_BUFFER);
  const [add, setAdd] = useState(MIN_ADD);

  const onCreateLocalGame = useCallback(async () => {
    setTime({ seconds: minutes * 60 });
    setPlayers((prev) => {
      const newPlayers = [];
      for (let i = 0; i < numberOfPlayers; i++) {
        newPlayers.push({
          seconds: minutes * 60,
        });
      }
      return { players: newPlayers };
    });
    await router.push(Route.LocalGame);
  }, [minutes, numberOfPlayers, router, setPlayers, setTime]);
  const onCreateOnlineGame = useCallback(async () => {
    const { id, name } = session.data?.user ?? {};
    closeModal();
    const doc = await WebsocketClient.rooms.createRoom(id, name, {
      minutes,
      buffer,
      increment: add,
    });
    if (!doc) {
      // TODO: handle error
      return;
    }
    await router.push(`/rooms/${doc.id}`);
  }, [add, buffer, closeModal, minutes, router, session.data?.user]);

  const onAcceptClick = useCallback(
    async () =>
      isLocalGame ? await onCreateLocalGame() : await onCreateOnlineGame(),
    [isLocalGame, onCreateLocalGame, onCreateOnlineGame]
  );

  return (
    <Modal
      showModal={showModal}
      title={title}
      acceptButtonText={"Create Game"}
      cancelButtonText={"Cancel"}
      onAcceptClick={onAcceptClick}
      onCrossClick={() => {
        console.log("kamsd;lfma;lsmf", {});
        closeModal();
      }}
      onCancelClick={closeModal}
    >
      <div className={"flex flex-col gap-4"}>
        {isLocalGame ? (
          <GameDataFields
            value={numberOfPlayers}
            text={"players"}
            onAddClick={() =>
              setNumberOfPlayers((prev) =>
                clamp(prev + 1, MIN_NUMBER_OF_PLAYERS, MAX_NUMBER_OF_PLAYERS)
              )
            }
            onRemoveClick={() =>
              setNumberOfPlayers((prev) =>
                clamp(prev - 1, MIN_NUMBER_OF_PLAYERS, MAX_NUMBER_OF_PLAYERS)
              )
            }
          />
        ) : null}
        <GameDataFields
          value={minutes}
          text={minutes === 1 ? "minute" : "minutes"}
          onAddClick={() =>
            setMinutes((prev) => clamp(prev + 1, MIN_MINUTES, MAX_MINUTES))
          }
          onRemoveClick={() =>
            setMinutes((prev) => clamp(prev - 1, MIN_MINUTES, MAX_MINUTES))
          }
        />
        <p className={"text-center"}>Each Turn</p>
        <GameDataFields
          value={buffer}
          text={"buffer"}
          onAddClick={() =>
            setBuffer((prev) => clamp(prev + 5, MIN_BUFFER, MAX_BUFFER))
          }
          onRemoveClick={() =>
            setBuffer((prev) => clamp(prev - 5, MIN_BUFFER, MAX_BUFFER))
          }
        />
        <GameDataFields
          value={add}
          text={"Add"}
          onAddClick={() => setAdd((prev) => clamp(prev + 5, MIN_ADD, MAX_ADD))}
          onRemoveClick={() =>
            setAdd((prev) => clamp(prev - 5, MIN_ADD, MAX_ADD))
          }
        />
      </div>
    </Modal>
  );
};

type GameDataFieldsProps = {
  value: number;
  text: string;
  onAddClick: () => void;
  onRemoveClick: () => void;
};

const GameDataFields: FC<GameDataFieldsProps> = ({
  text,
  value,
  onAddClick,
  onRemoveClick,
}) => {
  return (
    <div className={"row space-between flex"}>
      <Button
        text={"-"}
        isSquare={true}
        disabled={false}
        type={ButtonTypes.Gray}
        onClick={onRemoveClick}
        className={"max-w-[50px] justify-self-start"}
      />
      <div className={"mx-auto my-auto flex-1"}>
        <p className={"my-auto text-center"}>
          {value} <span className={"text-orange-500"}>{text}</span>
        </p>
      </div>
      <Button
        text={"+"}
        isSquare={true}
        disabled={false}
        onClick={onAddClick}
        type={ButtonTypes.Primary}
        className={"max-w-[50px] justify-self-end"}
      />
    </div>
  );
};
