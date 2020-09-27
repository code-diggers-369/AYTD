import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';

//
const {height, width} = Dimensions.get('screen');

export default function Splash() {
  const videos = useSelector((state) => state.videos);

  const dispatch = useDispatch();

  useEffect(() => {
    async function filterDownloadingData() {
      try {
        const filterData = videos.filter((ls, i) => {
          if (ls.downloaded) {
            return ls;
          }
        });

        await dispatch({type: 'REMOVE_UNDOWNLOAD_VIDEOS', data: filterData});

        await RNFetchBlob.fs.unlink(
          `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/.temp`,
        );
      } catch (err) {
        console.log(err.message);
      }
    }

    filterDownloadingData();
  }, []);

  return (
    <SafeAreaView style={style.container}>
      <StatusBar hidden={true} />

      <Image style={style.logo} source={require('../../assets/img/logo.png')} />

      <Text style={style.text}>Developed By Indian Developers 🇮🇳</Text>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: height - 300,
    width: width,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
