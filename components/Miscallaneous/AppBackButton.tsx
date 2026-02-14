import { TouchableOpacity, View, Image, Text} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";

type Props = {
  route?: never;
  custom?: boolean;
  handleCustom?: any;
};
const AppBackButton = ({ route, custom, handleCustom }: Props) => {
  const navigation = useNavigation();
  const handleNavigation = () => {
    if (custom) {
      handleCustom();
      return;
    }

    if (route) {
      navigation.navigate(route);
    } else {
      navigation.goBack();
    }
  };
  return (
    <TouchableOpacity onPress={handleNavigation}>
      <View>
        <Image source={require("../assets/icons/back_button.png")} style={{
        }}/>
        <Text  style={{  fontSize: 24,
            fontWeight: 'bold',
            color: colors.text_title}}>Back</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AppBackButton;
