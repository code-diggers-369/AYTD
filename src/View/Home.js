import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ModalSelector from 'react-native-modal-selector';
import ytfps from 'ytfps';
import ytdl from 'react-native-ytdl';

import {useDispatch, useSelector} from 'react-redux';
import {RootToaster} from 'react-native-root-toaster';

// import Componets
import SwipableView from './SwipableView';

// etc device height and width
const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

// import actions
import {ADD_NEW_VIDEO} from '../Redux/Actions/action';

// functions
import {
  dirPermissionAndExistCheck,
  downloadableURLIsSavedToFile,
  fetchVideoInfo,
} from '../Functions/functions';
import AsyncStorage from '@react-native-community/async-storage';

const DownloadVid = async (obj, dispatch) => {
  try {
    await dirPermissionAndExistCheck();

    downloadableURLIsSavedToFile(
      'single',
      obj.url,
      obj.tittle,
      obj.id,
      obj.itag,
      obj.quality,
      dispatch,
    );
    console.log(`download started ${obj.id}`);

    // await downloadableURLIsSavedToFile(URL, tittle, id);
  } catch (err) {
    console.log(err);
  }
};

const setToStorage = async (URL, videoData, dispatch) => {
  try {
    const match = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;

    if (URL && URL.match(match)) {
      if (videoData.itag !== null) {
        await dispatch(
          ADD_NEW_VIDEO(
            videoData.tittle,
            videoData.id,
            videoData.quality,
            'single',
            videoData.thumbnail,
          ),
        );

        await DownloadVid(videoData, dispatch);
      } else {
        alert('Please Choose Quality');
      }
    } else {
      alert('Please Enter Valid Value');
    }
  } catch (err) {
    console.log(err);
  }
};

const CheckUniqId = async (videosList, newId) => {
  try {
    const ids = [];

    await videosList.filter((ls, i) => {
      if (ls.vid === newId) {
        ids.push(ls.vid);
      }
    });

    return !ids.includes(newId);
  } catch (err) {
    console.log(err.message);
  }
};

const App = ({navigation}) => {
  const dispatch = useDispatch();
  const videosList = useSelector((state) => state.videos);

  const [url, setUrl] = useState('');

  const [videoData, setVideoData] = useState({quality: 'quality', itag: null});

  const [qualityList, setQualityList] = useState([]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const fetchPlayListInfo = async (URL) => {
    try {
      const jsonData = await ytfps(URL).catch((err) => alert(err.message));

      const playlist = {
        pltittle: jsonData.title,
        id: jsonData.id,
        thumbnail: jsonData.thumbnail_url,
        length: jsonData.video_count,
        videos: jsonData.videos,
        type: 'playlist',
      };

      Alert.alert(
        playlist.pltittle,
        `Total ${playlist.length} Videos Found Download It`,
        [
          {
            text: 'Cancel',
            onPress: () => {
              setUrl('');
              console.log('Cancel Pressed');
            },
            style: 'cancel',
          },
          {
            text: 'Download',
            onPress: async () => {
              setUrl('');

              await dirPermissionAndExistCheck(playlist.pltittle);

              const isUniq = await CheckUniqId(videosList, playlist.id);

              if (isUniq) {
                await dispatch(
                  ADD_NEW_VIDEO(
                    playlist.pltittle,
                    playlist.id,
                    'hd',
                    'list',
                    playlist.thumbnail,
                  ),
                );
                var isError = false;
                for (var i = 0; i < playlist.length; i++) {
                  try {
                    const info = await ytdl.getInfo(playlist.videos[i].url);

                    var viid = await AsyncStorage.getItem('vid');

                    const setError = () => {
                      isError = true;
                    };

                    if (viid === null && isError === false) {
                      console.log('download');
                      await downloadableURLIsSavedToFile(
                        'list',
                        playlist.videos[i].url,
                        info.videoDetails.title,
                        playlist.videos[i].id,
                        'highest',
                        'hd',
                        dispatch,
                        playlist.pltittle,
                        i + 1,
                        playlist.length,
                        playlist.id,
                        setError,
                      );
                    } else {
                      console.log('pause');
                      AsyncStorage.removeItem('vid');
                      break;
                    }
                  } catch (err) {
                    console.log(err);
                  }
                }
              } else {
                alert('This Download Is Already Done Or Process');
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQualityAndData = async (URL) => {
    try {
      const matchString = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;

      if (URL && URL.match(matchString) && URL.indexOf('list') !== -1) {
        fetchPlayListInfo(URL);
        return;
      }

      if (URL && URL.match(matchString)) {
        const data = await fetchVideoInfo(URL);
        const obj = {
          ...data,
          quality: data.quality[0].qualityLabel,
          downloadPer: 0,
          itag: data.quality[0].itag,
          url: URL,
          downloaded: false,
        };

        setVideoData(obj);

        const filterQualityList = data.quality.map((ls, i) => {
          return {
            label: `${ls.qualityLabel}  (${ls.width}X${ls.height})`,
            key: i,
            itag: ls.itag,
          };
        });

        setQualityList(filterQualityList);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: 'white', flex: 1}}>
      <StatusBar hidden={true} />
      <RootToaster defaultMessage="Hello" />

      <ImageBackground
        source={require('../../assets/img/bubble.png')}
        style={style.headerBackground}>
        {/*  */}
        <View style={style.headerContainer}>
          <View style={style.headerSetting}>
            {/* <Icon name="cog" size={30} color="#fff" /> */}
          </View>
          {/*  */}
          <View style={style.textInputView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                placeholder="Enter Your URL Here"
                style={{width: width / 2}}
                value={url}
                onChangeText={(text) => {
                  if (text.length <= 0) {
                    setVideoData({quality: 'quality', itag: null});
                  }

                  setUrl(text);

                  fetchQualityAndData(text);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setUrl('');
                  setVideoData({quality: 'quality', itag: null});
                }}
                style={{marginLeft: 5}}>
                <Icon name="close" size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={{height: 30, width: 2, backgroundColor: '#218EEF'}} />

            <TouchableOpacity>
              <ModalSelector
                data={qualityList}
                onChange={(options) =>
                  setVideoData({
                    ...videoData,
                    quality: options.label,
                    itag: options.itag,
                  })
                }>
                <Text>{videoData.quality.split(' ')[0]}</Text>
              </ModalSelector>
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                onPress={async () => {
                  if (url.indexOf('list') === -1) {
                    const isUniq = await CheckUniqId(videosList, videoData.id);

                    if (isUniq) {
                      await setToStorage(url, videoData, dispatch);

                      await setUrl('');

                      await setVideoData({quality: 'quality', itag: null});
                    } else {
                      alert('This Download Is Already Done Or Process');
                    }
                  }
                }}>
                <Icon name="arrow-circle-down" size={35} color="#218EEF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/*  */}
      </ImageBackground>

      <SwipableView />
    </SafeAreaView>
  );
};

export default App;

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    height: height / 2.8,
    width: width,
    position: 'relative',
    top: -8,
  },
  headerSetting: {
    alignSelf: 'flex-end',
    padding: width / 15,
  },
  textInputView: {
    marginTop: 25,
    width: width - 40,
    borderRadius: 15,
    backgroundColor: '#fff',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
