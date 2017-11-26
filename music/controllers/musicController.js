'use strict'
//引入配置对象
const config = require('../config');
const db = require('../models/db');
//解析文件上传
const formidable = require('formidable');
//引入核心对象
const path = require('path');

/**
 * 添加音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.addMusic = (req, res, next) => {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(config.rootPath, 'public/files');
  // console.log(form.uploadDir);
  form.parse(req, function (err, fields, files) {
    if (err) return next(err);
    let datas = [fields.title, fields.singer, fields.time];
    let sql = 'insert into musics (title,singer,time,';
    let params = '(?,?,?';
    if (files.file) {
      //获取文件名
      let filename = path.parse(files.file.path).base;
      datas.push(`/public/files/${filename}`);
      sql += 'file,';
      params += ',?';
    }
    if (files.filelrc) {
      //获取文件名
      let lrcname = path.parse(files.filelrc.path).base;
      //如果上传了文件
      datas.push(`/public/files/${lrcname}`);
      sql += 'filelrc,';
      params += ',?';
    }
    params += ',?)';
    sql += 'uid) values';
    //用户的id
    datas.push(req.session.user.id);
    db.q(sql + params, datas, (err, data) => {
      res.json({
        code: '001',
        msg: '添加音乐成功'
      })
    })
  })
}

/**
 * 更新音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.update = (req, res, next) => {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(config.rootPath, 'public/files');
  form.parse(req, function (err, fields, files) {
    if (err) return next(err);
    let datas = [fields.title, fields.singer, fields.time];
    let sql = 'update musics set title=?,singer=?,time=?,';
    // let params = '(?,?,?';
    if (files.file) {
      //获取文件名
      let filename = path.parse(files.file.path).base;
      datas.push(`/public/files/${filename}`);
      sql += 'file=?,';
      // params += ',?';
    }
    if (files.filelrc) {
      //获取文件名
      let lrcname = path.parse(files.filelrc.path).base;
      //如果上传了文件
      datas.push(`/public/files/${lrcname}`);
      sql += 'filelrc=?';
      // params += ',?';
    }
    // params += ',?';
    sql += 'where id=?'
    //用户的id
    datas.push(fields.id);
    db.q(sql, datas, (err, data) => {
      res.json({
        code: '001',
        msg: '更新音乐成功'
      })
    })
  })
}

/**
 * 删除音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.del = (req, res, next) => {
  //获取用户id
  let userid = req.session.user.id;
  //接受参数
  let musicId = req.query.id;
  //删除数据
  db.q('delete from musics where id = ? and uid = ? ', [musicId, userid], (err, result) => {
    if (err) return next(err);
    if (result.affectedRows == 0) {
      //歌曲不存在
      return res.json({
        code: '002',
        msg: '歌曲不存在'
      })
    }
    //删除成功
    res.json({
      code: '001',
      msg: '删除成功'
    })
  })
}

/**
 * 添加音乐
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showAddMusic = (req, res, next) => {
  res.render('add.html');
}
/**
 * 音乐列表
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showListMusic = (req, res, next) => {
  let userId = req.session.user.id;
  //以用户id作为查询条件查询音乐表
  db.q('select * from musics where uid = ?', [userId], (err, musics) => {
    res.render('index.html', {
      //循环，给每个元素加一个索引，利用模板引擎的index属性+1
      musics, //musics:musics ES6简写
      // user:req.session.user
    })
  })
}