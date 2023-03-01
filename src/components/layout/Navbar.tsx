import React, { useCallback, useState } from "react";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import Logo from "@/assets/png/logo/ClockLogo.png";
// import { WebsocketClient } from "@/src/utils/Websocket";
import { Spinner } from "@/components/loading/Spinner";

export enum SessionStatus {
  Authenticated = "authenticated",
  Unauthenticated = "unauthenticated",
  Loading = "loading",
}

const LOGO_ASPECT_RATIO = 800 / 800;
const LOGO_WIDTH = 40;

export const Navbar: React.FC = () => {
  const session = useSession();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const loginUser = useCallback(async () => {
    try {
      await signIn();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await signOut();
      if (WebsocketClient.isLoggedIn()) {
        await WebsocketClient.players.leaveRoom({
          id: session.data?.user.id ?? "",
          name: session.data?.user?.name ?? "",
        });
        await WebsocketClient.logout();
      }
      setIsUserDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [session.data?.user.id, session.data?.user?.name]);

  return (
    <nav className="relative w-full">
      <div
        className={
          "container mx-auto flex flex-row items-center justify-between p-4"
        }
      >
        <a
          href={"/"}
          className="flex items-center gap-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          <Image
            src={Logo}
            height={LOGO_WIDTH * LOGO_ASPECT_RATIO}
            width={LOGO_WIDTH}
            alt="Board game clock Logo"
          />
        </a>
        <p className="text-2xl font-semibold">Board Game Clock</p>
        {session.status === SessionStatus.Unauthenticated ? (
          <button
            onClick={loginUser}
            className="ml-1 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 text-gray-400 hover:bg-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            <a className="text-sm font-medium text-blue-500 hover:underline">
              Login
            </a>
          </button>
        ) : null}
        {session.status === SessionStatus.Authenticated ? (
          <>
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen((prev) => !prev)}
              className="flex gap-4 rounded-full text-sm focus:ring-2 focus:ring-gray-300 md:mr-0"
            >
              <div className="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:mr-0">
                <span className="sr-only">user profile image</span>
                <Image
                  className="rounded-full"
                  width={LOGO_WIDTH}
                  height={LOGO_WIDTH * LOGO_ASPECT_RATIO}
                  src={`https://api.dicebear.com/5.x/identicon/svg?seed=${session.data.user?.email}&scale=75`}
                  alt="user photo"
                />
              </div>
            </button>
          </>
        ) : null}
        {session.status === SessionStatus.Loading ? <Spinner /> : null}
      </div>

      {session.status === "authenticated" ? (
        <div
          className={`absolute left-0 right-0 z-50 ${
            !isUserDropdownOpen && "hidden"
          } `}
        >
          <div
            className={`container mx-auto items-center justify-between px-4 sm:px-0`}
          >
            <div
              className={
                "mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:text-sm md:font-medium md:dark:bg-gray-900"
              }
            >
              <div
                className={
                  "flex w-full flex-row items-center justify-between md:order-1 md:w-auto"
                }
              >
                <div className={"flex flex-col"}>
                  <span className="block text-sm text-gray-900 dark:text-white">
                    @{session.data.user?.name}
                  </span>
                  <span className="block truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    {session.data.user?.email}
                  </span>
                </div>
                <button
                  onClick={logoutUser}
                  className="ml-1 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
                >
                  <a className="text-sm font-medium text-blue-500 hover:underline">
                    Logout
                  </a>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};
