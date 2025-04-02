"use client";

import { useState, useEffect } from "react";
import ChatSection from "./ChatSection";
import InlineArtifactDisplay from "./InlineArtifactDisplay";
import ArtifactService from "@/app/services/ArtifactService";

export default function ChatPage() {
  const [chatHistory] = useState([]);
  const [isLoading] = useState(false);
  const [currentConversationId] = useState(Date.now());
  const [artifacts, setArtifacts] = useState([]);
  const [currentArtifactId, setCurrentArtifactId] = useState(null);

  useEffect(() => {
    if (currentConversationId) {
      const conversationArtifacts = ArtifactService.getArtifactsForConversation(currentConversationId);
      setArtifacts(conversationArtifacts);

      const storedArtifactId = ArtifactService.getCurrentArtifactId(currentConversationId);
      if (storedArtifactId && conversationArtifacts.some(a => a.id === storedArtifactId)) {
        setCurrentArtifactId(storedArtifactId);
      } else if (conversationArtifacts.length > 0) {
        setCurrentArtifactId(conversationArtifacts[0].id);
      }
    }
  }, [currentConversationId]);

  

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-white">
      <main className="flex-1 flex flex-col overflow-auto">
        <ChatSection
          chatHistory={chatHistory}
          onSend={() => {}}
          isLoading={isLoading}
        />

        {currentArtifactId && (
          <InlineArtifactDisplay
            artifact={artifacts.find(a => a.id === currentArtifactId)}
            onMinimize={() => setCurrentArtifactId(null)}
          />
        )}
      </main>
    </div>
  );
}
