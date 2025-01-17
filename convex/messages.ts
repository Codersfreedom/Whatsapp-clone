import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";


export const sendTextMessage = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
    conversation: v.id("conversations"),
    
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) throw new ConvexError("User not found!");

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversation))
      .first();

    if (!conversation?.participants.includes(user._id)) {
      throw new ConvexError("You are not a part of this conversation");
    }

    await ctx.db.insert("messages", {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: "text",
    });

    // TODO: Add chatgpt conversation here
    if(args.content.startsWith("@gpt")){
      await ctx.scheduler.runAfter(0,api.openai.chat,{
        messageBody:args.content,
        conversation:args.conversation,
        
      })
    }

    if(args.content.startsWith("@dall-e")){
      await ctx.scheduler.runAfter(0,api.openai.dall_e,{
        messageBody:args.content,
        conversation:args.conversation,
      })
    }


  },
});

export const sendChatGptMessage = mutation({
  args:{
    content:v.string(),
    conversation:v.id("conversations"),
    messageType:v.union(v.literal("text"),v.literal("image")),
  },
  handler: async (ctx,args) =>{
    await ctx.db.insert("messages",{
      content:args.content,
      sender:"ChatGpt",
      messageType:args.messageType,
      conversation:args.conversation,
    })
  }
})


export const getMessages = query({
  args: {
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    
    // fetching all the messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args!.conversation)
      )
      .collect();

    const userProfileCache = new Map();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const image = message.messageType ==="text" ? "/gpt.png" :"/dall-e.png";
        if(message.sender ==="ChatGPT"){
          return {...message,sender:{name:"ChatGPT",image:image}}
        }
        
        let sender;

        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender);
        } else {
          sender = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), message.sender))
            .first();

            // storing in hastable
          userProfileCache.set(message.sender, sender);
        }
        return {...message,sender};
      })
    );
    return messagesWithSender;
  },
});

export const sendImage = mutation({
  args: {
    sender: v.id("users"),
    imageId: v.id("_storage"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const content = (await ctx.storage.getUrl(args.imageId)) as string;



 
    await ctx.db.insert("messages", {
      sender: args.sender,
      content: content,
      conversation: args.conversation,
      messageType: "image",
    });

    // TODO: Add chatgpt conversation here
  },
});

export const sendVideo = mutation({
  args: {
    sender: v.id("users"),
    videoId: v.id("_storage"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const content = (await ctx.storage.getUrl(args.videoId)) as string;



 
    await ctx.db.insert("messages", {
      sender: args.sender,
      content: content,
      conversation: args.conversation,
      messageType: "video",
    });

    // TODO: Add chatgpt conversation here
  },
});