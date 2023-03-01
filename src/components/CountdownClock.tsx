import { FC, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Logo from "@/assets/png/logo/ClockLogo.png";
import { getTimeFromSeconds } from "@/src/utils/Utilities";

function getProcessTextColor(remainingTimeInPercentages: number) {
  if (remainingTimeInPercentages > 0.667) {
    return "text-green-400";
  }
  if (remainingTimeInPercentages > 0.334) {
    return "text-orange-400";
  }
  return "text-red-400";
}

export type CountdownClockProps = {
  countdownKey: number | string;
  currentPlayerTime: number;
  remainingTimeInPercentages: number;
  bufferSeconds: number;
  remainingBufferSecondsInPercentages: number;
  isTimeUp: boolean;
};

export const CountdownClock: FC<CountdownClockProps> = ({
  countdownKey,
  currentPlayerTime,
  bufferSeconds,
  remainingBufferSecondsInPercentages,
  remainingTimeInPercentages,
  isTimeUp,
}) => {
  const targetRef = useRef<HTMLDivElement>();
  const [dimensions, setDimensions] = useState({ width: 350, height: 350 });
  useLayoutEffect(() => {
    if (targetRef.current) {
      setDimensions({
        width: Math.max(targetRef.current.offsetWidth, 350),
        height: targetRef.current.offsetHeight,
      });
    }
  }, [targetRef?.current?.offsetWidth]);

  const viewBoxWidth = dimensions.width;
  const circleRadius = viewBoxWidth / 4 - 2;
  const circleCenterX = viewBoxWidth / 2;
  const circleCenterY = viewBoxWidth / 2;
  const circleStrokeDashOffset =
    circleRadius * 2 * Math.PI * remainingTimeInPercentages;
  const circleStrokeDasharray = circleRadius * 2 * Math.PI;
  const circleStrokeWidth = viewBoxWidth / 2;

  const bufferSecondsViewBoxWidth = dimensions.width;
  const bufferSecondsCircleRadius = dimensions.width / 2;
  const bufferSecondsCircleCenterX = bufferSecondsViewBoxWidth / 2;
  const bufferSecondsCircleCenterY = bufferSecondsViewBoxWidth / 2;
  const bufferSecondsCircleStrokeDashOffset =
    bufferSecondsCircleRadius *
    2 *
    Math.PI *
    (1 - remainingBufferSecondsInPercentages);
  const bufferSecondsCircleStrokeDasharray =
    bufferSecondsCircleRadius * 2 * Math.PI;

  return (
    <div
      key={countdownKey}
      ref={targetRef as any}
      className={"relative rounded-full bg-black sm:mx-auto"}
      onLoad={(e) => {}}
    >
      <Image
        src={Logo}
        alt={"clock"}
        className={"overflow-hidden rounded-full"}
      />
      <div
        className={
          "absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.3)]"
        }
      >
        {bufferSeconds === 0 ? (
          <p
            className={`absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform text-4xl font-bold ${getProcessTextColor(
              remainingTimeInPercentages
            )}`}
          >
            {!isTimeUp ? getTimeFromSeconds(currentPlayerTime) : "Time's up!"}
          </p>
        ) : null}
        {bufferSeconds > 0 ? (
          <p
            className={`absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform text-4xl font-bold`}
          >
            {getTimeFromSeconds(bufferSeconds)}
          </p>
        ) : null}
      </div>
      <div
        className={
          "absolute -top-1 -bottom-1 -left-1 -right-1 flex -rotate-90 items-center justify-center overflow-hidden rounded-full"
        }
      >
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxWidth}`}>
          <circle
            className={"countdownClockTransition"}
            stroke={"rgba(0,0,0,0.8)"}
            fillOpacity={0}
            strokeWidth={circleStrokeWidth}
            strokeDashoffset={circleStrokeDashOffset}
            strokeDasharray={circleStrokeDasharray}
            r={circleRadius}
            cx={circleCenterX}
            cy={circleCenterY}
          />
        </svg>
      </div>
      <div
        className={
          "absolute -top-1 -bottom-1 -left-1 -right-1 z-10 flex -rotate-90 items-center justify-center overflow-hidden rounded-full"
        }
      >
        <svg
          viewBox={`0 0 ${bufferSecondsViewBoxWidth} ${bufferSecondsViewBoxWidth}`}
        >
          <circle
            className={"bufferCountdownClockTransition"}
            stroke={"white"}
            fillOpacity={0}
            strokeWidth={15}
            strokeDashoffset={bufferSecondsCircleStrokeDashOffset}
            strokeDasharray={bufferSecondsCircleStrokeDasharray}
            r={bufferSecondsCircleRadius}
            cx={bufferSecondsCircleCenterX}
            cy={bufferSecondsCircleCenterY}
          />
        </svg>
      </div>
    </div>
  );
};
