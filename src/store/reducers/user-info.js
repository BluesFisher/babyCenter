import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    gender: '女'
};

//  types
export const GENDER_INFO = 'GENDER_INFO';

//  reducer
export const userInfo = handleActions(
    {
        [GENDER_INFO](state, action) {
            state.gender = action.payload.gender;

            return state;
        }
    },
    DEFAULT_STATE
);
