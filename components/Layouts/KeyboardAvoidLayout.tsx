import React, { ReactNode } from "react";
import {
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type KeyboardAvoidingLayoutProps = {
  children: ReactNode;
  keyboardVerticalOffset?: number; // kept for compatibility, no longer needed
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  className?: string;
  androidExtraPadding?: number;
  iosExtraPadding?: number;
};

const KeyboardAvoidingLayout: React.FC<KeyboardAvoidingLayoutProps> = ({
  children,
  scrollEnabled = true,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  className = "flex-1",
  androidExtraPadding = 90,
  iosExtraPadding = 10,
}) => {
  const bottomOffset = Platform.select({
    ios: iosExtraPadding,
    android: androidExtraPadding,
    default: iosExtraPadding,
  });

  return (
    <View className={className} style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        bottomOffset={bottomOffset}
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        scrollEnabled={scrollEnabled}
        bounces={Platform.OS === "ios"}
        nestedScrollEnabled={true}
        keyboardDismissMode="none"
        overScrollMode="always"
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default KeyboardAvoidingLayout;
