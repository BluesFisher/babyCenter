const ISDEMO = true; // 允许使用MOCK帐号
const APP = 'GR_APP';
const ENV = 'GR_ENV';
const DEFAULT_APP = 'baby';
const DEFAULT_ENV = 'dev';
const COMMON_MTA = {
  appID: '500689324',
  eventID: '500689325',
  autoReport: false,
  statParam: true,
  ignoreParams: [],
  statPullDownFresh: true,
  statShareApp: true,
  statReachBottom: true
};

const DefaultConfig = {
  dev: {
    domain: 'http://192.168.0.106:8080', // 'http://49.235.100.196:3000',
    mta: COMMON_MTA,
    raven: {
      url: 'https://24fc07355e784c17ba2bce08a5fc8c8d@sentry.io/1526234',
      config: {
        release: '1.1.0',
        environment: 'dev'
      }
    },
    timeReport: {
      url: 'https://common.sparta.html5.qq.com/reporter/time',
      proj: 'b61abe8131f74cb09330266225caba4f'
    }
  },
  production: {
    domain: 'https://health.tengmed.com/data',
    mta: COMMON_MTA,
    raven: {
      url: 'https://24fc07355e784c17ba2bce08a5fc8c8d@sentry.io/1526234',
      config: {
        release: '1.1.0',
        environment: 'production'
      }
    },
    timeReport: {
      url: 'https://common.sparta.html5.qq.com/reporter/time',
      proj: 'b61abe8131f74cb09330266225caba4f'
    }
  }
};

const MiniIds = {
  baby: 'wx4ca43a4bd45566da' // APPID
};

const Secet = {
  baby: 'ca702aa60a55f173db44c4df1060ce01'
};

const COMMON_AUTH_HOMEPAGE = [{
  name: '昨日概览',
  code: 'dataAnalysis'
},
{
  name: '用卡分析',
  code: 'cardUseAnalysis'
}
];

const AuthList = {
  baby: {
    // 无权限者
    0: {
      homePage: [...COMMON_AUTH_HOMEPAGE]
    },
    // 超级管理员
    1: {
      homePage: [...COMMON_AUTH_HOMEPAGE]
    },
    // 卫计委公众号开发商
    1001: {
      homePage: [...COMMON_AUTH_HOMEPAGE]
    },
    // 医院公众号开发商
    1002: {
      homePage: [...COMMON_AUTH_HOMEPAGE]
    },
    // 卫计委管理者
    1003: {
      homePage: [{
        name: '数据排行',
        code: 'dataRank'
      },
        ...COMMON_AUTH_HOMEPAGE
      ]
    },
    // 医院管理者
    1004: {
      homePage: [...COMMON_AUTH_HOMEPAGE]
    }
  }
};

const ExtraMiniPro = {
  baby: {
    feedback: {
      appId: 'wx8abaf00ee8c3202e',
      extraData: {
        id: '74564',
        customData: {}
      },
      showText: '意见与反馈'
    }
  }
};

const configMaker = {};

configMaker.baby = function () {
  this.getConfig = () => {
    return DefaultConfig[ENV] || DefaultConfig[DEFAULT_ENV];
  };
  this.getMiniId = () => {
    return MiniIds[APP] || MiniIds[DEFAULT_APP];
  };
  this.getSecet = () => {
    return Secet[APP] || Secet[DEFAULT_APP];
  };
  this.getAuthList = () => {
    return AuthList[APP] || AuthList[DEFAULT_APP];
  };
  this.getExtraMiniPro = () => {
    return ExtraMiniPro[APP] || ExtraMiniPro[DEFAULT_APP];
  };
};

configMaker.factory = function () {
  return new (configMaker[APP] || configMaker[DEFAULT_APP])();
};

const configer = configMaker.factory();
const G_CONFIG = configer.getConfig();
const MINIID = configer.getMiniId();
const AUTH_LIST = configer.getAuthList();
const EXTRA_MINI_PRO = configer.getExtraMiniPro();

export {
  G_CONFIG,
  ENV,
  MINIID,
  ISDEMO,
  AUTH_LIST,
  EXTRA_MINI_PRO
};
