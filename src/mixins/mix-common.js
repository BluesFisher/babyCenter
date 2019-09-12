import wepy from 'wepy';
// import Vtoast from 'components/Vtoast/Vtoast';

export default class CommonMixin extends wepy.mixin {
    // components = {
    //     toast: Vtoast
    // };

    data = {
        pageConfig: {
            base: {},
            element: {},
            ext: {}
        }
    };

    mixShowToast(title) {
        this.$invoke('toast', 'showToast', title);
    }

    mixHideToast() {
        this.$invoke('toast', 'hideToast');
    }

    mixShowLoading() {
        this.$invoke('toast', 'showLoading', {});
    }

    mixHideLoading() {
        this.$invoke('toast', 'hideLoading', {});
    }

    mixGetApp() {
        return this.$parent ? this.$parent : this;
    }
}
