const $ = require('jquery');
const Tasker = require('@definejs/tasker');
const Package = require('@definejs/package');

const name$appended = {}; //记录视图对应的 html 内容是否已附加到容器中。


function normalize(views) {
    let list = Array.isArray(views) ? views : [views];
    let all = [];

    list.forEach((item, index) => { 
        if (!item) {
            return;
        }

        if (typeof item == 'string') {
            item = {
                'view': item,
                'args': [],
            };
        }

        all.push(item);

    });

    return all;
}




module.exports = {
    /**
    * 加载多个视图。
    *   options = {
    *       container: 'body',  //视图所要附加到的容器。
    *       module: Module,     //业务层顶级的 module 对象。 即 KISP.launch() 方法中回调函数的第二个参数 `module`，用于加载视图。
    *   };
    */
    load(views, options, done) {
        let list = normalize(views);
        let $module = options.module;
        let container = options.container;

        let tasker = new Tasker(list);


        //先异步加载完所有的视图模块。
        //可能是异步，也可能是直接加载。
        tasker.on('each', function (item, index, done) {
            let name = item.view;
            let M = $module.require(name);

            //已加载过了。
            if (M) {
                done(M);
                return;
            }

            Package.load(name, function (pack) {
                if (!pack) {
                    throw new Error(`总包中不存在名为 ${name} 的配置节点。`);
                }

                let item = pack['html'] || {};
                let html = item.content;
                let appended = name$appended[name];

                //先处理 html 内容。
                if (!appended && container && html) {
                    name$appended[name] = true;
                    $(container).append(html);
                }


                //再加载 js 模块。
                //因为 js 模块可能会用到对应的 DOM 节点。
                let M = $module.require(name);

                if (!M) {
                    throw new Error(`不存在名为 ${name} 的视图模块`);
                }

                done(M);
            });

        });


        tasker.on('all', function (views) {
            done && done(...views);
        });


        tasker.parallel();
    },

};








