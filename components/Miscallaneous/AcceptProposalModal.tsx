import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type AcceptConfirmModalProps = {
  visible: boolean;
  companyName: string;
  bidAmount: number | string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function AcceptConfirmModal({
  visible,
  companyName,
  bidAmount,
  onCancel,
  onConfirm,
  isLoading = false,
}: AcceptConfirmModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const amountLabel =
    typeof bidAmount === "string"
      ? bidAmount
      : `₦${(bidAmount || 0).toLocaleString()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            opacity: backdropOpacity,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onCancel}
          />
        </Animated.View>

        <Animated.View
          style={{
            backgroundColor: "#F2F2F7",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
            transform: [{ translateY }],
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#C7C7CC",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <Animated.View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#1D4ED8",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              marginBottom: 16,
              shadowColor: "#1D4ED8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              transform: [{ scale: iconScale }],
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: "700",
                lineHeight: 28,
              }}
            >
              ✓
            </Text>
          </Animated.View>

          <Text
            style={{
              color: "#111827",
              fontSize: 20,
              fontWeight: "700",
              letterSpacing: 0.2,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Accept Proposal
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 15,
              lineHeight: 21,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Are you sure you want to accept{" "}
            <Text style={{ color: "#111827", fontWeight: "700" }}>
              {companyName}
            </Text>
            's proposal of{" "}
            <Text style={{ color: "#111827", fontWeight: "700" }}>
              {amountLabel}
            </Text>
            ?
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 13,
              lineHeight: 18,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            This will notify the builder and begin the contract process.
          </Text>

          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={isLoading}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: "#374151", fontSize: 16, fontWeight: "600" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isLoading}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                backgroundColor: "#1D4ED8",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#1D4ED8",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
