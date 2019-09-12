import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    hospitalIdToName: {}
};

//  types
export const HOSPITAL_ID_INFO = 'HOSPITAL_ID_INFO';

//  reducer
export const commonInfo = handleActions(
    {
        [HOSPITAL_ID_INFO](state, action) {
            state.hospitalIdToName = action.payload.hospitalIdToName;

            return state;
        }
    },
    DEFAULT_STATE
);
