
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import { HiArrowCircleLeft, HiFlag, HiPhone, HiUserCircle } from "react-icons/hi";

export default function MessagesPage() {
    const supabase = createClient();

    const [user, setUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    const [openChat, setOpenChat] = useState(false);
    const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
    const[chat, setChat] = useState("all")
    const bottomRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // 1. Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, []);

    // 2. Fetch users
    const fetchUsers = async () => {
        if (!user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", user.id)
            .single();

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("company_id", profile?.company_id)
            .neq("id", user.id);

        setUsers(data || []);
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const filteredUsers = users.filter((u) =>
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    // 3. Fetch conversations (NO AUTO OPEN)
    const fetchChats = async () => {
        if (!user) return;

        const { data: myConvos } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", user.id);

        const convoIds = myConvos?.map((c) => c.conversation_id) || [];

        if (convoIds.length === 0) {
            setConversations([]);
            return;
        }

        const { data: partce } = await supabase
            .from("conversation_participants")
            .select(`
       conversation_id,
        user_id,
          user:profiles!conversation_participants_user_id_fkey (
             id,
             full_name
              )
      `)
            .in("conversation_id", convoIds);

        const grouped: any = {};

        partce?.forEach((item: any) => {
            if (!grouped[item.conversation_id]) {
                grouped[item.conversation_id] = [];
            }
            grouped[item.conversation_id].push(item);
        });

        const result = Object.entries(grouped).map(([id, users]: any) => {
            const other = users.find((u: any) => u.user_id !== user.id);
            return {
                conversation_id: id,
                user: other?.user || users[0]?.user,
            };
        });

        setConversations(result);
    };

    // 4. Fetch messages
    const fetchMessages = async (conversationId: string) => {
        const { data } = await supabase
            .from("messages")
            .select(`*, sender:profiles (id, full_name)`)
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        setMessages(data || []);

        await supabase
            .from("messages")
            .update({ seen: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", user.id);

        setUnreadMap((prev) => ({ ...prev, [conversationId]: 0 }));
    };

    // 5. Send message
    const sendMessage = async () => {
        if (!input.trim() || !activeChat || !user) return;

        await supabase.from("messages").insert({
            conversation_id: activeChat,
            sender_id: user.id,
            content: input,
            seen: false,
        });

        setInput("");
    };

    // 6. Start chat
    const startChat = async (otherUserId: string) => {
        if (!user) return;

        const { data: myConvos } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", user.id);

        const convoIds = myConvos?.map((c) => c.conversation_id) || [];

        if (convoIds.length > 0) {
            const { data: allParticipants } = await supabase
                .from("conversation_participants")
                .select("conversation_id, user_id")
                .in("conversation_id", convoIds);

            const convoMap: Record<string, string[]> = {};

            allParticipants?.forEach((row) => {
                if (!convoMap[row.conversation_id]) {
                    convoMap[row.conversation_id] = [];
                }
                convoMap[row.conversation_id].push(row.user_id);
            });

            const found = Object.entries(convoMap).find(
                ([_, users]) =>
                    users.includes(user.id) && users.includes(otherUserId)
            );

            if (found) {
                const convoId = found[0];
                setActiveChat(convoId);
                setOpenChat(true);
                fetchMessages(convoId);
                return;
            }
        }

        const { data: convo } = await supabase
            .from("conversations")
            .insert({})
            .select()
            .single();

        await supabase.from("conversation_participants").insert([
            { conversation_id: convo.id, user_id: user.id },
            { conversation_id: convo.id, user_id: otherUserId },
        ]);

        fetchChats();
        setActiveChat(convo.id);
        fetchMessages(convo.id);
        setOpenChat(true);
        setSearch("");
    };

    // unread
    const fetchUnreadCounts = async () => {
        if (!user) return;

        const { data } = await supabase
            .from("messages")
            .select("conversation_id")
            .eq("seen", false)
            .neq("sender_id", user.id);

        const counts: any = {};

        data?.forEach((msg) => {
            counts[msg.conversation_id] =
                (counts[msg.conversation_id] || 0) + 1;
        });

        setUnreadMap(counts);
    };

    useEffect(() => {
        if (user) {
            fetchChats();
            fetchUnreadCounts();
        }
    }, [user]);

    // realtime
    useEffect(() => {
        if (!activeChat) return;

        const channel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${activeChat}`,
                },
                (payload) => {
                    const newMsg = payload.new;

                    setMessages((prev) => [...prev, newMsg]);

                    if (newMsg.sender_id !== user.id) {
                        setUnreadMap((prev) => ({
                            ...prev,
                            [newMsg.conversation_id]:
                                (prev[newMsg.conversation_id] || 0) + 1,
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeChat]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-col bg-gray-100 my-6 font-poppins">
            <h1 className="text-center text-md font-bold my-2">
                Communicate with your team
            </h1>


            <div className="h-[80vh] flex">

                {/* Sidebar */}
                <div className={`bg-white shadow-lg ${openChat ? "hidden md:block md:w-1/" : "w-full md:w-1/3"}`}>
                    <div className="p-4">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search or start a new chat"
                            className="w-full p-2 border rounded-lg"
                        />
                        <div className="flex gap-1 py-2">
                            <button onClick={()=>setChat('all')} className={`text-gray-700 cursor-pointer text-xs px-2 ${chat === 'all'?"bg-blue-600 text-white rounded-md":""}`}>All</button>
                            <button onClick={()=>setChat('group')} className={`text-gray-700 cursor-pointer text-xs p-1 ${chat === 'group'?"bg-blue-600 text-white rounded-md":""}`}>Group</button>
                            <button onClick={()=>setChat('unread')} className={`text-gray-700 cursor-pointer text-xs p-1 ${chat === 'unread'?"bg-blue-600 text-white rounded-md":""}`}>Unread</button>
                            <button onClick={()=>setChat('archeaved')} className={`text-gray-700 cursor-pointer text-xs p-1 ${chat === 'archeaved'?"bg-blue-600 text-white rounded-md":""}`}>Archeved</button>
                        </div>
                    </div>

                    {search && (
                        <div className="border-b">
                            {filteredUsers.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => startChat(u.id)}
                                    className="p-3 cursor-pointer hover:bg-gray-100"
                                >
                                    <p>{u.full_name}</p>
                                    <p className="text-xs text-gray-500">Start new chat</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        {conversations.map((chat) => (
                            <div
                                key={chat.conversation_id}
                                onClick={() => {
                                    setActiveChat(chat.conversation_id);
                                    fetchMessages(chat.conversation_id);
                                    setOpenChat(true);
                                }}
                                className={`p-4 cursor-pointer border-b ${activeChat === chat.conversation_id
                                    ? "bg-blue-50"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-medium flex items-center gap-2">
                                        <span>
                                            <HiUserCircle width={40}/>
                                        </span>
                                        {chat.user?.full_name}</p>

                                    {unreadMap[chat.conversation_id] > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            {unreadMap[chat.conversation_id]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {conversations.length === 0 && (
                            <p className="p-4 text-gray-500">No conversations yet</p>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {openChat ? (
                    <div className="flex-1 flex flex-col max-w-[100%]">

                        <div className="p-4 bg-white shadow-b flex justify-between ">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setOpenChat(false)}
                                    className="md:hidden"
                                >
                                    <HiArrowCircleLeft width={50} />
                                </button>
                                <p className="font-semibold">Chat</p>
                            </div>


                            <div className="">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <HiFlag className="size-6 text-blue-700" />
                                        <HiPhone className="size-6 text-blue-500" />
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === user?.id
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={` flex gap-2 items-end p-2 rounded-lg max-w-xs ${msg.sender_id === user?.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200"
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="text-xs opacity-70 block px-2">
                                            {new Date(msg.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}

                                        </span>

                                        {msg.sender_id === user?.id && (
                                            <span className="text-xs block text-right">
                                                {msg.seen ? "Seen" : "Sent"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-4 bg-white shadow-t flex gap-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);

                                    // auto resize
                                    if (textareaRef.current) {
                                        textareaRef.current.style.height = "auto";
                                        textareaRef.current.style.height =
                                            textareaRef.current.scrollHeight + "px";
                                    }
                                }}
                                placeholder="Type a message"
                                rows={1}
                                className="flex-1 p-2 border rounded-lg resize-none overflow-hidden"
                            />

                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 rounded-lg"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        <h1 className="text-gray-400 text-lg">Select chat</h1>
                    </div>
                )}
            </div>
        </div>
    );
}
