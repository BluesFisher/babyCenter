import wepy from 'wepy';
import {
  G_CONFIG,
  MINIID,
  ISDEMO
} from '../config';
import CommonFunc from '../common-func';

const Raven = require('assets/js/raven-weapp-wepy');
const DOMAIN = G_CONFIG.domain;

const getCommonHeader = () => ({
  'content-type': 'application/json', // 默认值
  cookie: wepy.getStorageSync('cookies') || '',
  miniid: MINIID
});

const ApiFunc = {
  getUrl: url => `${DOMAIN}${url}`,

  http: async (url = '', option = {}) => {
    const opionSend = {
      ...option,
      url: url.startsWith('http') ? url : ApiFunc.getUrl(url),
      header: {
        ...getCommonHeader(),
        adtag: (wepy.$instance && wepy.$instance.globalData.adtag) || '',
        isdemo: ISDEMO ? 1 : null,
        requestid: CommonFunc.uuid()
      }
    };

    try {
      const {
        res
      } = await CommonFunc.wepyFunc(
        'request',
        opionSend,
        res => CommonFunc.setCookies('cookies', res)
      );

      if (res.statusCode === 200) {
        if (res.data.code === 4011) {
          wepy.showToast({
            title: '登录状态失效，请重新登录',
            icon: 'none',
            mask: true,
            duration: 2000
          });
        } else {
          return res.data;
        }
        return;
      }
      Raven.captureMessage(new Error(JSON.stringify(res)));
      return {
        code: -1,
        msg: res.msg || '微信发送请求接口失败'
      };
    } catch (error) {
      Raven.captureMessage(new Error(JSON.stringify(error)));
      wepy.showToast({
        title: '错误提示：网络异常',
        icon: 'none',
        mask: true,
        duration: 20000
      });
      return error;
    }
  },

  post: async (url = '', data = {}) =>
    await ApiFunc.http(url, {
      method: 'post',
      data
    }),

  get: async (url = '', data = {}) =>
    await ApiFunc.http(url + CommonFunc.serialize(data), {
      method: 'get'
    }),

  upload: (url = '', data = {}) => {
    let header = {
      ...getCommonHeader(),
      'content-type': 'multipart/form-data' // 默认值
    };
    var backUploadStartTime = +new Date();

    return new Promise((resolve, reject) => {
      wepy.uploadFile({
        url: this.getUrl(url),
        header,
        filePath: data.tmpFileUrl || '',
        name: 'idCard',
        success: res => {
          console.log('图片上传成功');
          console.log(
            `图片上传所用时间：${+new Date() - backUploadStartTime}`
          );
          let data = {};
          try {
            data = JSON.parse(res.data);
          } catch (e) {
            console.log(e.message || 'error');
            Raven.captureMessage(new Error(JSON.stringify(e)));
          }
          resolve(data);
        },
        fail(info) {
          console.log('图片上传失败', info);
          if (typeof info === 'object') {
            Raven.captureMessage(new Error(JSON.stringify(info)));
          }
          resolve({
            code: -1,
            msg: '图片上传失败'
          });
        }
      });
    });
  }
};

export default ApiFunc;
