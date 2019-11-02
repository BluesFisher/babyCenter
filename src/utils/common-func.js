/* eslint-disable no-plusplus */
import wepy from 'wepy';
import {
  G_CONFIG
} from 'utils/config';
import dayjs from 'dayjs';

const md5 = require('./md5.js');
const TIMESTACK = [];
let requestTask = {};

// uuid params
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
let byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

const CommonFunc = {
  //  common func
  toMd5: password => {
    return md5.hexMD5(password);
  },

  getParamsStr: obj => {
    if (obj) {
      let paramArr = Object.keys(obj)
        .filter((k, v) => obj[k])
        .map(k => `${k}=${encodeURIComponent(obj[k])}`);
      return paramArr.join('&');
    }
    return '';
  },

  deepCopy: obj => {
    let result = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') {
          result[key] = CommonFunc.deepCopy(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  },

  getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  },

  serialize: obj => {
    let str =
      '?' +
      Object.keys(obj)
      .reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(obj[k]));
        return a;
      }, [])
      .join('&');
    return str;
  },

  preDealRes: (res, callback, returnValue = []) => {
    if (!res) return returnValue;
    const dataTemp = res.data.data || res.data.infos;
    if (res.code === 0 && dataTemp) {
      const temp =
        typeof dataTemp === 'string' ? JSON.parse(dataTemp) : dataTemp;
      return callback ? callback(temp) : temp;
    }
    return returnValue;
  },

  getSMSCode: async (phoneNum, onlyCheckPhone = false, isDebug = true) => {
    if (!/^1\d{10}$/.test(phoneNum)) {
      return CommonFunc.commonResult('手机号格式错误');
    }

    if (onlyCheckPhone) {
      return {
        code: 0
      };
    }

    // if (!isDebug) {
    //     const res = await requestVerifyCode(phoneNum);
    //     if (res.code === 0) {
    //         wepy.showToast({
    //             title: '发送成功',
    //             duration: 2000
    //         });
    //         return {
    //             code: 0,
    //             data: ''
    //         };
    //     } else {
    //         return CommonFunc.commonResult(res.msg || '发送失败');
    //     }
    // }

    return {
      code: 0,
      data: `${Math.random()}`.substring(3, 7)
    };
  },

  findItemByKey: (itemGroup = [], key = '', aimValue = '') => {
    if (!key || !(itemGroup instanceof Array) || !aimValue) return {};

    const len = itemGroup.length;

    for (let i = 0; i < len; i++) {
      if ('' + aimValue === itemGroup[i][key]) {
        return {
          index: i,
          item: itemGroup[i]
        };
      }
    }

    return {};
  },

  bytesToUuid: buf => {
    let uuid = '';

    for (let i = 0; i < 16; i++) {
      uuid += byteToHex[buf[i]];
      if ([3, 5, 7, 9].indexOf(i) !== -1) {
        uuid += '-';
      }
    }

    uuid = uuid.substr(0, uuid.length - 1) + 'w'; // mark uuid for wxa

    return uuid;
  },

  uuid: () => {
    let i = 0;
    let b = [];
    let node = _nodeId;
    let clockseq = _clockseq;

    if (node == null || clockseq == null) {
      let seedBytes = `${Math.random()}`.substr(3, 19);
      if (node == null) {
        node = _nodeId = [
          seedBytes[0] | 0x01,
          seedBytes[1],
          seedBytes[2],
          seedBytes[3],
          seedBytes[4],
          seedBytes[5]
        ];
      }
      if (clockseq == null) {
        clockseq = _clockseq =
          ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
      }
    }

    let msecs = new Date().getTime();
    let nsecs = _lastNSecs + 1;
    let dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
    if (dt < 0) {
      clockseq = (clockseq + 1) & 0x3fff;
    }
    if (dt < 0 || msecs > _lastMSecs) {
      nsecs = 0;
    }
    if (nsecs >= 10000) {
      throw new Error("uuid: Can't create more than 10M uuids/sec");
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    msecs += 12219292800000;

    // `time_low`
    let tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = (tl >>> 24) & 0xff;
    b[i++] = (tl >>> 16) & 0xff;
    b[i++] = (tl >>> 8) & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    let tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    b[i++] = (tmh >>> 8) & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = ((tmh >>> 24) & 0xf) | 0x10; // include version
    b[i++] = (tmh >>> 16) & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = (clockseq >>> 8) | 0x80;
    b[i++] = clockseq & 0xff;
    for (let n = 0; n < 6; ++n) {
      b[i + n] = node[n];
    }

    return CommonFunc.bytesToUuid(b);
  },

  commonResult: (msg = '微信发送请求接口失败') => ({
    code: -1,
    msg
  }),

  debounce: (fn, wait = 500) => {
    let timeout = null;
    return () => {
      if (timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
    };
  },

  // page func
  async getStorage(key = 'rawData') {
    const {
      code,
      res
    } = await CommonFunc.wepyFunc('getStorage', {
      key
    });

    return code === 0 ? JSON.parse(res.data) : {};
  },

  getCurrentPagePath: (filter = true) => {
    // eslint-disable-next-line no-undef
    let pages = getCurrentPages();
    return [pages.length - 1].route.replace(filter ? /pages\//gi : '', '');
  },

  getPageObj: (route = '') => {
    // eslint-disable-next-line no-undef
    return getCurrentPages().find(v => {
      return v.route === route;
    });
  },

  setThemeColor(gender = '男') {
    return gender === '男' ? '#80d7fe' : '#ff85bc';
  },

  backToPage: objIn => {
    let obj = !objIn ? {} : objIn;
    // eslint-disable-next-line no-undef
    let pages = getCurrentPages();
    let delta = obj.delta || -2;
    if (obj.beforeBack) {
      obj.beforeBack(pages[pages.length + delta]);
    }
    wepy.navigateBack({
      delta
    });
  },

  showTip: (
    title = '操作失败',
    image = '/assets/images/common/failure_toast.png',
    duration = 2000
  ) => {
    const iconShow = image.startsWith('/') ? {
      image
    } : {
      icon: image
    };
    wepy.showToast({
      ...iconShow,
      title,
      duration
    });
  },

  onShareAppMessage: (res, path = '/pages/index') => {
    return {
      title: '电子健康卡数据助手',
      path
    };
  },

  dealHospitalSelectGroup(
    currentHospitalRegion = [],
    hospitalSelectGroup = []
  ) {
    let filterHospital = [];
    // 当前区域没有医院
    if (currentHospitalRegion.length === 0) {
      filterHospital = ['--'];
    } else if (currentHospitalRegion.length === 1) {
      // 当前区域显示全部医院
      filterHospital = hospitalSelectGroup;
    } else {
      // 显示所属当前区域医院
      filterHospital = hospitalSelectGroup.filter(
        item => currentHospitalRegion.indexOf(item) !== -1
      );
    }

    return filterHospital;
  },

  //  webView func
  gotoWebViewPage: url => {
    wepy.navigateTo({
      url: '/pages/webView?url=' + encodeURIComponent(url)
    });
  },

  timeStart: () => {
    // eslint-disable-next-line no-undef
    let pages = getCurrentPages();
    // 用$wxpage.route避免返回页面取不到正确页面问题
    let path = this.$wxpage.route || pages[pages.length - 1].route;
    TIMESTACK[path] = {
      start: +new Date()
    };
  },

  timeEnd: () => {
    // eslint-disable-next-line no-undef
    let pages = getCurrentPages();
    let path = this.$wxpage.route || pages[pages.length - 1].route;

    if (TIMESTACK[path] && TIMESTACK[path].start) {
      TIMESTACK[path].end = +new Date();
      let time = TIMESTACK[path].end - TIMESTACK[path].start;
      let url = G_CONFIG.timeReport.url;
      let proj = G_CONFIG.timeReport.proj;
      let uri = encodeURIComponent(`${G_CONFIG.domain}/${path}.html`);
      url = `${url}?proj=${proj}&uri=${uri}&ispage=1&time=${time}&action=onload&starttime=${TIMESTACK[path].start}&endtime=${TIMESTACK[path].end}`;
      let header = {
        'content-type': 'application/json'
      };
      wepy.request({
        url,
        header
      });
    }
  },

  // wx/wepy func
  wepyFunc: (funcName = '', option = {}, completeFunc) => {
    const taskTag =
      dayjs().format('YYYYMMDD-hhmmss') +
      `${Math.random()}`.substring(3, 7);

    return new Promise((resolve, reject) => {
      option.success = res => {
        resolve({
          code: 0,
          res
        });
      };
      option.fail = res => {
        const err = {
          code: -1,
          res
        };
        resolve(err);
      };
      option.complete = res => {
        delete requestTask[taskTag];
        completeFunc && completeFunc(res);
      };
      if (wepy[funcName]) {
        if (funcName === 'request') {
          requestTask[taskTag] = wx[funcName](option);
        } else {
          wepy[funcName](option);
        }
      }
    });
  },

  deleteRequestTask: () => {
    const timer = setTimeout(() => {
      timer && clearTimeout(timer);
      Object.keys(requestTask).map(key => {
        requestTask[key].abort();
      });
      requestTask = {};
    }, 4000);
  },

  setCookies: (type = 'cookies', res) => {
    if (type === 'cookies' && res && res.header) {
      let cookies =
        res.header['set-cookie'] || res.header['Set-Cookie'] || '';
      if (cookies) {
        wepy.setStorageSync('cookies', cookies);
      }
    } else if (type !== 'cookies') {
      wepy.setStorageSync(type, res);
    }
  },

  setWritePhotos: async callback => {
    let res = await CommonFunc.wepyFunc('openSetting');
    if (res.code === 0) res = await CommonFunc.wepyFunc('getSetting');
    if (!res.res.authSetting['scope.writePhotosAlbum']) {
      CommonFunc.showTip('授权失败');
    } else {
      callback && callback();
    }
  },

  setWxAuth: async (authScope = 'scope.writePhotosAlbum') => {
    try {
      let res = await CommonFunc.wepyFunc('getSetting');
      if (!res.res.authSetting[authScope]) {
        res = await CommonFunc.wepyFunc('authorize', {
          scope: authScope
        });
      }
      return res;
    } catch (error) {}
  }
};

export default CommonFunc;
