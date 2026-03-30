import AppLayout from '@/components/Layouts/AppLayout';
import { useBids } from '@/core/hooks/UseBids';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatSentAt = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;

  if (isToday) return `Today, ${hour12}:${minutes}${ampm}`;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${hour12}:${minutes}${ampm}`;
};

// ─── Get initials from name ─────────────────────────────────────────────────
const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ role, name }: { role: 'client' | 'builder'; name: string }) => {
  const isClient = role === 'client';
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isClient ? '#2563eb' : '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: isClient ? '#1e40af' : '#bfdbfe',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: 'Inter_600SemiBold',
          color: isClient ? '#ffffff' : '#2563eb',
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ item }: { item: any }) => {
  const isClient = item.role === 'client';

  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
        justifyContent: isClient ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Builder avatar — LEFT */}
      {!isClient && (
        <View style={{ marginRight: 12, marginBottom: 2 }}>
          <Avatar role="builder" name={item.name} />
        </View>
      )}

      <View style={{ maxWidth: '72%', alignItems: isClient ? 'flex-end' : 'flex-start' }}>
        {/* Real name label */}
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'Inter_500Medium',
            color: '#94a3b8',
            marginBottom: 4,
          }}
        >
          {item.name || (isClient ? 'Client' : 'Builder')}
        </Text>

        <View
          style={{
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 10,
            backgroundColor: isClient ? '#2563eb' : '#ffffff',
            borderTopRightRadius: isClient ? 4 : 20,
            borderTopLeftRadius: isClient ? 20 : 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {/* Static badge */}
          {item.isStatic && (
            <View
              style={{
                alignSelf: isClient ? 'flex-end' : 'flex-start',
                backgroundColor: isClient ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Inter_500Medium',
                  color: isClient ? '#bfdbfe' : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Initial
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              fontFamily: 'Inter_400Regular',
              color: isClient ? '#ffffff' : '#1e293b',
            }}
          >
            {item.message}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Inter_400Regular',
              marginTop: 6,
              textAlign: 'right',
              color: isClient ? '#bfdbfe' : '#cbd5e1',
            }}
          >
            {formatSentAt(item.sentAt)}
          </Text>
        </View>
      </View>

      {/* Client avatar — RIGHT */}
      {isClient && (
        <View style={{ marginLeft: 12, marginBottom: 2 }}>
          <Avatar role="client" name={item.name} />
        </View>
      )}
    </View>
  );
};

// ─── Status color ───────────────────────────────────────────────────────────
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: '#fef9c3', text: '#854d0e' };
    case 'revision_requested':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'accepted':
      return { bg: '#dcfce7', text: '#166534' };
    case 'rejected':
      return { bg: '#fee2e2', text: '#991b1b' };
    default:
      return { bg: '#f1f5f9', text: '#475569' };
  }
};

const formatStatusLabel = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ReviewSummaryScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { bidId } = useLocalSearchParams<{ bidId: string }>();
  const { bidRevisionSummary } = useBids();
  const { data: apiResponse, isLoading, error } = bidRevisionSummary(bidId);

  const messages: any[] = apiResponse?.data?.data?.messages ?? [];
  const bidStatus: string = apiResponse?.data?.status ?? '';

  // Derive participant names from messages
  const clientMsg = messages.find((m) => m.role === 'client');
  const builderMsg = messages.find((m) => m.role === 'builder');
  const clientName = clientMsg?.name || 'Client';
  const builderName = builderMsg?.name || 'Builder';

  const handleSendReviewSummary = () => {
    router.push({
      pathname: '/(builders)/revisionscreen/revisionscreen',
      params: { bidId },
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ fontFamily: 'Inter_400Regular', color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
          Loading conversation…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={{ fontFamily: 'Inter_500Medium', color: '#ef4444', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
          Failed to load messages. Please try again.
        </Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(bidStatus);

  return (
    <AppLayout screenName='Review Revision Summary' fullHeightContent >
       <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* ── Header: participant strip ── */}
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
        {/* Builder — left */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar role="builder" name={builderName} />
          <View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748b' }}>Builder</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#0f172a' }} numberOfLines={1}>
              {builderName}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 24, height: 1, backgroundColor: '#cbd5e1' }} />
          <Ionicons name="swap-horizontal" size={16} color="#94a3b8" />
          <View style={{ width: 24, height: 1, backgroundColor: '#cbd5e1' }} />
        </View>

        {/* Client — right */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748b' }}>Client</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#0f172a' }} numberOfLines={1}>
              {clientName}
            </Text>
          </View>
          <Avatar role="client" name={clientName} />
        </View>
      </View>

      {/* ── Bid status pill ── */}
      {!!bidStatus && (
        <View style={{ alignItems: 'center', paddingVertical: 8, backgroundColor: '#f8fafc' }}>
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: statusStyle.bg,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11,
                color: statusStyle.text,
              }}
            >
              {formatStatusLabel(bidStatus)}
            </Text>
          </View>
        </View>
      )}

      {/* ── Messages — plain ScrollView, no FlatList nesting issue ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="chatbubble-outline" size={48} color="#cbd5e1" />
              <Text style={{ fontFamily: 'Inter_400Regular', color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
                No messages yet.
              </Text>
            </View>
          ) : (
            messages.map((item) => <MessageBubble key={item.id} item={item} />)
          )}
        </ScrollView>

        {/* ── CTA ── */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
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
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleSendReviewSummary}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text className="font-inter" style={{ color: '#ffffff', fontSize: 15, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 }}>
              Send Review Summary
            </Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 12 }}>
            This will send a review request to both parties
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
    </AppLayout>
   
  );
}