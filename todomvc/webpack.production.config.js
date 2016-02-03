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
            createFile(file, arr[0], assets[key].js);
        }


        return JSON.stringify(assets);
    }
})

var todo_config = {
    entry : {
        todoModule_replace : [
            './todoModule/index'
        ]
    }
};

var test_config = {
    entry : {
        testModule_replace : [
            './testModule/index'
        ]
    }
};

todo_config.output = test_config.output = {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js'

}
todo_config.plugins = test_config.plugins = [
    webpackAP,
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
]
todo_config.module = test_config.module = {
    loaders: [{
        test: /\.js$/,
        loaders: ['babel'],
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

module.exports = [todo_config, test_config];
