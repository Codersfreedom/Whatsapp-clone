import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const addUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
    });
    return userId;
  },
});
