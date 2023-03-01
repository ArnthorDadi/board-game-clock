import React, { useState } from "react";

export enum LocalStorageKey {
  Players = "Players",
  Time = "Time",
  OnlineTime = "OnlineTime",
}

export type Player = {
  seconds: number;
};

type LocalStorageDataType<T extends LocalStorageKey> =
  | { key: T } & (
      | {
          key: LocalStorageKey.Players;
          players: Player[];
        }
      | { key: LocalStorageKey.Time; seconds: number }
      | { key: LocalStorageKey.OnlineTime; seconds: number }
    );

type LocalStorageType<T extends LocalStorageKey> = Omit<
  LocalStorageDataType<T>,
  "key"
>;

export function useLocalStorage<T extends LocalStorageKey>(
  key: T,
  initialValue: LocalStorageType<T>
) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<LocalStorageType<T>>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key) as string;
      // Parse stored json or if none return initialValue
      if (item) {
        return JSON.parse(item) as LocalStorageType<T>;
      }
      return initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (
    value:
      | LocalStorageType<T>
      | ((val: LocalStorageType<T>) => LocalStorageType<T>)
  ) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}
