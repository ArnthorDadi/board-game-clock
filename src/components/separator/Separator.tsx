import React from "react";

export const Separator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`h-[1px] w-full bg-gray-400 ${className}`} />;
};
