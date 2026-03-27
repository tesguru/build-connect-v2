import { useBids } from '@/core/hooks/UseBids';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CURRENT_USER = 'Abolanle Onabanjo';
const OTHER_USER = 'Ethan Carter';

const initialMessages = [
  {
    id: '1',
    sender: OTHER_USER,
    text: "Hello! I'm Abolanle, how can I help you today?",
    time: 'Today, 08:25am',
  },
  {
    id: '2',
    sender: CURRENT_USER,
    text: 'Hi Ethan, great to connect with you. How can we get started.',
    time: 'Today, 08:35am',
  },
  {
    id: '3',
    sender: OTHER_USER,
    text: "I've reviewed your project details. Let's schedule a call to discuss the next steps.",
    time: 'Today, 08:40am',
  },
  {
    id: '4',
    sender: CURRENT_USER,
    text: 'Sounds good! How about tomorrow afternoon, I hope that is cool with you?',
    time: 'Today, 09:29am',
  },
  {
    id: '5',
    sender: OTHER_USER,
    text: "Tomorrow afternoon works perfectly for me. Let's say 2:00 PM?",
    time: 'Today, 09:35am',
  },
];

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, isCurrentUser = false }) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className={`w-9 h-9 rounded-full items-center justify-center ${
        isCurrentUser ? 'bg-indigo-600' : 'bg-purple-100'
      }`}
    >
      <Text
        className={`text-sm font-bold ${
          isCurrentUser ? 'text-white' : 'text-purple-700'
        }`}
      >
        {initials}
      </Text>
    </View>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isMe = message.sender === CURRENT_USER;

  return (
    <View
      className={`flex-row mb-5 items-end ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isMe && (
        <View className="mr-2 mb-0.5">
          <Avatar name={message.sender} />
        </View>
      )}

      <View className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
        <Text className="text-xs font-semibold text-slate-400 mb-1 tracking-tight">
          {message.sender}
        </Text>

        <View
          className={`rounded-2xl px-4 pt-3 pb-2.5 ${
            isMe
              ? 'bg-indigo-600 rounded-tr-sm'
              : 'bg-white rounded-tl-sm shadow-sm'
          }`}
        >
          <Text
            className={`text-[15px] leading-[22px] ${
              isMe ? 'text-white' : 'text-slate-800'
            }`}
          >
            {message.text}
          </Text>
          <Text
            className={`text-[11px] font-medium mt-1.5 text-right ${
              isMe ? 'text-indigo-200 italic' : 'text-slate-400'
            }`}
          >
            {message.time}
          </Text>
        </View>
      </View>

      {isMe && (
        <View className="ml-2 mb-0.5">
          <Avatar name={message.sender} isCurrentUser />
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ReviewSummaryScreen({ bidId }: { bidId: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    const timeStr = `Today, ${hour12}:${minutes}${ampm}`;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: CURRENT_USER,
        text: inputText.trim(),
        time: timeStr,
      },
    ]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const canSend = inputText.trim().length > 0;

  const handleSendReviewSummary = () => {
    // Navigate to the Review Request screen, passing along the messages as context
    navigation?.navigate('SendReviewRequest', { messages });
  };

   const { bidRevisionSummary } = useBids();
  
    const {
      data: apiResponse,
      isLoading,
      error,
    } = bidRevisionSummary(bidId);

    console.log(apiResponse);

  return (
    <View className="mt-2">

     

    
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
        <View className="flex-row items-center gap-2">
          <Avatar name={OTHER_USER} />
          <View>
            <Text className="text-xs text-slate-400 font-medium">Builder</Text>
            <Text className="text-[13px] font-semibold text-slate-700">{OTHER_USER}</Text>
          </View>
        </View>

        {/* Divider line with arrow */}
        <View className="flex-row items-center gap-1">
          <View className="w-6 h-px bg-indigo-300" />
          <Text className="text-indigo-400 text-xs">↔</Text>
          <View className="w-6 h-px bg-indigo-300" />
        </View>

        <View className="flex-row items-center gap-2">
          <View className="items-end">
            <Text className="text-xs text-slate-400 font-medium">Client</Text>
            <Text className="text-[13px] font-semibold text-slate-700">{CURRENT_USER}</Text>
          </View>
          <Avatar name={CURRENT_USER} isCurrentUser />
        </View>
      </View>

   
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 12,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />


        <View className="px-4 pt-3 pb-2  border-t border-slate-100">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-indigo-600 rounded-2xl py-3.5 px-6 shadow-md"
            onPress={handleSendReviewSummary}
            activeOpacity={0.85}
          >
       
            <Text className="text-white text-base mr-2">📋</Text>
            <Text className="text-white text-[15px] font-bold tracking-wide">
              Send Review Summary
            </Text>
         
            <Text className="text-white text-base ml-2 opacity-80">→</Text>
          </TouchableOpacity>
          <Text className="text-center text-slate-400 text-[11px] mt-1.5">
            This will send a review request to both parties
          </Text>
        </View>

      
      </KeyboardAvoidingView>
    </View>
  );
}