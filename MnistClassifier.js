import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { View, Text, Image, Button, ScrollView } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import { bundleResourceIO , decodeJpeg } from "@tensorflow/tfjs-react-native";


const MnistClassifier = () => {
    
    const [predictedDigit, setPredictedDigit] = useState('');
    const [loaded, setLoaded] = useState(null);
    const [isTfReady, setIsTfReady] = useState(false);
    const [pickedImage, setPickedImage] = useState('');
    const [model, setModel] = useState(null);


 
  useEffect(() => {
    const load = async () => {

      try{
        await tf.ready();
        console.log('successfully loaded tensroflow')
        
        const modelJson = require('./assets/mnist_model/artifacts/model.json');
        const modelWeights = await require('./assets/mnist_model/artifacts/group1-shard1of1.bin')

        const model = await tf.loadLayersModel(bundleResourceIO(modelJson , modelWeights));
    
        console.log('successfully loaded Mnist Model Model')
        
        setIsTfReady(true);
        setModel(model);
      }
  
      catch(e){
            console.log('eererere' , e)
      }
    }
      load()
  }, []);



  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
   aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };

    async function classifyDigit() {

    setLoaded(true)
    try{

      // transform local image to base64
        const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
            encoding: FileSystem.EncodingType.Base64,
          });
    
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;

        const raw = new Uint8Array(imgBuffer)
        const imageTensor = decodeJpeg(raw);

        //resize the image
        const resized = tf.image.resizeBilinear(imageTensor, [28, 28 ]).toFloat();
        
        //normalize;
        const scalar = tf.scalar(255)
        const tensorScaled = resized.div(scalar)

        const grayscaleImage = tf.image.rgbToGrayscale(tensorScaled);

        
        //final shape of the rensor
        const img = tf.reshape(grayscaleImage, [1,28,28])
        
        console.log("tensorScaled.shape : " , tensorScaled.shape)
        console.log("resized.shape : " , resized.shape)
        console.log("grayscaleImage.shape : " , grayscaleImage.shape)
        console.log("img.shape : " , img.shape)

        const predictions = model.predict(img);
        const predictedDigit = predictions.argMax(1).dataSync()[0];
    
        setPredictedDigit(predictedDigit)
    }
    catch(e){
    console.log('error : ' , e)
    }
    setLoaded(false)
    }



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

    {isTfReady && predictedDigit === '' && <Text>Pick an image to get digit prediction !</Text>}

    {pickedImage &&
    <>
    <Image
      source={{ uri: pickedImage }}
      style={{ width: 200, height: 200, margin: 40 }}
    />

{loaded ? <ActivityIndicator size={30} color={'green'}/> 
:<Button title='classfiy image' onPress={classifyDigit} color={'green'}/>
}

</>
    }
    {predictedDigit !== '' && <Text style = {{fontSize :24 , marginTop : 5 , fontWeight:'bold'} }>{predictedDigit}</Text>}
  </ScrollView>
  );
};

export default MnistClassifier;
