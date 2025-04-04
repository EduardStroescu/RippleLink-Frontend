import { getRouteApi, Link } from "@tanstack/react-router";
import { memo } from "react";

import { ChatHeaderDetails } from "@/components/chatId/ChatHeaderDetails";
import { CustomDialogTrigger } from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/forms/SearchUsersForm";
import {
  AddUsersIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/Icons";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { useChatName } from "@/lib/hooks/useChatName";
import { useIsInterlocutorOnline } from "@/lib/hooks/useIsInterlocutorOnline";
import { useCallStoreActions } from "@/stores/useCallStore";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

const Route = getRouteApi("/chat/$chatId");

export const ChatHeaderSection = memo(
  ({
    isDmChat,
    interlocutors,
    currentChat,
    isAbleToCall,
  }: {
    isDmChat: boolean;
    interlocutors: PublicUser[];
    currentChat: Chat | undefined;
    isAbleToCall: boolean;
  }) => {
    const { chatId } = Route.useParams();
    const { startCall } = useCallStoreActions();

    const {
      isEditingChatName,
      chatName,
      setChatName,
      handleResetInput,
      handleEditChatName,
    } = useChatName({ currentChat, isDmChat, interlocutors });
    const { isInterlocutorOnline } = useIsInterlocutorOnline({
      interlocutors,
      chatId,
    });

    const handleStartCall = (videoEnabled?: boolean) => {
      if (!currentChat || !isAbleToCall) return;
      startCall(currentChat, videoEnabled);
    };

    return (
      <div className="flex justify-between p-2 items-center">
        {isDmChat ? (
          <ChatHeaderDetails
            avatarUrl={interlocutors[0]?.avatarUrl || placeholderAvatar}
            name={interlocutors[0]?.displayName || "User"}
            lastSeen={interlocutors[0]?.status?.lastSeen}
            isInterlocutorOnline={isInterlocutorOnline}
          />
        ) : (
          <ChatHeaderDetails
            avatarUrl={currentChat?.avatarUrl || groupAvatar}
            name={chatName}
            handleEditChatName={handleEditChatName}
            isEditingChatName={isEditingChatName}
            setChatName={setChatName}
            handleResetInput={handleResetInput}
          />
        )}
        <div className="mr-0.5 sm:mr-4 flex gap-2 sm:gap-4">
          {isAbleToCall && (
            <>
              <button onClick={() => handleStartCall()} className="group">
                <CallIcon />
              </button>
              <button onClick={() => handleStartCall(true)} className="group">
                <VideoCallIcon />
              </button>
            </>
          )}
          <CustomDialogTrigger
            header="Create Group Chat"
            content={
              <SearchUsersForm
                existingChatUsers={interlocutors.map((person) => ({
                  _id: person._id,
                  displayName: person.displayName,
                }))}
              />
            }
            className="group"
          >
            <AddUsersIcon />
          </CustomDialogTrigger>
          <Link
            to="/chat/$chatId/details"
            preload={false}
            params={{ chatId }}
            className="group"
          >
            <InfoIcon />
          </Link>
        </div>
      </div>
    );
  }
);

ChatHeaderSection.displayName = "ChatHeaderSection";
