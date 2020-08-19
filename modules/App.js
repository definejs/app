
/**
* App 启动类。 
* @name App
*/

const SessionStorage = require('@definejs/session-storage');
const LocalStorage = require('@definejs/local-storage');
const AppModule = require('@definejs/app-module');              //对外给页面提供的，即业务层的模块管理器。

//子模块。
const Navigator = require('./App/Navigator');
const Router = require('./App/Router');



module.exports = exports = {
    /**
    * 默认配置。
    */
    defaults: require('./App.defaults'),

    /**
    * 初始化执行环境，并启动应用程序。
    * @param {function} factory 工厂函数，即启动函数。
    */
    launch(factory) {
        const defaults = exports.defaults;
        const { name, root, seperator, navigator, view, } = defaults;

        //app 应用的名称。
        if (!name) {
            throw new Error('必须首先给应用分配一个唯一的名称，用于在存储中与其它应用区分开。');
        }

        //app 顶级模块的名称，一般为空字符串。
        if (typeof root != 'string') {
            throw new Error('应用的顶级模块名称必须为一个 string。');
        }

        //父子模块的分隔符，一般为 `/`。
        if (root.includes(seperator)) {
            throw new Error('应用的顶级模块名称不能含有父子模块的分隔符: ' + seperator);
        }

        //让 app 的名称同时用于以下模块。
        SessionStorage.defaults.name = name;
        LocalStorage.defaults.name = name;

        //扩展配置。
        Object.assign(AppModule.defaults, {
            seperator,
        });

        //先定义一个顶级的模块。
        AppModule.define(root, function ($require, $module, $exports) {
            if (navigator) {
                //此时 $exports 即为 factory 工厂函数中的第三个参数 nav。
                $exports = Navigator.create({
                    'ViewSlider': defaults.ViewSlider,
                    'id': navigator,
                    'module': $module,

                    'container': view.container,
                    'preload': view.preload,
                    'slide': view.slide,
                    'animate': view.animate,
                });
            }


            Router.bind($require, $module, $exports);

            factory && factory($require, $module, $exports);
        });

        //定义完后马上加载即可启动。
        AppModule.require(root);

    },

    /**
    * 设置视图的顶级事件路由。
    */
    route: Router.set,

    

};




