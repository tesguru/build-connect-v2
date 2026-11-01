import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron.configure({
    name: 'MyApp',
    host: 'localhost', // your computer's IP, needed for a physical phone
  })
    .useReactNative({
      networking: true,
      errors: true,
      log: true,
    })
    .connect();
}
