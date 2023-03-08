import { FC } from "react";

export enum ButtonTypes {
  Primary = "Primary",
  Secondary = "Secondary",
  Ghost = "Ghost",
  Gray = "Gray",
}

export enum ButtonSize {
  Large = "Large",
  Default = "Default",
  Small = "Small",
}

export type ButtonProps = {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  className?: string;
  isSquare?: boolean;
  type?: ButtonTypes;
  size?: ButtonSize;
};

export const Button: FC<ButtonProps> = ({
  onClick,
  text,
  disabled = false,
  className = "",
  isSquare = false,
  type = ButtonTypes.Primary,
  size = ButtonSize.Default,
}) => {
  if (!text) {
    throw new Error("Missing text on button!");
  }

  let buttonTypeStyle = "";

  switch (type) {
    case ButtonTypes.Primary:
    default:
      buttonTypeStyle = "bg-[#5EAEFF] hover:bg-[#5098DF] text-white";
      break;
    case ButtonTypes.Secondary:
      buttonTypeStyle = "bg-[#281A6D] hover:bg-[#201456] text-white";
      break;
    case ButtonTypes.Ghost:
      buttonTypeStyle =
        "border-2 border-[#5EAEFF] text-[#5EAEFF] hover:bg-[#5EAEFF] hover:text-white";
      break;
    case ButtonTypes.Gray:
      buttonTypeStyle = "bg-gray-500 text-gray-300 hover:bg-gray-600";
      break;
  }

  let buttonSizeStyle = "";

  switch (size) {
    case ButtonSize.Large:
      buttonSizeStyle = (isSquare ? "w-full" : "w-full") + " text-sm";
      break;
    case ButtonSize.Default:
    default:
      buttonSizeStyle =
        (isSquare ? "py-2 px-3.5" : "px-5 py-2.5 w-full") +
        " max-w-xs text-base";
      break;
    case ButtonSize.Small:
      buttonSizeStyle = (isSquare ? "p-2" : "px-2.5 py-1 w-full") + " text-xs";
      break;
  }

  if (disabled) {
    buttonTypeStyle = "bg-gray-500 hover:bg-gray-600 text-gray-300";
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      type="button"
      className={`rounded-lg text-center font-bold focus:outline-none focus:ring-4 focus:ring-blue-300 ${buttonTypeStyle} ${buttonSizeStyle} ${className}`}
    >
      {text}
    </button>
  );
};
