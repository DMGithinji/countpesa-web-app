import { Bot, RefreshCcw, Send, X } from "lucide-react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";
import { useChatPesa } from "@/hooks/useChatPesa";
import { useCallback, useEffect, useRef } from "react";

const SAMPLE_QUESTIONS = [
  "What are my total transaction costs?",
  "Exclude all Transfer and Uncategorized transactions?",
  "Show me how much I have transacted through Fuliza?",
  "Show me the total amount I spend on electricity per month?",
];

function ChatPanel() {
  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);
  const { messages, isLoading, input, setInput, handleSendMessage, refreshChat } = useChatPesa();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="bg-zinc-900 text-white sticky top-0 z-50 pl-4 pr-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex gap-2 items-center pt-4.5 pb-3 text-white">
            <Bot size={20} className="text-white" />
            ChatPesa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              title="Refresh chat"
              onClick={refreshChat}
              className="hover:bg-transparent hover:text-white"
            >
              <RefreshCcw size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSidepanel(SidepanelMode.Closed)}
              className="hover:bg-transparent hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 px-4 pt-0 overflow-y-auto relative">
        <div className="space-y-4 mb-16">
          {messages.map((message) => (
            <div
              key={message.text}
              className={`flex pt-4 mb-0 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] flex flex-col p-3 space-y-1 rounded-lg text-sm ${
                  message.sender === "user"
                    ? "bg-gray-200 dark:bg-[#3B403D] dark:text-white"
                    : "bg-[#D4F0E5] dark:text-background text-foreground"
                }`}
              >
                <span className="font-semibold pb-2">
                  {message.sender === "user" ? "Me" : "ChatPesa"}
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(message.text),
                  }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start pt-4">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-primary/50 rounded-full animate-[pulse_1.2s_infinite]" />
                <span className="h-2 w-2 bg-primary/50 rounded-full animate-[pulse_1.2s_infinite_0.2s]" />
                <span className="h-2 w-2 bg-primary/50 rounded-full animate-[pulse_1.2s_infinite_0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {messages.length <= 2 && (
          <div className="absolute bottom-2 pr-4">
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_QUESTIONS.map((starter) => (
                <Card
                  key={starter}
                  className="text-[14px] text-foreground/95  p-4 cursor-pointer"
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
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ChatPesa..."
              className="flex-1 border-gray-400 w-full min-h-[20px] max-h-[150px] resize-y text-sm sm:text-base"
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
              className="bg-primary hover:bg-primary/90 shrink-0 w-full sm:w-auto px-4 py-2"
              disabled={isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </div>
  );
}

export default ChatPanel;
