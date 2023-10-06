import { StyleSheet, Text, View } from 'react-native';
import ImageClassification from './ImageClassification';

export default function App() {
  return (
    <View style={styles.container}>
      <ImageClassification/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
