### 工程目的
> wxa_init用于小程序项目的开发，使得所有新建小程序使用统一的开发框架，使开发标准化，降低维护成本

### 工程主要结构
1、wepy.config.js：应用配置入口，已经做了基本配置，不能随意变更   
2、.eslintrc.js：eslint检查配置入口，根据前端代码检查规范进行了配置，不能随意变更   
3、src/assetes：静态资源目录，包括css静态样式、images静态图片、js第三方库文件
4、src/components：公共组件库，目前包括Empty、Vtoast、BaseChart    
5、src/mixins：全局minxins，目前做了基本的mixin配置    
6、src/pages：主页面文件，目录根据路由划分，不对应路由的，不能单独建立文件或文件夹   
7、src/store：Redux状态管理入口，包括Redux配置，reducers、action、type配置
8、src/utils：公共函数模块，目前包括api接口请求函数（api-func.js），api接口对象配置入口（api-group.js），公用函数（common-func.js），全局配置文件（config.js），页面创建高阶函数（create-page.js）  

#### 构建流程

```
# 安装依赖
$ tnpm install

# 本地开发环境
$ npm run dev
生成dist，将其导入微信开发者工具，进行同步开发

# 打包
$ npm run build
生成dist，将其导入微信开发者工具，检查无误后进行代码上传
```

