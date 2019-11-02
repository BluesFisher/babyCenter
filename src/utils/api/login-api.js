import ApiFunc from './api-func';
import CommonFunc from 'utils/common-func';
import {
  loginApi
} from './api-group';

export const wxLogin = async () => {
  try {
    const {
      res
    } = await CommonFunc.wepyFunc('login');
    console.log(res);

    if (res.code) {
      const resLog = await ApiFunc.post(loginApi.getWxAuthInfo, {
        code: res.code
      });

      return resLog.code === 0 && resLog.data;
    }
  } catch (e) {
    console.log('登录失败！' + JSON.stringify(e));
    return CommonFunc.commonResult();
  }
};

export const getUserInfo = async (openId = '') => {
  if (!openId) {
    return CommonFunc.commonResult();
  }

  try {
    const res = await ApiFunc.post(loginApi.getUserInfo, {
      id: openId
    });

    console.log(res);
  } catch (error) {
    console.log('获取用户信息失败！' + JSON.stringify(e));
    return CommonFunc.commonResult();
  }
};

export const addUser = async (params) => {
  const {
    openId,
    unionId,
    userName
  } = params;

  try {
    const res = await ApiFunc.post(loginApi.addUser, {
      openId,
      unionId,
      userName,
      authorise: '1'
    });

    console.log(res);
  } catch (error) {
    console.log('鉴权失败！' + JSON.stringify(e));
    return CommonFunc.commonResult();
  }
};
