import ytdl from 'react-native-ytdl';
import RNFetchBlob from 'rn-fetch-blob';
import {PermissionsAndroid} from 'react-native';
import {RNFFmpeg} from 'react-native-ffmpeg';
import {Toast} from 'react-native-root-toaster';
import AsyncStorage from '@react-native-community/async-storage';

//
//
//

const fetchVideoInfo = async (URL) => {
  try {
    const info = await ytdl.getInfo(URL);
    const tittle = await info.videoDetails.title;
    const id = await info.videoDetails.videoId;

    const qualityList = [];
    const pixels = [];

    const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');

    const thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;

    //
    await videoFormats.map((list) => {
      if (!pixels.includes(list.qualityLabel) && list.container === 'mp4') {
        qualityList.push({
          qualityLabel: list.qualityLabel,
          itag: list.itag,
          height: list.height,
          width: list.width,
        });
        pixels.push(list.qualityLabel);
      }
    });

    return {
      tittle,
      id,
      url: URL,
      quality: qualityList,
      thumbnail: thumbnail,
    };
  } catch (err) {
    console.log(err);
  }
};

const ffmpeg = async (
  path,
  tittle,
  id,
  audioExtention,
  videoExtention,
  quality,
  dispatch,
  type,
  pltittle,
  index,
  totalVidInList,
  playlistId,
) => {
  try {
    tittle = tittle.replace(/\||\?|\\|\/|\:|\*|"|\<|\>/g, ' ');
    pltittle = pltittle
      ? pltittle.replace(/\||\?|\\|\/|\:|\*|"|\<|\>/g, ' ')
      : null;

    const newPath = `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/`;

    const pathWithTitle =
      type === 'single'
        ? `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/${tittle} (${quality}).mp4`
        : `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/${pltittle}/${index}-${tittle} (${quality}).mp4`;

    const rnmpeg = await RNFFmpeg.execute(
      `-i ${path + 'video.' + videoExtention} -i ${
        path + 'audio.' + audioExtention
      } -strict -2 -c copy -map 0:v:0 -map 1:a:0 ${newPath + id + '.mp4'}`,
    );
    console.log(rnmpeg.rc);

    //
    await RNFetchBlob.fs.unlink(
      newPath + `/.temp/${id}video.${videoExtention}`,
    );
    await RNFetchBlob.fs.unlink(
      newPath + `/.temp/${id}audio.${audioExtention}`,
    );

    await RNFetchBlob.fs.mv(newPath + id + '.mp4', pathWithTitle);

    //
    if (type === 'single') {
      await dispatch({
        type: 'PROGRESS',
        progress: 100,
        vid: id,
        downloaded: true,
        path: pathWithTitle,
        vidtype: type,
      });
    } else {
      if (index != totalVidInList) {
        await dispatch({
          type: 'PROGRESS',
          progress: 0,
          vid: playlistId,
          path: '',
          vidtype: type,
        });
      } else {
        await dispatch({
          type: 'PROGRESS',
          progress: 100,
          vid: playlistId,
          path: `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/${pltittle}`,
          downloaded: true,
          complete: totalVidInList + '/' + totalVidInList,
          vidtype: type,
        });
      }
    }

    Toast.show(`Complete Downloading ${tittle}`);
  } catch (err) {
    type === 'single'
      ? await dispatch({type: 'ERROR', vid: id})
      : await dispatch({type: 'ERROR', vid: playlistId});
    console.log(err);
  }
};

const downloadableURLIsSavedToFile = async (
  type,
  URL,
  tittle,
  id,
  itag,
  quality,
  dispatch,
  pltittle,
  index,
  totalVidInList,
  playlistId,
  setError,
) => {
  try {
    console.log('Download has started');

    if (id !== undefined) {
      const path = `${RNFetchBlob.fs.dirs.SDCardDir}/AYTD/.temp/${id}`;

      const downloadVideoURLs = await ytdl(URL, {
        quality: itag,
      });

      const downloadAudioURLs = await ytdl(URL, {
        quality: 'highestaudio',
        filter: 'audioonly',
      });

      Toast.show(`Download Started = ${tittle}`, 3000);

      //
      await downloadURLsToFile(
        downloadVideoURLs,
        path,
        id,
        'video',
        dispatch,
        type,
        playlistId,
        async (progress) => {
          var filterProgress = progress.toFixed(2);
          type === 'single'
            ? await dispatch({
                type: 'PROGRESS',
                progress: filterProgress,
                vid: id,
                downloaded: false,
                path: '',
                vidtype: 'single',
              })
            : await dispatch({
                type: 'PROGRESS',
                progress: filterProgress,
                vid: playlistId,
                downloaded: false,
                path: '',
                vidtype: 'list',
                complete: index + '/' + totalVidInList,
              });
          console.log(
            'video download progress',
            'id=',
            id,
            filterProgress,
            '%',
          );
        },
        setError,
      ).then(async (videoExtention) => {
        await downloadURLsToFile(
          downloadAudioURLs,
          path,
          id,
          'audio',
          type,
          dispatch,
          playlistId,
          async (progress) => {
            var filterProgress = progress.toFixed(2);

            console.log(
              'audio download progress',
              'id=',
              id,
              filterProgress,
              '%',
            );
          },
          setError,
        ).then(async (audioExtention) => {
          if (videoExtention || audioExtention !== 'plain') {
            await ffmpeg(
              path,
              tittle,
              id,
              audioExtention,
              videoExtention,
              quality,
              dispatch,
              type,
              pltittle,
              index,
              totalVidInList,
              playlistId,
            );
          } else {
            Toast.show(`Error To Fetch ${tittle}`);
          }
        });
      });
    }
  } catch (err) {
    type === 'single'
      ? await dispatch({type: 'ERROR', vid: id})
      : await dispatch({type: 'ERROR', vid: playlistId});
    Toast.show(`${err} ${tittle} `, 3000);
    console.log(err);
  }
};

const downloadURLsToFile = (
  URLs,
  path,
  id,
  type,
  vidtype,
  dispatch,
  playlistId,
  progressCallback,
  setError,
) =>
  new Promise(async (resolve, reject) => {
    var extns = '';
    path = path + type;
    for (let i = 0; i < URLs.length; i++) {
      let {url, headers} = URLs[i];

      try {
        const fileAlreadyExists = await RNFetchBlob.fs.exists(path);
        if (fileAlreadyExists) {
          await RNFetchBlob.fs.unlink(path);
        }

        // const res = await RNFetchBlob.config({
        //   path,
        //   overwrite: false,
        // })
        //   .fetch('GET', url, headers)
        //   .progress((received, total) => {
        //     if (progressCallback) {
        //       progressCallback((received * 100) / total);
        //     }
        //   })
        //   .catch((err) => {
        //     Toast.show(err);
        //     console.error(`Could not save:"${path}" Reason:`, err);
        //   });

        const res = RNFetchBlob.config({
          path,
          overwrite: false,
          fileCache: true,
        }).fetch('GET', url, headers);

        res.progress(async (received, total) => {
          if (progressCallback) {
            progressCallback((received * 100) / total);
          }

          var keyy = await AsyncStorage.getItem('vid');

          if (keyy === id || keyy === playlistId) {
            res.cancel(async () => {
              await AsyncStorage.removeItem('vid');

              setError();

              reject('Delete');
            });
          }
        });

        res
          .then(async (respns) => {
            const contentType = respns.respInfo.headers['Content-Type'];
            if (contentType) {
              const extension = contentType.split('/')[1];
              extns = extension;
              path = `${path}.${extension}`;
              await RNFetchBlob.fs.mv(respns.path(), path);
            }
            console.log('The file is saved to:', path);

            resolve(extns);
          })
          .catch((err) => console.log(err));

        // setTimeout(() => {
        // res1.cancel(() => {
        //   reject('delete');
        //   console.log('cancellll');
        // });
        // }, 5000);

        // .progress((received, total) => {
        //   if (progressCallback) {
        //     progressCallback((received * 100) / total);
        //   }
        // })
        // .catch((err) => {
        //   Toast.show(err);
        //   console.error(`Could not save:"${path}" Reason:`, err);
        // });

        // const contentType = res.respInfo.headers['Content-Type'];
        // if (contentType) {
        //   const extension = contentType.split('/')[1];
        //   extns = extension;
        //   path = `${path}.${extension}`;
        //   await RNFetchBlob.fs.mv(res.path(), path);
        // }
        // console.log('The file is saved to:', path);
      } catch (e) {
        console.error(e);

        vidtype === 'single'
          ? await dispatch({type: 'ERROR', vid: id})
          : await dispatch({type: 'ERROR', vid: playlistId});
        reject(e);
      }
    }
    // resolve(extns);
  });

const dirPermissionAndExistCheck = async (tittle) => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Allow Storage Permission',
        message: 'Allow To Store Video',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const path = RNFetchBlob.fs.dirs.SDCardDir + `/AYTD/${tittle}`;

      const path2 = RNFetchBlob.fs.dirs.SDCardDir + '/AYTD/.temp';

      if (tittle) {
        RNFetchBlob.fs
          .exists(path)
          .then((exist) => {
            if (!exist) {
              RNFetchBlob.fs.mkdir(path);

              console.log('directory created');
            }
          })
          .catch((err) => console.log(err.message));
      }
      RNFetchBlob.fs
        .exists(path2)
        .then((exist) => {
          if (!exist) {
            RNFetchBlob.fs.mkdir(path2);
            console.log('directory created');
          }
        })
        .catch((err) => console.log(err.message));

      console.log('allow');
    } else {
      console.log('denided');
    }
  } catch (err) {
    console.log(err.message);
  }
};

export {
  downloadableURLIsSavedToFile,
  dirPermissionAndExistCheck,
  ffmpeg,
  fetchVideoInfo,
};
