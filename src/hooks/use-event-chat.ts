import * as Ably from "ably";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/actions/event-chat.actions";
import {
  censorMessage,
  deleteMyMessage,
  getEventMessages,
  sendEventMessage,
  uncensorMessage,
} from "@/actions/event-chat.actions";
import { avatarColor, initials } from "@/components/arena/tokens";
import { EVENT_CHAT_MESSAGE_EVENT, eventChannelName } from "@/lib/ably";

export interface EventChatMessage {
  id: number;
  name: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  self: boolean;
  censored: boolean;
}

interface UseEventDetailChatOptions {
  eventId: number;
  currentUserId: string;
  canChat: boolean;
  isCaptain: boolean;
  initialMessages: ChatMessage[];
  active: boolean;
  locale: string;
}

function toTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useEventDetailChat({
  eventId,
  currentUserId,
  canChat,
  isCaptain,
  initialMessages,
  active,
  locale,
}: UseEventDetailChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const appendMessage = useCallback((incoming: ChatMessage) => {
    setMessages(prev =>
      prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming],
    );
  }, []);

  // Subscribe to the Ably channel for real-time delivery.
  useEffect(() => {
    if (!canChat) return;

    const client = new Ably.Realtime({
      authUrl: "/api/ably/token",
      echoMessages: false,
    });
    const channel = client.channels.get(eventChannelName(eventId));

    const handler = (msg: Ably.Message) => {
      appendMessage(msg.data as ChatMessage);
    };

    channel.subscribe(EVENT_CHAT_MESSAGE_EVENT, handler);

    return () => {
      channel.unsubscribe(EVENT_CHAT_MESSAGE_EVENT, handler);
      try {
        Promise.resolve(client.close()).catch(() => {});
      } catch (e) {}
    };
  }, [canChat, eventId, appendMessage]);

  // Refresh history when the tab opens (covers messages missed while closed).
  useEffect(() => {
    if (!active || !canChat) return;
    let cancelled = false;
    getEventMessages(eventId).then(result => {
      if (!cancelled && result.success) {
        setMessages(result.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [active, canChat, eventId]);

  useEffect(() => {
    if (active) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [active]);

  const handleSendMessage = useCallback(async () => {
    const text = inputMessage.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const result = await sendEventMessage(eventId, text);
      if (result.success) {
        appendMessage(result.data);
        setInputMessage("");
        // Scroll to bottom after send
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    } finally {
      setSending(false);
    }
  }, [inputMessage, sending, eventId, appendMessage]);

  const handleDeleteMessage = useCallback(
    async (messageId: number) => {
      const result = await deleteMyMessage(messageId);
      if (result.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    },
    [],
  );

  const handleCensorMessage = useCallback(
    async (messageId: number) => {
      if (!isCaptain) return;
      const msg = messages.find(m => m.id === messageId);
      const alreadyCensored = !!msg?.censoredAt;
      const result = alreadyCensored
        ? await uncensorMessage(messageId)
        : await censorMessage(messageId);
      if (result.success) {
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, censoredAt: alreadyCensored ? null : new Date().toISOString() }
              : m,
          ),
        );
      }
    },
    [isCaptain, messages],
  );

  const chatMessages = useMemo<EventChatMessage[]>(
    () =>
      messages.map(m => ({
        id: m.id,
        name: m.authorName,
        initials: initials(m.authorName),
        color: avatarColor(m.authorId),
        text: m.text,
        time: toTime(m.createdAt, locale),
        self: m.authorId === currentUserId,
        censored: !!m.censoredAt,
      })),
    [messages, locale, currentUserId],
  );

  return {
    chatEndRef,
    chatMessages,
    handleSendMessage,
    handleDeleteMessage,
    handleCensorMessage,
    inputMessage,
    setInputMessage,
    sending,
    isCaptain,
  };
}
