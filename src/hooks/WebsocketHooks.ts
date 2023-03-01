import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { Collection, CollectionType, db } from "@/src/utils/Websocket";

export function useListenToRoom(roomId: string) {
  const [roomData, loading, error] = useDocument(
    doc(db, Collection.Rooms, roomId)
  );
  const data = roomData?.exists()
    ? (roomData?.data() as CollectionType<Collection.Rooms>)
    : undefined;
  return {
    data,
    loading,
    error,
  };
}
