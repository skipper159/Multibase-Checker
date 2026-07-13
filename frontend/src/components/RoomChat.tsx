import React, { useEffect, useRef, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, Heading, Text, Button, Flex, TextField, ScrollArea } from "@radix-ui/themes";
import api from "../lib/api";

// Use the generated UUID room (change if needed)
const ROOM_ID = "11111111-1111-1111-1111-111111111111";
const CHANNEL_TOPIC = `room:${ROOM_ID}:messages`;
const EVENT_NAME = "message_created";

interface Message {
  id?: string;
  user_id?: string;
  content: string;
  inserted_at?: string;
}

export default function RoomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string>("Connecting...");
  const channelRef = useRef<any | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch connection info from our backend
        const res = await api.post("/tests/realtime/connection-info");
        if (!res.data.success) {
          setStatus("Failed to fetch connection info");
          return;
        }

        const { supabaseUrl, anonKey } = res.data.data;

        // Initialize Supabase Client
        const supabase = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false },
          realtime: {
            vsn: '1.0.0'
          } as any
        });
        supabaseRef.current = supabase;

        // Prevent double subscription
        if (channelRef.current && channelRef.current.state === "subscribed") return;

        setStatus("Joining channel...");

        const channel = supabase.channel(CHANNEL_TOPIC, {
          config: {
            broadcast: { self: true, ack: true }
          },
        });

        channel
          .on(
            "broadcast",
            { event: EVENT_NAME },
            (payload: { event: string; payload: Message }) => {
              const incoming = payload.payload;
              setMessages((prev) => [...prev, incoming]);
            }
          )
          .subscribe((subscribeStatus) => {
            if (subscribeStatus === "SUBSCRIBED") {
              setStatus("Connected");
            } else {
              setStatus(`Status: ${subscribeStatus}`);
            }
          });

        channelRef.current = channel;
      } catch (err) {
        console.error("Failed to subscribe:", err);
        setStatus("Error: " + String(err));
      }
    })();

    return () => {
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !channelRef.current) return;

    const payload: Message = {
      content: input.trim(),
      user_id: "User_" + Math.floor(Math.random() * 1000), // Mock user ID for test
      inserted_at: new Date().toISOString(),
    };

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: EVENT_NAME,
        payload,
      });

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <Card size="3" style={{ maxWidth: 600, margin: "0 auto", marginTop: 24 }}>
      <Heading size="4" mb="2">Realtime Chat Room</Heading>
      <Text size="2" color="gray" mb="4" as="div">
        Status: <span style={{ color: status === 'Connected' ? 'green' : 'orange' }}>{status}</span>
      </Text>

      <ScrollArea style={{ height: 300, border: "1px solid var(--gray-5)", borderRadius: 6, padding: 12, marginBottom: 16 }}>
        {messages.length === 0 ? (
          <Text size="2" color="gray" style={{ fontStyle: 'italic' }}>No messages yet. Send one below!</Text>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--gray-4)" }}>
              <Flex justify="between">
                <Text size="1" weight="bold" style={{ color: 'var(--accent-11)' }}>{m.user_id}</Text>
                <Text size="1" color="gray">{new Date(m.inserted_at || "").toLocaleTimeString()}</Text>
              </Flex>
              <Text size="2" style={{ marginTop: 4 }}>{m.content}</Text>
            </div>
          ))
        )}
      </ScrollArea>

      <Flex gap="2">
        <input
          style={{ flex: 1, padding: "8px 12px", borderRadius: 4, border: "1px solid var(--gray-5)", background: "var(--color-background)" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={status !== 'Connected' || !input.trim()}>
          Send
        </Button>
      </Flex>
    </Card>
  );
}
