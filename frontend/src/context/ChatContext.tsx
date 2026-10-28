
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import socket from "../services/socket";

export type ChatMessage = {
    fromAuthId: string,
    from: string;
    toAuthId: string,
    to: string;
    content: string;
    sentAt: string;
};

type ChatContextType = {
    conversations: Record<string, ChatMessage[]>;
    error: string | null;
    sendMessage: (toAuthId: string, content: string) => boolean;
    clearError: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { authId, isLoggedIn } = useAuth();

    const [conversations, setConversations] = useState<
        Record<string, ChatMessage[]>
    >({});

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn || !authId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setConversations({});
            setError(null);
            return;
        }

        function handleMessage(message: ChatMessage) {
            const otherAuthId =
                message.fromAuthId === authId
                    ? message.toAuthId
                    : message.fromAuthId;

            setConversations((previous) => ({
                ...previous,
                [otherAuthId]: [
                    ...(previous[otherAuthId] ?? []),
                    message,
                ],
            }));
        }

        function handleError(response: { message: string }) {
            setError(response.message || "Unable to send the message.");
        }

        socket.on("chat:message", handleMessage);
        socket.on("chat:error", handleError);

        return () => {
            socket.off("chat:message", handleMessage);
            socket.off("chat:error", handleError);
        };
    }, [authId, isLoggedIn]);

    const sendMessage = useCallback(
        (toAuthId: string, content: string): boolean => {
            const trimmedMessage = content.trim();

            if (!trimmedMessage) {
                setError("Message cannot be empty.");
                return false;
            }

            if (trimmedMessage.length > 500) {
                setError("Message cannot exceed 500 characters.");
                return false;
            }

            if (!toAuthId.trim()) {
                setError("Choose a recipient first.");
                return false;
            }

            if (authId === toAuthId) {
                setError("You cannot send a message to yourself.");
                return false;
            }

            if (!socket.connected) {
                setError("You are not connected to the chat server.");
                return false;
            }

            setError(null);

            // The backend sends chat:message back to the sender too.
            // Do not add the message to conversations here.
            socket.emit("chat:send", {
                toAuthId: toAuthId.trim(),
                content: trimmedMessage,
            });

            return true;
        },
        [authId],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <ChatContext.Provider
            value={{
                conversations,
                error,
                sendMessage,
                clearError,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error("useChat must be used inside a ChatProvider.");
    }

    return context;
}
