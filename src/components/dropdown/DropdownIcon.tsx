import React, { useState } from "react";
import Cogwheel from "@/assets/svg/Cogwheel.svg";
import Image from "next/image";

export enum DropdownIcons {
  Cogwheel = "Cogwheel",
}

export type DropdownGroupItem = {
  text: string;
  onClick: () => void;
};

export type DropdownGroupItems = {
  items: DropdownGroupItem[];
};

export type DropdownIconProps = {
  icon: DropdownIcons;
  itemGroups: DropdownGroupItems[];
  bottomItem?: DropdownGroupItem;
  className: string;
};

export const DropdownIcon: React.FC<DropdownIconProps> = ({
  icon,
  className,
  itemGroups,
  bottomItem,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        id="dropdownUserAvatarButton"
        data-dropdown-toggle="dropdownAvatar"
        className="flex rounded-full text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:mr-0"
        type="button"
      >
        <span className="sr-only">Open user menu</span>
        <Image
          className="h-8 w-8 rounded-full"
          src={Cogwheel}
          // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfSwCVoANh2Z5N4mjOT6HRtGM5UiFt4Yd_0LMyRUNZK7_CzZ5XtyV8-WzCVKdHakS3IgQ&usqp=CAU"
          alt="user photo"
        />
      </button>

      {/* <!-- Dropdown menu --> */}
      <div
        id="dropdownAvatar"
        className={`z-10${
          isDropdownOpen ? "" : " hidden"
        } absolute top-[40px] right-0 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:divide-gray-600 dark:bg-gray-700`}
      >
        {itemGroups.map((itemGroup, index) => (
          <ul
            key={index}
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownUserAvatarButton"
          >
            {itemGroup.items.map((item) => (
              <li key={item.text}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        ))}
        {bottomItem ? (
          <div className="py-2">
            <button
              type="button"
              onClick={bottomItem.onClick}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {bottomItem.text}
            </button>
          </div>
        ) : undefined}
      </div>
    </div>
  );
};
