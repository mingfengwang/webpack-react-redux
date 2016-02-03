var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var webpackAP = new AssetsPlugin({
    processOutput: function (assets) {
        var fs = require('fs');
        createFile = function (file, moudleName, replaceFileName) {
            fs.readFile(file, "utf8", function(err, data){
                if(err)
                    console.log("读取文件fail " + err);
                else{
                    var finalData = data.replace(/\_replace/g, replaceFileName);

                    fs.writeFile(path.join('dist', moudleName + "_index.html"), finalData, function(err){
                        if(err)
                            console.log("fail " + err);
                        else
                            console.log("写入文件ok");
                    });

                }
            });
        }
        for (var key in assets) {
            var arr = key.split("_"),
                file;
            if (arr.length > 1) {
                file = path.join(arr[0], "index.html");
            } else {
                file = "index.html";
            }
            console.log(file);
            createFile(file, arr[0], assets[key].js);
        }


        return JSON.stringify(assets);
    }
})

var todo_config = {
    entry : {
        todoModule_replace : [
            'webpack/hot/only-dev-server',

            // 'webpack-hot-middleware/client',
            './todoModule/index'
        ]
    },
    output : {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.[hash].js',
        publicPath: '/dist/'

    }
};

var test_config = {
    entry : {
        testModule_replace : [
            'webpack/hot/only-dev-server',
            './testModule/index'
        ]
    },
    output : {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.[hash].js',
        publicPath: '/dist/'

    }
};

todo_config.devtool = test_config.devtool = 'cheap-module-eval-source-map';

todo_config.plugins = test_config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    webpackAP
]
todo_config.module = test_config.module = {
    loaders: [{
        test: /\.js$/,
        loaders: ['react-hot','babel'],
        exclude: /node_modules/,
        include: __dirname
    }, {
        test: /\.css?$/,
        loaders: ['style', 'raw'],
        include: __dirname
    },{
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000'
    },{
        test: /\.scss$/,
        loader: 'style!css!sass'
    },{
        test: /\.woff$/,
        loader: 'url?limit=100000'
    }]
}

// add the current module to the exports, the multiple will lead to webpack dev server Maximum call stack size exceeded
module.exports = [todo_config];

// When inside Redux repo, prefer src to compiled version.
// You can safely delete these lines in your project.
var reduxSrc = path.join(__dirname, '..', '..', 'src');
var reduxNodeModules = path.join(__dirname, '..', '..', 'node_modules');
var fs = require('fs');
if (fs.existsSync(reduxSrc) && fs.existsSync(reduxNodeModules)) {
  // Resolve Redux to source
  module.exports.resolve = { alias: { 'redux': reduxSrc } };
  // Compile Redux from source
  module.exports.module.loaders.push({
    test: /\.js$/,
    loaders: ['babel'],
    include: reduxSrc
  });
}


