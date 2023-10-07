import { StyleSheet, Text, View } from 'react-native';
// import ImageClassification from './ImageClassification';
import MnistClassifier from './MnistClassifier';
import CropDiseasePredictionScreen from './CropDiseaseClassification';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <ImageClassification/> */}
      {/* <MnistClassifier/> */}
      <CropDiseasePredictionScreen/>
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
