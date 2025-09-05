import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Chatbot() {
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("helloWhatWouldYouLikeToAsk") }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // thêm tin nhắn user vào list
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/ollama/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:1b",
          prompt: input,
          stream: false
        })
      });

      const data = await res.json();
      const reply = data.response || t("sorryIDontUnderstandYou");

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(t("errorCalling") + " Ollama:", err);
      setMessages([...newMessages, { role: "assistant", content: "⚠️ " + t("connectionError") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto border rounded-xl shadow-lg bg-white">
      {/* Vùng chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-fit ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto text-right"
                : "bg-gray-200 text-black self-start text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">{t("typing")}...</div>}
      </div>

      {/* Ô nhập */}
      <div className="p-3 border-t flex gap-2 border-black">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none text-black"
          placeholder={t("enteringMessage") + "..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
