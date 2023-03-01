import { useEffect, useState } from "react";

export const useCountdown = (
  key: number | string,
  turnBufferSeconds: number,
  time: number,
  shouldCountdown: boolean
): [number, number] => {
  const [turnBufferTimerSeconds, setTurnBufferTimerSeconds] =
    useState(turnBufferSeconds);
  const [countdown, setCountdown] = useState(time);
  useEffect(() => {
    setTurnBufferTimerSeconds(turnBufferSeconds);
    setCountdown(time);
  }, [time, key]);
  useEffect(() => {
    if (countdown === 0 || turnBufferTimerSeconds !== 0 || !shouldCountdown) {
      return;
    }
    const countdownInterval = setInterval(
      () => setCountdown((prev) => (prev <= 0 ? 0 : prev - 1)),
      1000
    );

    return () => clearInterval(countdownInterval);
  }, [countdown, shouldCountdown, turnBufferTimerSeconds]);
  useEffect(() => {
    if (turnBufferTimerSeconds === 0 || !shouldCountdown) {
      return;
    }
    const standardTurnBufferInterval = setInterval(
      () => setTurnBufferTimerSeconds((prev) => (prev <= 0 ? 0 : prev - 1)),
      1000
    );
    return () => clearInterval(standardTurnBufferInterval);
  });

  return [countdown, turnBufferTimerSeconds];
};
