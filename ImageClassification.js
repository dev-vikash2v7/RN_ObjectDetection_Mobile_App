import React, { useState  , useEffect} from 'react';
import { View, Text, Image, Button, ScrollView } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { ActivityIndicator } from 'react-native';


const ImageClassification = () => {
  const [loaded, setLoaded] = useState(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('');
  const [pickedImage, setPickedImage] = useState('');
  const [model, setModel] = useState(null);


  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
   aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setPickedImage(result.assets[0].uri);
    }
  };


  useEffect(() => {
    const load = async () => {
      await tf.ready();
      console.log('loaded tf--')
      const model =  await mobilenet.load();
      console.log('loaded mobilenet--')
      setIsTfReady(true);
      setModel(model)
    }
    load()
  }, []);

  const classifyUsingMobilenet = async () => {
    setLoaded(true)
    try {
      console.log("starting inference with picked image: " + pickedImage)

      // Convert image to tensor
      const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      const imageTensor = decodeJpeg(raw);

      console.log('image to tensor : '  , imageTensor)
      // imagetensor :  {"dataId": {"id": 146}, "dtype": "int32", "id": 146, "isDisposedInternal": false, "kept": false, "rankType": "3", "shape": [1098, 1464, 3], "size": 4822416, "strides": [4392, 3]}

      // Classify the tensor and show the result
      const prediction = await model.classify(imageTensor);
      // prediction :  [
        // {"className": "Bouvier des Flandres, Bouviers des Flandres", "probability": 0.09981340169906616}, 
        // {"className": "parallel bars, bars", "probability": 0.0763639509677887}, 
        // {"className": "military uniform", "probability": 0.07156502455472946}
      // ]


      if (prediction && prediction.length > 0) {
        // console.log('prediction : ' ,prediction)
        setResult(`Class : ${prediction[0].className}\nProbability(${prediction[0].probability.toFixed(3)}`)
      }
    } catch (err) {
      console.log(err);
    }
    setLoaded(false)

  };

  return (
    <ScrollView
    style={{
      paddingTop : 50
    }}
  >
    {isTfReady && <Button
      title="Pick an image"
      onPress={pickImage}
    /> }
    <View style={{ width: '100%', height: 20 }} />

    {!isTfReady && <Text>Loading TFJS model...</Text>}

    {isTfReady && result === '' && <Text>Pick an image to classify!</Text>}

    {pickedImage &&
    <>
    <Image
      source={{ uri: pickedImage }}
      style={{ width: 200, height: 200, margin: 40 }}
    />

{loaded ? <ActivityIndicator size={30} color={'green'}/> 
:<Button title='classfiy image' onPress={classifyUsingMobilenet} color={'green'}/>
}

</>
    }

    {result !== '' && <Text style = {{fontSize :24 , marginTop : 5 , fontWeight:'bold'} }>{result}</Text>}
  </ScrollView>
  );
};

export default ImageClassification;
