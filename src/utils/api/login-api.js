import ApiFunc from './api-func';
import CommonFunc from 'utils/common-func';
import { loginApi } from './api-group';

export const wxLogin = async () => {
    try {
        const { res } = await CommonFunc.wepyFunc('login');
        console.log(res);

        if (res.code) {
            const resLog = await ApiFunc.post(loginApi.getWxAuthInfo, {
                code: res.code
            });

            return resLog.retcode === 0 && resLog.data;
        }
    } catch (e) {
        console.log('登录失败！' + JSON.stringify(e));
        return CommonFunc.commonResult();
    }
};
