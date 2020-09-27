import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Avatar} from 'react-native-elements';
import * as Progress from 'react-native-progress';

//
const {height, width} = Dimensions.get('screen');

export default function ListItem({data}) {
  return (
    <View>
      {data ? (
        <View style={style.listContainer}>
          <View>
            <Avatar
              rounded
              source={{
                uri: data.thumbnail,
              }}
              size="medium"
              overlayContainerStyle={{borderWidth: 1, borderColor: '#000'}}
            />
          </View>

          {/*  */}
          <View style={style.detailsContainer}>
            <View style={style.headPercentageContainer}>
              <View>
                {data.vidtype === 'single' ? (
                  <Text>
                    {data.tittle.substring(0, 23)}
                    ...
                  </Text>
                ) : (
                  <Text>
                    {`(${
                      data.complete !== undefined ? data.complete : 'getting'
                    }) ${data.tittle.substring(0, 23)}`}
                    ...
                  </Text>
                )}
              </View>
              <View>
                <Text>
                  {data.downloadPer !== 0 ? data.downloadPer + '%' : 'fetching'}
                </Text>
              </View>
            </View>
            <View style={style.progressLine}>
              <Progress.Bar
                progress={data.downloadPer / 100}
                borderColor="grey"
                borderWidth={0}
                height={10}
                unfilledColor="#aaaaaa"
                color="#00D455"
                width={width - 100}
              />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const style = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
  },
  detailsContainer: {
    marginLeft: 5,
  },
  headPercentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
  },
});
