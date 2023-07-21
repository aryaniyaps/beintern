import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { HomeLayout } from "~/components/home/layout";
import { LoadingScreen } from "~/components/loading-screen";
import { MessageController } from "~/components/room/message-controller";
import { MessageList } from "~/components/room/message-list";
import { useRoom } from "~/hooks/use-room";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";
import { pusher } from "~/utils/pusher";

export default function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const utils = api.useContext();

  const { data: session } = useSession();

  const { data: room, isLoading } = api.room.getById.useQuery(
    {
      id,
    },
    { refetchOnMount: false }
  );

  const { roomId, setRoomId } = useRoom(); // use roomId where needed, setRoomId to update the roomId

  useEffect(() => {
    setRoomId(id); // Update roomId when id changes
  }, [id, setRoomId]);

  useEffect(() => {
    if (roomId) {
      // Subscribe to the channel you want to listen to
      const channel = pusher.subscribe(`room-${roomId}`);

      channel.bind(
        "message:create",
        async (newMessage: {
          id: string;
          ownerId: string;
          createdAt: Date;
          updatedAt: Date;
          owner: {
            image: string;
            username: string;
            name?: string | null | undefined;
          };
          content: string;
          roomId: string;
        }) => {
          await utils.message.getAll.cancel();

          utils.message.getAll.setInfiniteData(
            { limit: 10, roomId },
            (oldData) => {
              if (oldData == null || oldData.pages[0] == null) return;
              return {
                ...oldData,
                pages: [
                  {
                    ...oldData.pages[0],
                    items: [newMessage, ...oldData.pages[0].items],
                  },
                  ...oldData.pages.slice(1),
                ],
              };
            }
          );
        }
      );

      // Unsubscribe when the component unmounts
      return () => {
        pusher.unsubscribe(`room-${roomId}`);
        setRoomId(null);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, setRoomId]);

  if (!session || isLoading || !room) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>
          {room.name} | {APP_NAME}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeLayout title={room.name} session={session}>
        {/* TODO: add edit button here if user is owner */}
        <div className="flex min-h-full min-w-full flex-col gap-8 px-4">
          <MessageList roomId={room.id} />
          <MessageController roomId={room.id} />
        </div>
      </HomeLayout>
    </>
  );
}

// TODO: add auth to this page
export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ id: string }>
) => {
  const id = context.params?.id;

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const helper = ssgHelper();

  let room;

  try {
    room = await helper.room.getById.fetch({ id });
  } catch {
    return {
      notFound: true,
    };
  }

  if (!room) {
    return {
      notFound: true,
    };
  }

  // dehydrate the state
  const trpcState = helper.dehydrate();

  return {
    props: {
      id,
      trpcState,
    },
  };
};
