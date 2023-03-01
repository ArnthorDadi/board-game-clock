import { type AppType } from "next/app";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "@/src/utils/api";

import "@/src/styles/globals.css";
import Head from "next/head";
import Layout from "../components/layout/Layout";
import { useEffect } from "react";
import { useRouter } from "next/router";
// import {WebsocketClient} from "@/src/utils/Websocket";

const WebsocketNeededUrls = ["/rooms"];

export const BUFFER_SECONDS = 20

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  // const webSocketIsLoggedIn = WebsocketClient.isLoggedIn();

  /* Check to see if user should be websocket logged in */
  // useEffect(() => {
  //   const websocketSignOut = async () => {
  //     await WebsocketClient.logout();
  //   };
  //   console.log("", {
  //     isUser: !session?.user,
  //     webSocketIsLoggedIn,
  //     pathname: router.pathname,
  //     isIllegalPath: WebsocketNeededUrls.includes(router.pathname),
  //     WebsocketNeededUrls,
  //   });
  //   if (
  //     !session?.user &&
  //     webSocketIsLoggedIn &&
  //     WebsocketNeededUrls.includes(router.pathname)
  //   ) {
  //     websocketSignOut();
  //     router.push("/");
  //   }
  // }, [session?.user, webSocketIsLoggedIn, router.pathname]);

  return (
    <SessionProvider session={session}>
      <Head>
        <title>Home</title>
        <meta name="description" content="Board game clock home page" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
