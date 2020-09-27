import React from 'react';
import {View} from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import {useSelector} from 'react-redux';

//
import Downloading from './Downloading';
import Downloaded from './Downloaded';

export default function SwipableView() {
  const list = useSelector((state) => state.videos);

  return (
    <SwiperFlatList showPagination paginationActiveColor="#218EEF">
      <View>
        <Downloading list={list} />
      </View>
      <View>
        <Downloaded list={list} />
      </View>
    </SwiperFlatList>
  );
}
