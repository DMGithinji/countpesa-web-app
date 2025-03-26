import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSidepanelStore, { SidepanelMode } from "@/stores/sidepanel.store";
import { GoogleGenerativeAI } from "@google/generative-ai";
import promptText from "@/configs/prompt.txt?raw"
import useAIMessageStore from "@/stores/aiMessages.store";

const defaultStarters = [
  "What are my total transaction costs?",
  "Exclude all Transfer and Uncategorized transactions?",
  "Show me how much I have transacted through Fuliza?",
  "Show me the total amount I spend on electricity per month?",
];

const ChatPanel = () => {
  const setSidepanel = useSidepanelStore((state) => state.setMode);

  const messages = useAIMessageStore(state => state.messages);
  const setMessage = useAIMessageStore(state => state.setMessage);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const AIChat = useMemo(() => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: [],
    })
    return chat;
  }, [])

  const handleSendMessage = async (message: string) => {
    const isFirst = messages.length === 1;
    const context = promptText;
    let additionalContext = '';
    additionalContext += `${context}. This is the USER_PROMPT: ${message}`;
    const prompt = isFirst ? `${context}. ${additionalContext}` : message;
    setInput("")
    setMessage({ sender: "user", text: message });
    setTimeout(async () => {
      setIsLoading(true);
      const history = await AIChat.getHistory();
      console.log({history});
      const result = await AIChat.sendMessage(prompt);
      const response = result.response.text();
      setIsLoading(false);
      setMessage({ sender: "bot", text: response });
    }, 600);
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="bg-slate-900 text-white sticky top-0 z-50 pl-4 pr-0">
        <div className="flex items-center justify-between">
          <CardTitle className="py-4 text-white">ChatPesa</CardTitle>
          <Button
            variant={"ghost"}
            onClick={() => setSidepanel(SidepanelMode.Closed)}
            className="hover:bg-transparent hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea
        className="flex-1 px-4 pt-4 overflow-y-auto relative"
        ref={scrollAreaRef}
      >
        <div className="space-y-4 mb-16">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.sender === "user"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg text-sm bg-gray-700 text-gray-200">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {messages.length <= 2 && (
          <div className="absolute bottom-2 pr-4">
            <div className="grid grid-cols-2 gap-2">
              {defaultStarters.map((starter) => (
                <Card
                  key={starter}
                  className="text-xs text-gray-600 border-gray-300 hover:bg-gray-100 p-4 cursor-pointer"
                  onClick={() => handleSendMessage(starter)}
                >
                  {starter}
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <CardFooter className="border border-t-1 shadow pt-4 px-4 pb-4">
        <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto">
          <div className="flex w-full gap-2 flex-col sm:flex-row items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message ChatPesa..."
              className="flex-1 border-gray-400 w-full min-h-[60px] max-h-[150px] resize-y text-sm sm:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage(input)}
              className="bg-green-500 hover:bg-green-600 shrink-0 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </div>
  );
};

export default ChatPanel;