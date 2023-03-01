export function getTimeFromSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes > 0
    ? minutes + ":" + (seconds % 60).toString().padStart(2, "0")
    : seconds.toString();
}
