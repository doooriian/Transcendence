
import { useEffect, useRef, useState, useMemo, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

type ChatWindowProps = {
    recipientAuthId: string;
    recipientUsername: string,
    onClose: () => void;
};

function ChatWindow({ recipientAuthId, recipientUsername, onClose }: ChatWindowProps) {
    const { authId } = useAuth();
    const { conversations, error, sendMessage, clearError } = useChat();

    const [draft, setDraft] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messages = useMemo(
        () => conversations[recipientAuthId] ?? [],
        [conversations, recipientAuthId],
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (sendMessage(recipientAuthId, draft)) {
            setDraft("");
        }
    }

    function handleClose() {
        clearError();
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6">
            <section
                role="dialog"
                aria-modal="true"
                aria-label={`Conversation with ${recipientUsername}`}
                className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl"
            >
                <header className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-white">
                            {recipientUsername}
                        </h2>
                        <p className="text-sm text-slate-400">
                            Private conversation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close conversation"
                        className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        ✕
                    </button>
                </header>

                <div
                    className="min-h-40 flex-1 space-y-3 overflow-y-auto p-4"
                    aria-live="polite"
                >
                    {messages.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                            No messages yet. Say hello!
                        </p>
                    ) : (
                        messages.map((message, index) => {
                            const isMine = message.fromAuthId === authId;

                            return (
                                <div
                                    key={`${message.sentAt}-${index}`}
                                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] break-words rounded-2xl px-4 py-2 ${
                                            isMine
                                                ? "bg-violet-600 text-white"
                                                : "bg-slate-800 text-slate-100"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        <p className="mt-1 text-right text-xs opacity-70">
                                            {new Date(message.sentAt).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mx-4 mb-2 rounded-lg border border-red-700 bg-red-950/60 p-3 text-sm text-red-300"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p>{error}</p>
                            <button
                                type="button"
                                onClick={clearError}
                                aria-label="Dismiss error"
                                className="shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="border-t border-white/10 p-3 sm:p-4"
                >
                    <label
                        htmlFor="chat-message"
                        className="mb-2 block text-sm text-slate-300"
                    >
                        Message
                    </label>

                    <textarea
                        id="chat-message"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder={`Message ${recipientUsername}...`}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-400"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">
                            {draft.length}/500
                        </span>

                        <button
                            type="submit"
                            disabled={!draft.trim() || draft.length > 500}
                            className="rounded-xl bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default ChatWindow;
