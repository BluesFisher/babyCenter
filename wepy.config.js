const path = require('path');
var prod = process.env.NODE_ENV === 'production';

module.exports = {
    wpyExt: '.wpy',
    eslint: true,
    cliLogs: !prod,
    build: {
        web: {
            htmlTemplate: path.join('src', 'index.template.html'),
            htmlOutput: path.join('web', 'index.html'),
            jsOutput: path.join('web', 'index.js')
        }
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
            assets: path.join(__dirname, 'src/assets'),
            components: path.join(__dirname, 'src/components'),
            mixins: path.join(__dirname, 'src/mixins'),
            pages: path.join(__dirname, 'src/pages'),
            store: path.join(__dirname, 'src/store'),
            utils: path.join(__dirname, 'src/utils')
        },
        aliasFields: ['wepy', 'weapp'],
        modules: ['node_modules']
    },
    compilers: {
        less: {
            compress: prod
        },
        babel: {
            sourceMap: prod,
            presets: ['env'],
            plugins: [
                'transform-class-properties',
                'transform-decorators-legacy',
                'transform-object-rest-spread',
                'transform-export-extensions'
            ]
        }
    },
    plugins: {},
    appConfig: {
        noPromiseAPI: ['createSelectorQuery']
    }
};

if (prod) {
    // 压缩less
    //   module.exports.compilers['less'] = { compress: true }

    // 压缩js
    module.exports.plugins = {
        uglifyjs: {
            filter: /\.js$/,
            config: {}
        },
        imagemin: {
            filter: /\.(jpg|png|jpeg)$/,
            config: {
                jpg: {
                    quality: 40
                },
                png: {
                    quality: 40
                }
            }
        },
        replace: [
            {
                filter: /config\.js$/,
                config: {
                    find: /GR_ENV/g,
                    replace: function(matchs, word) {
                        return process.env.NODE_ENV;
                    }
                }
            },
            {
                filter: /config\.js$/,
                config: {
                    find: /GR_APP/g,
                    replace: function(matchs, word) {
                        return process.env.WXA_APP;
                    }
                }
            }
        ]
    };
}
