import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity , Alert , ScrollView  , ActivityIndicator, TextInput} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO , decodeJpeg } from "@tensorflow/tfjs-react-native";


const CropDiseasePredictionScreen = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Ready tf setup and load custom tf models
  useEffect(() => {
    const load = async () => {

      try{
        await tf.ready();
        console.log('successfully loaded tensroflow')
        
        const modelJson = require('./assets/models/artifacts/model.json');

        const modelWeights = [];
        modelWeights.push(require('./assets/models/model_weights_1.bin'));
        modelWeights.push(require('./assets/models/model_weights_2.bin'));

        const model = await tf.loadLayersModel(bundleResourceIO(modelJson , ...modelWeights));
    
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
  
  const cropsData =  [
    {label : 'Rice' ,value: 'rice',},
    { label : 'Wheat' ,value: 'wheat' },
    { label : 'Potato' , value: 'potato' },
    { label : 'Corn' , value: 'corn' },
  ]



  // Function to handle image selection from the gallery
  const handleGalleryPress = async () => {
    
    // get media permission
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage('Permission to access media library is required!');
        return;
      } 
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
  if (!result.canceled) {
    setSelectedImage(result.assets[0]);
  }
};



  // Function to handle image capture from the camera
  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      setErrorMessage('Permission to access camera was denied');
      return
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
};


/////////////////////////////////////////////
async function predict_disease() {

    // transform local image to base64
      const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;

      const raw = new Uint8Array(imgBuffer)
      const imageTensor = decodeJpeg(raw);

      //resize the image
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224 ]).toFloat();
      
      //normalize;
      const scalar = tf.scalar(255)
      const tensorScaled = resized.div(scalar)

     
      //final shape of the rensor
      const img = tf.reshape(tensorScaled, [1,224,224 , 3])
      
      console.log("tensorScaled.shape : " , tensorScaled.shape)
      console.log("resized.shape : " , resized.shape)
      console.log("grayscaleImage.shape : " , grayscaleImage.shape)
      console.log("img.shape : " , img.shape)

      const predictions = model.predict(img);
      const disease = predictions.argMax(1).dataSync()[0];
  
  return disease
  }


// send request to server
const handleSubmit = async () =>{

  setIsLoading(true)

  const {uri } = selectedImage

  try {
    const disease = await predict_disease() ;
  }
  catch(e){
console.log('error ; ' , e)
  }
 
 
  setIsLoading(false)
}




  return (

    <View style={styles.container}>

  <ScrollView>



      {/* Dropdown to select crop */}
      <View style={styles.selectView}>

         <Text style={[styles.labelText , {marginVertical : 10}]}>Select Crop Type : </Text> 

         <TextInput  value={selectedCrop} onChangeText={ (t) => setSelectedCrop(t)}  style = {{borderWidth : 0.5 , borderColor :'black' , padding : 3}}/>
      </View> 

      <View style={styles.imageSelectionView}>

        <Text style={ styles.labelText} > Select Diseased {selectedCrop} Image :   </Text>

      <View style={styles.imageOptions}>
       <View style = {{alignItems :'center' }}>
            <TouchableOpacity onPress={handleCameraPress}>
           <Text style={styles.optionText}>Open Camera</Text>
             </TouchableOpacity>
       </View> 

         <View style = {{alignItems :'center'}}>
           <TouchableOpacity onPress={handleGalleryPress}>
             <Text style={styles.optionText}>Open Gallery</Text>
           </TouchableOpacity>
         </View>
      </View>
      </View>
{/* } */}




     {/* Display the selected image */}
      {selectedImage && (
        <View>
       <Text style={styles.selectedValue}>Selected Crop: {selectedCrop}</Text>

        <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
        </View>
      )}

{/* Button to predict */}
{isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : 
      <Button
      style = {styles.submitBtn}
     title="Predict Disease"
        onPress={ handleSubmit}
         disabled={!selectedImage || !selectedCrop} />
}
{errorMessage &&
              <ErrorPopup message={errorMessage} onClose={()=>setErrorMessage('')} />
            }
</ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal : 10,
    paddingTop : 20
  },
  instructionView: {
borderBottomWidth : 0.5 ,
borderBottomColor : 'gray',
paddingBottom : 15 
  },

  instructionBox: {
    fontSize: 12,
    fontWeight : '400',
    backgroundColor : 'lightgreen',
    padding : 5 ,
    borderRadius:5
  },
  instruction:{
    fontSize: 12,
    fontWeight: '400',
    marginVertical : 1 
  },

  labelText : { 
    fontWeight : 'bold',
    marginBottom : 5,
    textTransform:'capitalize',
    fontSize : 16,
    color:'red',
    textAlign:'center',
    textDecorationLine :'underline'
  },

  dropdown :{
marginLeft : 5,
  },

  
  selectView: {
    paddingBottom : 10 ,
  },

  selectedValue: {
    fontSize: 18,
    marginTop: 12,
    fontWeight : 'bold',
    textTransform:'capitalize',
    borderBottomColor : 'gray',
    paddingBottom : 10 ,
  },


  imageSelectionView:{
    marginTop : 2,
    borderBottomWidth : 0.3 , 
    borderBottomColor : 'gray',
    paddingBottom : 10 ,
    paddingTop : 5 ,
  }
    ,
  
    imageOptions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
      marginTop : 18,
    },
    optionText: {
      fontSize: 16,
      color: 'black',
      textDecorationLine:'underline',
      fontWeight : 'bold'
  
    },
    selectedImage: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
      marginBottom: 20,
      marginTop : 12,
      alignSelf:'center',
      borderRadius:10,
      borderColor:'black',
      borderWidth:0.5
    },
    submitBtn:{
    
    }
});

export default CropDiseasePredictionScreen;

