React Redux-Router Redux webpack es6&es7 兼容IE8

1. 如果你在打包时打包了jquery，请检查版本，避免2.0.0+，至少在IE8下document.implementation.createHTMLDocument 是不存在的，而新版的jquery放弃了在support.createHTMLDocument方法中的IE低版本验错代码。
2. 由于IE8是不支持某些关键字，形式诸如 a.b 和 {a : b}，尤其是default，所以可以引入 [es3ify-loader](https://github.com/sorrycc/es3ify-loader)，一个webpack的plugin去解决这个问题，
		
		test: /\.js$/,  
		loaders: ['es3ify-loader', 'babel-loader'],
		exclude: /node_modules/,
但这里可能会遇到一个坑，redux-router (尤其是诸如redux-simple-router之类的库)，因为你的webpack正常情况下会 `exclude: /node_modules/`，所以这些库并不会被处理，请自行到你的库中，比如redux-simple-router/lib/index.js，第17行`{ default: obj }` to `{ "default": obj }`,第104行 `(0, _deepEqual2.default)` to `(0, _deepEqual2["default"])`，已提交了一个[现成的库](https://www.npmjs.com/package/redux-simple-router-ie8)，如有需要可以使用  

	题外话：另一个替代方案[transform-es3-member-expression-literals](http://babeljs.io/docs/plugins/transform-es3-member-expression-literals/)建议别使用，原因hax https://phabricator.babeljs.io/T2817 已有指出
3. 	不要在你的代码中使用 export default之类的代码，但是如果你在你的reducers/index.js之类的库中有类似于 `export default rootReducer`这是redux `combineReducers`的产物,不要改成 `module.exports = rootReducer;`可能导致出错
4. 	检查你的react以及redux等库的版本，尤其是react，不要超过0.15.x，原因你懂的
			
		"react": "^0.14.2",
		"react-redux": "^4.0.0",
		"react-router": "^2.0.0-rc4",
		"redux": "^3.1.4"
5. 引入 [transform-es5-property-mutators](http://babeljs.io/docs/plugins/transform-es5-property-mutators/) 和 [transform-jscript](http://babeljs.io/docs/plugins/transform-jscript/), .babelrc配置如下
		
		{
  			"presets": ["react", "es2015" , "stage-0"],
  			"plugins": [
    			["transform-decorators-legacy","transform-es5-property-mutators","transform-				jscript"]
  			],
  			"env": {
    			"start": {
      				"presets": ["react-hmre"]
    			}
  			}
		}
里面的`transform-decorators-legacy` 是es7 [decorators模式](http://technologyadvice.github.io/es7-decorators-babel6/)的编译，如果没用到可以不加。  

6. 然后就开始加各种polyfill吧，首先加入`babel-polyfill`，建议放在webpack打包时配置，比如
		
		entry: [
    		'babel-polyfill',
    		PATHS.app,
  		]
  之后就是 `npm install --save es5-shim console-polyfill`，在你的入口文件顶部加上
  		
  		require('es5-shim');
		require('es5-shim/es5-sham');
		require('console-polyfill');
		
  参考[react-ie8](https://github.com/xcatliu/react-ie8)，
  最后引入`html5shiv`，如果你没有使用bower，此处建议你自己把其src/html5shiv.js 外包一层，使其只在IE8时运行，并在你的html head里引入这个js  
  
7. 如果你以上的都干了，并且在你的项目中用了webpack的`webpack.optimize.UglifyJsPlugin`不要使用 `screw_ie8: true`会导致错误。
		
		new webpack.optimize.UglifyJsPlugin({
      		compress: {
        		warnings: false,
        		//screw_ie8: true
      		},
      		output: {comments: false}
    	})
  
      	
8. 注意一下babel以及其plugin的版本

		babel-core 不能高于 "6.5.2",
		babel-polyfill 不能高于 "6.5.0"   
		注意 如果使用ant design 阿里的react控件，避免使用最高版本，有些并不支持ie8	
