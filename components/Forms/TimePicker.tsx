import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  use24Hour?: boolean;
}

// Accepts "HH:mm" (24-hour) or "hh:mm AM/PM" and returns hour/minute in 24-hour form
const parseTime = (val: string): { hour: number; minute: number } | null => {
  if (!val) return null;
  const match = val.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
};

const pad = (n: number) => String(n).padStart(2, "0");

const TimePicker = ({
  value,
  onChange,
  label,
  placeholder = "Select time",
  hasError,
  errorMessage,
  use24Hour = false,
}: TimePickerProps) => {
  const [visible, setVisible] = useState(false);

  const getPickerDate = () => {
    const parsed = parseTime(value);
    const date = new Date();
    date.setHours(parsed ? parsed.hour : 12, parsed ? parsed.minute : 0, 0, 0);
    return date;
  };

  const getDisplayValue = () => {
    const parsed = parseTime(value);
    if (!parsed) return value || "";

    if (use24Hour) return `${pad(parsed.hour)}:${pad(parsed.minute)}`;

    const period = parsed.hour >= 12 ? "PM" : "AM";
    const hour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12;
    return `${pad(hour12)}:${pad(parsed.minute)} ${period}`;
  };

  const handleConfirm = (date: Date) => {
    setVisible(false);
    // Always output 24-hour format for API compatibility
    onChange(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
  };

  return (
    <View className="flex-1 pb-4">
      {label && (
        <Text className="font-inter text-sm text-gray-700 mb-1">{label}</Text>
      )}

      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
        style={[styles.trigger, hasError && styles.triggerError]}
      >
        <Text
          className="font-inter"
          style={{ fontSize: 14, color: value ? "#111827" : "#9CA3AF" }}
        >
          {getDisplayValue() || placeholder}
        </Text>
        <Text style={{ fontSize: 16 }}>🕐</Text>
      </TouchableOpacity>

      {hasError && errorMessage ? (
        <Text className="font-inter text-red-500 text-sm pt-1">
          {errorMessage}
        </Text>
      ) : null}

      <DateTimePickerModal
        isVisible={visible}
        mode="time"
        date={getPickerDate()}
        is24Hour={use24Hour}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        isDarkModeEnabled={false}
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#fff",
  },
  triggerError: {
    borderColor: "#EF4444",
  },
});

export default TimePicker;
