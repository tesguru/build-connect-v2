import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type PaymentStatus = "pending_verification" | "verified" | "rejected" | string;

interface PaymentLogCardProps {
  amount: number;
  currency: string;
  paymentDate: string;
  reference: string;
  note?: string;
  status: PaymentStatus;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending_verification: {
    label: "Pending",
    color: "#d97706",
    bg: "#fef3c7",
    Icon: Clock,
  },
  verified: {
    label: "Verified",
    color: "#16a34a",
    bg: "#dcfce7",
    Icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fee2e2",
    Icon: XCircle,
  },
};

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const PaymentLogCard = ({
  amount,
  currency,
  paymentDate,
  reference,
  note,
  status,
  createdAt,
}: PaymentLogCardProps) => {
  const config = statusConfig[status] ?? {
    label: status,
    color: "#6b7280",
    bg: "#f3f4f6",
    Icon: AlertCircle,
  };

  const { label, color, bg, Icon } = config;

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        {/* Amount */}
        <Text className="font-interbold text-xl text-gray-900">
          {formatCurrency(amount, currency)}
        </Text>

        {/* Status Badge */}
        <View
          style={{ backgroundColor: bg }}
          className="flex-row items-center px-3 py-1 rounded-full gap-1"
        >
          <Icon size={13} color={color} />
          <Text style={{ color }} className="text-xs font-intersemibold ml-1">
            {label}
          </Text>
        </View>
      </View>

      {/* Reference */}
      <View className="flex-row items-center mb-1">
        <Text className="text-xs text-gray-400 font-inter">Ref: </Text>
        <Text className="text-xs text-gray-600 font-intersemibold" numberOfLines={1}>
          {reference}
        </Text>
      </View>

      {/* Note */}
      {note ? (
        <Text className="text-xs text-gray-500 font-inter mb-2" numberOfLines={1}>
          {note}
        </Text>
      ) : null}

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 mt-1">
        <Text className="text-xs text-gray-400 font-inter">
          Payment Date: <Text className="text-gray-600">{formatDate(paymentDate)}</Text>
        </Text>
        <Text className="text-xs text-gray-400 font-inter">{formatDate(createdAt)}</Text>
      </View>
    </View>
  );
};

export default PaymentLogCard;