import { handleActions } from 'redux-actions';
import CommonFunc from 'utils/common-func';

const DEFAULT_STATE = {
    gender: '女',
    themeColor: '#ff85bc',
    baseInfo: {}
};

//  types
export const GENDER_INFO = 'GENDER_INFO';
export const THEME_COLOR = 'THEME_COLOR';
export const BASE_INFO = 'BASE_INFO';

//  reducer
export const userInfo = handleActions(
    {
        [GENDER_INFO](state, action) {
            state.gender = action.payload.gender;
            state.themeColor = CommonFunc.setThemeColor(action.payload.gender);
            return state;
        },
        [BASE_INFO](state, action) {
            state.baseInfo = action.payload.baseInfo;

            return state;
        }
    },
    DEFAULT_STATE
);
