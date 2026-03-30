import { useBids } from '@/core/hooks/UseBids';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatSentAt = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;
  return `Today, ${hour12}:${minutes}${ampm}`;
};

const mapApiMessages = (apiMessages: any[], builderName: string, clientName: string) =>
  apiMessages.map((msg) => ({
    id: msg.id,
    sender: msg.role === 'builder' ? builderName : clientName,
    senderRole: msg.role,
    text: msg.message,
    time: formatSentAt(msg.sentAt),
    isStatic: msg.isStatic,
  }));

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, role = 'builder' }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isBuilder = role === 'builder';
  
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isBuilder ? '#eff6ff' : '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: isBuilder ? '#bfdbfe' : '#1e40af',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'Inter_600SemiBold',
          color: isBuilder ? '#2563eb' : '#ffffff',
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isBuilder }) => {
  const isMe = message.senderRole === 'builder';

  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      {!isMe && (
        <View style={{ marginRight: 12, marginBottom: 2 }}>
          <Avatar name={message.sender} role="client" />
        </View>
      )}

      <View style={{ maxWidth: '72%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'Inter_500Medium',
            color: '#94a3b8',
            marginBottom: 4,
          }}
        >
          {message.sender}
        </Text>

        <View
          style={{
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 10,
            backgroundColor: isMe ? '#2563eb' : '#ffffff',
            borderTopRightRadius: isMe ? 4 : 20,
            borderTopLeftRadius: isMe ? 20 : 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              fontFamily: 'Inter_400Regular',
              color: isMe ? '#ffffff' : '#1e293b',
            }}
          >
            {message.text}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Inter_400Regular',
              marginTop: 6,
              textAlign: 'right',
              color: isMe ? '#bfdbfe' : '#cbd5e1',
            }}
          >
            {message.time}
          </Text>
        </View>
      </View>

      {isMe && (
        <View style={{ marginLeft: 12, marginBottom: 2 }}>
          <Avatar name={message.sender} role="builder" />
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ReviewSummaryScreen({ bidId, bidData }: { bidId: string; bidData?: any }) {
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const { bidRevisionSummary } = useBids();
  const { data: apiResponse, isLoading, error } = bidRevisionSummary(bidId);

  // Get builder and client names from bid data
  const builderName = bidData?.contractor 
    ? `${bidData.contractor.firstName} ${bidData.contractor.lastName}`
    : 'Builder';
  const clientName = bidData?.project?.client 
    ? `${bidData.project.client.firstName} ${bidData.project.client.lastName}`
    : 'Client';

  // Derive messages from API response
  const messages = apiResponse?.data?.messages
    ? mapApiMessages(apiResponse.data.messages, builderName, clientName)
    : [];

  const handleSendReviewSummary = () => {
    router.push("/(builders)/revisionscreen/revisionscreen")
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text 
          style={{ 
            fontFamily: 'Inter_400Regular', 
            color: '#94a3b8', 
            fontSize: 13, 
            marginTop: 12 
          }}
        >
          Loading conversation…
        </Text>
      </View>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text 
          style={{ 
            fontFamily: 'Inter_500Medium', 
            color: '#ef4444', 
            fontSize: 14, 
            textAlign: 'center',
            marginTop: 16
          }}
        >
          Failed to load messages. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
    
      <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={builderName} role="builder" />
          <View>
            <Text 
              style={{ 
                fontFamily: 'Inter_400Regular', 
                fontSize: 11, 
                color: '#64748b' 
              }}
            >
              Builder
            </Text>
            <Text 
              style={{ 
                fontFamily: 'Inter_600SemiBold', 
                fontSize: 14, 
                color: '#0f172a' 
              }}
            >
              {builderName}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 1, backgroundColor: '#cbd5e1' }} />
          <Ionicons name="swap-horizontal" size={16} color="#94a3b8" />
          <View style={{ width: 30, height: 1, backgroundColor: '#cbd5e1' }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text 
              style={{ 
                fontFamily: 'Inter_400Regular', 
                fontSize: 11, 
                color: '#64748b' 
              }}
            >
              Client
            </Text>
            <Text 
              style={{ 
                fontFamily: 'Inter_600SemiBold', 
                fontSize: 14, 
                color: '#0f172a' 
              }}
            >
              {clientName}
            </Text>
          </View>
          <Avatar name={clientName} role="client" />
        </View>
      </View>

      {/* ── Message list + CTA ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble 
              message={item} 
              isBuilder={item.senderRole === 'builder'} 
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 16,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="chatbubble-outline" size={48} color="#cbd5e1" />
              <Text 
                style={{ 
                  fontFamily: 'Inter_400Regular', 
                  color: '#94a3b8', 
                  fontSize: 14, 
                  marginTop: 12 
                }}
              >
                No messages yet.
              </Text>
            </View>
          }
        />

        <View style={{ 
          paddingHorizontal: 20, 
          paddingTop: 16, 
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          backgroundColor: '#ffffff',
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2563eb',
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 20,
              gap: 8,
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleSendReviewSummary}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text 
              style={{ 
                color: '#ffffff', 
                fontSize: 15, 
                fontFamily: 'Inter_600SemiBold',
                letterSpacing: 0.3,
              }}
            >
              Send Review Summary
            </Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <Text 
            style={{ 
              textAlign: 'center', 
              color: '#94a3b8', 
              fontSize: 11, 
              fontFamily: 'Inter_400Regular',
              marginTop: 12,
            }}
          >
            This will send a review request to both parties
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}