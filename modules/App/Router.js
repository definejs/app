
const $Object = require('@definejs/object');
const name$factory = {};


//示例解释：
/*
definejs.route('User', function (require, module, exports, User) {
    //以下两种写法是等价的。
    //如果是写法一，则 definejs 内部也会转换成写法二。
    //写法一简单明了，但写法二功能更自由、丰富。
    //一般情况下用写法一，必要时可用写法二。

    //写法一。
    return {
        'login': function () { },
        'logout': function () { },
    };

    //写法二。
    User.on({
        'login': function () { },
        'logout': function () { },
    });
});
*/

/**
* 路由。
*/
module.exports = {

    /**
    * 设置路由。
    * @param {string} name 路由的名称。
    * @param {function} factory 路由处理函数。
    *   也可以是一个导出对象。
    */
    set(name, factory) {
        if (name$factory[name]) {
            throw new Error(`重复定义的路由器: ${name}`);
        }

        name$factory[name] = factory;
    },

    /**
    * 绑定全部路由。
    */
    bind($require, $module, $exports) {

        let all = $Object.map(name$factory, function (name, factory) {

            return function (M) {
                let event$fn = factory($require, $module, $exports, M);

                if ($Object.isPlain(event$fn)) {
                    M.on(event$fn);
                }
            };
        });

        $module.bind(all);

        return all;
    },
};




