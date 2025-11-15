import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import * as ChatScreenModule from "../../components/messaging/ChatScreen";
// Support both CommonJS and ES module default interop in runtime bundlers
const ChatScreen: any = (ChatScreenModule as any)?.default ?? ChatScreenModule;

export default function PatientConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [isOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | undefined>();

  // Simulate typing indicator after a message is received
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTypingUserName("Dr. John Smith");

      // Stop typing after 2 seconds
      const stopTypingTimer = setTimeout(() => {
        setIsTyping(false);
        setTypingUserName(undefined);
      }, 2000);

      return () => clearTimeout(stopTypingTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Mock conversation data - in real app, fetch from backend
  const conversationMap: Record<string, any> = {
    "conv-1": {
      name: "Dr. John Smith",
      currentUserName: "James Wilson",
      currentUserId: "mock-user-patient",
    },
    "conv-2": {
      name: "Dr. Sarah Johnson",
      currentUserName: "James Wilson",
      currentUserId: "mock-user-patient",
    },
    "conv-3": {
      name: "Dr. Michael Chen",
      currentUserName: "James Wilson",
      currentUserId: "mock-user-patient",
    },
  };

  const data = conversationMap[conversationId || ""] || {
    name: "Doctor",
    currentUserName: "Patient",
    currentUserId: "patient-user",
  };

  const handleSendMessage = async (text: string): Promise<void> => {
    // Simulate message sending with network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Patient sent message:", text);
        // Simulate doctor typing after receiving message
        setTimeout(() => {
          setIsTyping(true);
          setTypingUserName(data.name);
          setTimeout(() => {
            setIsTyping(false);
            setTypingUserName(undefined);
          }, 1500);
        }, 800);
        resolve();
      }, 500);
    });
  };

  return (
    <ChatScreen
      conversationId={conversationId || ""}
      conversationName={data.name}
      currentUserId={data.currentUserId}
      currentUserName={data.currentUserName}
      isOnline={isOnline}
      isTyping={isTyping}
      typingUserName={typingUserName}
      onSendMessage={handleSendMessage}
    />
  );
}