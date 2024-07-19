import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/store/chat-store";
import ChatBubbleAvatar from "./ChatBubbleAvatar";
import DateIndicator from "./DateInicator";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import ReactPlayer from "react-player";
import ChatAvatarActions from "./ChatAvatarActions";
import { Bot } from "lucide-react";

type ChatBubbleProps = {
  message: IMessage;
  me: any;
  previousMessage?: IMessage;
};
const ChatBubble = ({ message, me, previousMessage }: ChatBubbleProps) => {
  const date = new Date(message._creationTime);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const time = `${hour}:${minute}`;

  const { selectedConversation } = useConversationStore();
  const isMember =
    selectedConversation?.participants.includes(message.sender._id) || false;
  const isGroup = selectedConversation?.isGroup;
  const isMe = message.sender?._id === me._id;
  const fromAI = message.sender?.name ==="ChatGPT"
  const bgClass = isMe ? "bg-green-chat"  :!isMe ? "bg-white dark:bg-gray-primary" :"bg-blue-500 text-white";

  const [open, setOpen] = useState(false);

  const renderMessages = () => {
    switch (message.messageType) {
      case "text":
        return <TextMessage message={message} />;
      case "image":
        return (
          <ImageMessage message={message} handleClick={() => setOpen(true)} />
        );
      case "video":
        return <VideoMessage message={message} />;
    }
  };

  if (!isMe) {
    return (
      <>
        <DateIndicator message={message} previousMessage={previousMessage} />
        <div className="flex gap-1 w-2/3 ">
          <ChatBubbleAvatar
            message={message}
            isMember={isMember}
            isGroup={isGroup}
            fromAI = {fromAI}
          />

          <div
            className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}
          >
            {  !fromAI &&  <OtherMessageIndicator />}
            {fromAI && <Bot size={16} className="absolute bottom-[2px] left-2" />}
            {isGroup && <ChatAvatarActions message ={message} me ={me}  />}
            {renderMessages()}
            {open && (
              <ImageDialog
                src={message.content}
                open={open}
                onClose={() => setOpen(false)}
              />
            )}
            <MessageTime fromMe={isMe} time={time} />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <DateIndicator message={message} previousMessage={previousMessage} />
      <div className="flex gap-1 w-2/3 ml-auto">
        <div
          className={`flex  z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ml-auto ${bgClass}`}
        >
          <SelfMessageIndicator />
          {renderMessages()}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <MessageTime fromMe={isMe} time={time} />
        </div>
      </div>
    </>
  );
};
export default ChatBubble;

const OtherMessageIndicator = () => (
  <div className="absolute bg-white dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full" />
);

const SelfMessageIndicator = () => (
  <div className="absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden" />
);

const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
  return (
    <p className="text-[10px] mt-2 self-end flex gap-1 items-center">
      {time} {fromMe && <MessageSeenSvg />}
    </p>
  );
};

const TextMessage = ({ message }: { message: IMessage }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

  return (
    <div>
      {isLink ? (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className={`mr-2 text-sm font-light text-blue-400 underline`}
        >
          {message.content}
        </a>
      ) : (
        <p className={`mr-2 text-sm font-light`}>{message.content}</p>
      )}
    </div>
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: IMessage;
  handleClick: () => void;
}) => {
  return (
    <div className="w-[250px] h-[250px] m-2 relative">
      <Image
        src={message.content}
        fill
        className="cursor-pointer object-cover rounded"
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};
const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <ReactPlayer
      url={message.content}
      width="250px"
      height="250px"
      controls={true}
     
    />
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="min-w-[750px]">
        <DialogDescription className="relative h-[450px] flex justify-center">
          <Image
            src={src}
            fill
            className="rounded-lg object-contain"
            alt="image"
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
