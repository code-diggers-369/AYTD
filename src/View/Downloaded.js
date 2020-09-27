import React from 'react';
import {
  View,
  ScrollView,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {openFileChooser} from 'react-native-send-intent';
import {useDispatch} from 'react-redux';
//
const {height, width} = Dimensions.get('screen');

//
import ListItem from './ListItem';

export default function Downloading({list}) {
  const dispatch = useDispatch();
  return (
    <SafeAreaView style={style.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 10,
        }}>
        <View />

        <Text style={{textAlign: 'center'}}>
          <Icon name="check" size={20} /> Completed
        </Text>

        <TouchableOpacity
          onPress={async () =>
            await dispatch({type: 'REMOVE_ALL_DOWNLOADED_FILES'})
          }>
          <Icon name="trash" size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/*  */}
        {list ? (
          list.map((ls, i) => {
            if (ls.downloaded) {
              return (
                <View key={i}>
                  {ls.vidtype === 'single' ? (
                    <TouchableOpacity
                      onPress={() => {
                        openFileChooser(
                          {
                            subject: 'video',
                            fileUrl: ls.path,
                            type: 'video/mp4',
                          },
                          'Open Video With',
                        );
                      }}>
                      <ListItem data={ls} />
                    </TouchableOpacity>
                  ) : (
                    <ListItem key={i} data={ls} />
                  )}
                </View>
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
    // backgroundColor: 'lightblue',
    height: 900,
  },
});
