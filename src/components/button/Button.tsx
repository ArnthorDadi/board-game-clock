import { FC } from "react";

export type ButtonProps = {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  className?: string;
};

export const Button: FC<ButtonProps> = ({
  onClick,
  text,
  disabled = false,
  className = "",
}) => {
  if (!text) {
    throw new Error("Missing text on button!");
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full max-w-xs rounded-lg bg-gradient-to-br from-[#46100F] to-[#074A64] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
    >
      {text}
    </button>
  );
};
