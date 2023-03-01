import { HARRY_POTTER_DATA } from "./Data";

export function getRandomHarryPotterName(): string {
  const length = HARRY_POTTER_DATA.length;

  const randomFirstIndex = Math.floor(Math.random() * length);
  const firstName = (
    HARRY_POTTER_DATA[randomFirstIndex] as typeof HARRY_POTTER_DATA[0]
  ).first;

  const randomLastIndex = Math.floor(Math.random() * length);
  const lastName = (
    HARRY_POTTER_DATA[randomLastIndex] as typeof HARRY_POTTER_DATA[0]
  ).last;

  return `${firstName} ${lastName}`;
}
