import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ViewStyle,
  View,
  StatusBar,
  KeyboardEvent,
  TextInput,
} from "react-native";

type KeyboardAvoidingLayoutProps = {
  children: ReactNode;
  keyboardVerticalOffset?: number;
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  className?: string;
  androidExtraPadding?: number;
  iosExtraPadding?: number;
};

const KeyboardAvoidingLayout: React.FC<KeyboardAvoidingLayoutProps> = ({
  children,
  keyboardVerticalOffset,
  scrollEnabled = true,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  className = "flex-1",
  androidExtraPadding = 10,
  iosExtraPadding = 10,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        
        if (Platform.OS === "android") {
          setTimeout(() => {
            const focusedInput = TextInput.State.currentlyFocusedInput();
            if (focusedInput && scrollViewRef.current) {
              focusedInput.measureInWindow((x, y, width, height) => {
                const inputBottomY = y + height;
                const keyboardTopY = e.endCoordinates.screenY;
                
                if (inputBottomY > keyboardTopY) {
                  const scrollAmount = inputBottomY - keyboardTopY + 50; 
                  scrollViewRef.current?.scrollTo({
                    y: scrollAmount,
                    animated: true,
                  });
                }
              });
            }
          }, 100);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const offset = keyboardVerticalOffset ?? Platform.select({
    ios: 0,
    android: StatusBar.currentHeight || 0,
  });

  const bottomPadding = Platform.select({
    ios: keyboardHeight > 0 ? iosExtraPadding : 0,
    android: keyboardHeight > 0 ? androidExtraPadding : 0,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={className}
      keyboardVerticalOffset={offset}
      style={{ flex: 1 }}
      enabled={Platform.OS === "ios"}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          { 
            flexGrow: 1, 
            paddingBottom: bottomPadding,
          },
          contentContainerStyle
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        scrollEnabled={scrollEnabled}
        bounces={Platform.OS === "ios"}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardDismissMode="none"
        overScrollMode="always"
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback 
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingLayout;