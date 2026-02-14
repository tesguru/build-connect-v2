import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, TextInputKeyPressEventData, NativeSyntheticEvent } from "react-native";

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  color?: string;
  inactiveColor?: string;
  size?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value = "",
  onChange = () => {},
  color = "black",
  inactiveColor = "#d1d5db",
  size = 55,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (value && value.length === length) {
      setOtp(value.split(""));
    }
  }, [value, length]);

  const handleChange = (text: string, index: number) => {
    const cleanText = text.slice(-1); 
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (cleanText && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={otp[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            textAlign: "center",
            fontSize: 20,
            fontFamily:"Inter_400Regular",
            fontWeight: "400",
            borderColor: otp[index] ? color : inactiveColor,
            color: otp[index] ? color : "black",

          }}
        />
      ))}
    </View>
  );
};

export default OTPInput;
