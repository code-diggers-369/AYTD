var initialState = {
  videos: [],
};

const Reducers = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_NEW_VIDEO':
      return {
        videos: [
          ...state.videos,
          {
            tittle: action.tittle,
            vid: action.vid,
            downloadPer: 0,
            downloaded: false,
            quality: action.quality,
            thumbnail: action.thumbnail,
            vidtype: action.vidtype,
            complete: 'getting',
          },
        ],
      };

    case 'PROGRESS':
      const filter = state.videos.map((list, i) => {
        if (list.vid === action.vid) {
          return {
            ...list,
            downloadPer: action.progress,
            downloaded: action.downloaded,
            path: action.path,
            vidtype: action.vidtype,
            complete: action.complete,
          };
        } else {
          return list;
        }
      });

      return {
        videos: filter,
      };

    case 'ERROR':
      const newData = state.videos.filter((list, i) => {
        if (list.vid !== action.vid) {
          return list;
        }
      });

      return {
        videos: newData,
      };

    case 'REMOVE_UNDOWNLOAD_VIDEOS':
      return {
        videos: action.data,
      };

    case 'REMOVE_ALL_DOWNLOADED_FILES':
      const imcompleteDownload = state.videos.filter((list, i) => {
        if (list.downloaded !== true) {
          return list;
        }
      });

      return {
        videos: imcompleteDownload,
      };

    default:
      return {
        ...state,
      };
  }
};
export default Reducers;
