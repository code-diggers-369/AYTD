const ADD_NEW_VIDEO = (tittle, vid, quality, vidtype, thumbnail) => {
  return {
    type: 'ADD_NEW_VIDEO',
    tittle,
    vid,
    quality: quality,
    thumbnail: thumbnail,
    vidtype: vidtype,
  };
};

const removeFromList = () => {};

export {ADD_NEW_VIDEO};
