/*
    mapStateToProps:
        import { connect } from 'wepy-redux'; // 引入redux
        @connect({
            userInfo(state) {
                return state.loginInfo.userInfo;
            }
        })
        e.g: console.log(this.userInfo)

    mapActionToMethod:
        import { connect } from 'wepy-redux';
        import { USER_INFO } from 'store/reducers/login-info';
        @connect({}, { USER_INFO })
        e.g: this.methods.USER_INFO({ userInfo: {} });
*/

import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import rootReducer from './reducers';

export default function configStore() {
    const store = createStore(rootReducer, applyMiddleware(promiseMiddleware));
    return store;
}
