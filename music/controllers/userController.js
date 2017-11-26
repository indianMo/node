'use strict'
const db = require('../models/db');
  let userController = {

  } 
/**
 * 测试
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.doTest = (req, res, next) => {
  db.q('select * from  album_dir', [], (err, data) => {
    if (err) return next(err);
    res.render('test.html', {
      text: data[0].dir
    })
  })
}
/**
 * 检查用户名
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.checkUser = (req, res, next) => {
  let username = req.body.username;
  db.q('select * from users where username = ?', [username], (err, data) => {
    if (err) return next(err);
    if (data.length == 0) {
      res.json({
        code: '001',
        msg: '可以注册'
      })
    } else {
      res.json({
        code: '002',
        msg: '用户名已存在'
      })
    }
  })
}
/**
 * 注册
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.doRegister = (req, res, next) => {
  let userData = req.body;
  let username = userData.username;
  let password = userData.password;
  let v_code = userData.v_code;
  let email = userData.email;

  let regex = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
  if (!regex.test(email)) {
    //不满足邮箱字符串
    res.json({
      code: '004',
      msg: '邮箱不合法'
    })
    return;
    //验证用户名或者邮箱是否存在
  }
  db.q('select * from users where username = ? or email = ? ', [username, email], (err, data) => {
    if (err) return next(err);
    if (data.length != 0) {
      //有可能邮箱存在，有可能用户名存在
      let user = data[0];
      if (user.email == email) {
        return res.json({
          code: '002',
          msg: '邮箱已注册'
        })
      } else if (user.username == username) {
        return res.json({
          code: '002',
          msg: '用户名已注册'
        })
      }
    } else {
      db.q('insert into users (username,password,email) values (?,?,?)', [username, password, email], (err, result) => {
        if (err) return next(err);
        // console.log(data);
        res.json({
          code: '001',
          msg: '注册成功'
        })
      })
    }
  })
}
/**
 * 登录
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.doLogin = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let remember_me = req.body.remember_me;
  db.q('select * from users where username = ?', [username], (err, data) => {
    if (err) return next(err);
    if (data.length == 0) {
      console.log(data);
      return res.json({
        code: '002',
        mag: '用户名或者密码不正确'
      })
    }
    let dbuser = data[0];
    if (dbuser.password != password) {
      // console.log(dbuser.password);
      // console.log(password);
      return res.json({
        code: '002',
        msg: '用户名和密码不正确'
      })
    }
    req.session.user = dbuser;
    res.json({
      code: '001', msg: '登录成功'
    })
  })
}
/**
 * 退出登录
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.logout = (req, res, next) => {
  req.session.user.null;
  res.json({
    code: '001',
    msg: '退出成功'
  })
}

/**
 * 显示登录页
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.showLogin = (req, res, next) => {
  res.render('login.html');
}

/**
 * 显示注册页
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.showRegister = (req, res, next) => {
  res.render('register.html');
}
//向外导出
module.exports = userController;