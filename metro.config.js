const { getDefaultConfig } = require('expo/metro-config'); 

 module.exports = ( () => {   
    const defaultConfig =  getDefaultConfig(__dirname);
    
      const {assetExts} = defaultConfig.resolver; 
      
    //   console.log('asseesexts : ' , assetExts)

       return {     ...defaultConfig,    
         resolver: {       
            ...defaultConfig.resolver,   

            assetExts: [...assetExts, 'bin' , 'h5'],     
        }   
        }; 
    })(); 


