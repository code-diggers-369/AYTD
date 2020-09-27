import React from 'react';
import {
  View,
  ScrollView,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

//
const {height, width} = Dimensions.get('screen');

//
import ListItem from './ListItem';

export default function Downloading({list}) {
  const dispatch = useDispatch();
  const videos = useSelector((state) => state.videos);

  const deleteVideoFromList = async (target) => {
    try {
      Alert.alert('Confirm Delete', 'Are You Sure To Delete?', [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Cancel Pressed');
          },
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            await AsyncStorage.setItem('vid', target.vid);
            if (target.vidtype === 'list') {
              const path = `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/${target.tittle}`;
              if (RNFetchBlob.fs.exists(path)) {
                await RNFetchBlob.fs.unlink(path);
              }
            } else {
              const path = `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/.temp/`;
              await RNFetchBlob.fs.ls(path).then((data) => {
                data.forEach(async (ls) => {
                  if (ls.indexOf(target.vid) !== -1) {
                    await RNFetchBlob.fs.unlink(path + ls);
                  }
                });
              });
            }

            await dispatch({type: 'ERROR', vid: target.vid});
          },
          style: 'cancel',
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <Text style={{textAlign: 'center'}}>
        <Icon name="download" size={20} /> Downloading
      </Text>
      <ScrollView>
        {/*  */}

        {list ? (
          list.map((ls, i) => {
            if (!ls.downloaded) {
              return (
                <TouchableOpacity
                  key={i}
                  onLongPress={() => deleteVideoFromList(ls)}>
                  <ListItem data={ls} />
                </TouchableOpacity>
              );
            }
          })
        ) : (
          <View />
        )}

        {/*  */}
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: 900,
  },
});
