import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import ChatScreen from "../../components/messaging/ChatScreen";

export default function DoctorConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [isOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | undefined>();

  // Simulate typing indicator after a message is received
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTypingUserName("James Wilson");

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
    "conv-doc-1": {
      name: "James Wilson",
      currentUserName: "Dr. John Smith",
      currentUserId: "mock-user-doctor",
    },
    "conv-doc-2": {
      name: "Lisa Anderson",
      currentUserName: "Dr. John Smith",
      currentUserId: "mock-user-doctor",
    },
    "conv-doc-3": {
      name: "Robert Martinez",
      currentUserName: "Dr. John Smith",
      currentUserId: "mock-user-doctor",
    },
  };

  const data = conversationMap[conversationId || ""] || {
    name: "Patient",
    currentUserName: "Doctor",
    currentUserId: "doctor-user",
  };

  const handleSendMessage = async (text: string): Promise<void> => {
    // Simulate message sending with network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Doctor sent message:", text);
        // Simulate patient typing after receiving message
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