import { useConversationStore } from "@/store/chat-store";
import ChatBubble from "./ChatBubble";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

const MessageContainer = () => {
	const {selectedConversation} = useConversationStore()
	const me = useQuery(api.users.getMe);
	const messages = useQuery(api.messages.getMessages,{
		conversation:selectedConversation!._id,
	})

	return (
		<div className='relative p-3 mb-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark'>
			<div className='mx-12 flex flex-col gap-3 h-full'>
				{messages?.map((msg,idx) => (
					<div key={msg._id}>
						<ChatBubble message={msg} me={me} 
						previousMessage={idx >0 ? messages[idx-1] :undefined}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
export default MessageContainer;