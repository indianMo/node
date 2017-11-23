'use strict';
const express = require('express');
//解析post请求体数据
const bodyParser = require('body-parser');

//文件功能增强包
const fse = require('fs-extra');
//解析上传文件的包
const formidable = require('formidable');
//引入path核心对象
const path = require('path');
//引入数据库对象
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'qiao',
  database: 'album'
});

//创建服务器
let app = express();
//配置模板引擎
app.engine('html', require('express-art-template'));

//配置路由规则
let router = express.Router();
//测试路由
router.get('/test', (req, res, next) => {
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM album_dir', function (error, results, fields) {
      //查询完毕以后，释放连接
      connection.release();
      if (error) throw error;
      res.render('test.html', {
        text: results[2].dir
      });
    });
  });
})
  .get('/', (req, res, next) => {
    //获取连接
    pool.getConnection((err, connection) => {
      //处理获取连接时的异常，比如停网了
      if (err) return next(err);
      //使用连接查询所有的album_dir所有数据
      connection.query('select * from album_dir', (error, results) => {
        //处理查询时带来的异常，比如表名错误
        if (err) return next(err);
        res.render('index.html', {
          album: results
        });
      })
    });
  })
  //显示照片列表
  .get('/showDir', (req, res, next) => {
    let dirname = req.query.dir;
    // console.log(dirname);
    pool.getConnection(function (err, connection) {
      if (err) return next(err);
      connection.query('SELECT * FROM album_file where dir = ?', [dirname], (error, results) => {
        //查询完毕以后，释放连接
        connection.release();
        if (error) return next(error);
        res.render('album.html', {
          album: results,
          dir: dirname
        });
      });
    });

  })
  //添加目录
  .post('/addDir', (req, res, next) => {
    let dirname = req.body.dirname;
    // console.log(dirname);
    pool.getConnection(function (err, connection) {
      //处理获取连接时的异常，比如停网了
      if (err) return next(err);
      connection.query('insert into album_dir values (?)', [dirname], (error, result) => {
        //查询完毕以后，释放连接
        connection.release();
        if (error) return next(error);
        //创建本地文件
        const dir = `./resource/${dirname}`;
        //确保目录文件存在
        fse.ensureDir(dir, err => {
          //重新查看相册重定向
          res.redirect('/showDir?dir=' + dirname);
        })
      });
    });
  })
  //添加照片
  .post('/addPic', (req, res, next) => {
    var form = new formidable.IncomingForm();
    let rootPath = path.join(__dirname, 'resource');
    //设置默认上传目录
    form.uploadDir = rootPath;
    //设置默认上传目录
    form.parse(req, function (err, fields, files) {
      // console.log(files);
      if (err) return next(err);
      let filename = path.parse(files.pic.path).base
      // console.log(files.pic.path);


      //移动文件
      let dist = path.join(rootPath, fields.dir, filename);
      fse.move(files.pic.path, dist, (err) => {
        if (err) return next(err);
        //file:/resource/vvvb/upload_dd10f264c02f08e9031a0bd3f7eb090a
        let db_file = `/resource/${fields.dir}/${filename}`;
        let db_dir = fields.dir;

        pool.getConnection((err, connection) => {
          //处理获取连接时的异常，比如停网了
          if (err) return next(err);
          //使用连接查询所有的album_dir所有数据
          connection.query('insert into album_file values (?,?)', [db_file, db_dir], (error, results) => {

            //查询完毕以后，释放连接
            connection.release();
            //处理查询时带来的异常，比如表名错误
            if (err) return next(err);
            //重定向到看相片的页面
            res.redirect('/showDir?dir=' + db_dir);
          })
        });

      })
    })

  })


//处理静态资源
// /public/vender/bootstrap/js/bootstrap.js
app.use('/public', express.static('./public'));
app.use('/resource', express.static('./resource'));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
///中间件执行列表
app.use(router);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.log('出错啦.-------------------------');
  console.log(err);
  console.log('出错啦.-------------------------');
  res.send(`
            您要访问的页面出异常拉...请稍后再试..
            <a href="/">去首页玩</a>
    `);
})


//开启服务器
app.listen(8888, () => {
  console.log('服务器启动了');
});