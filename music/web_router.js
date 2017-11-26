'use strict';
const express = require('express');
const userController = require('./controllers/userController');
const musicController = require('./controllers/musicController');
// 4:处理请求
//配置路由规则 开始
let router = express.Router();
router.get('/test', userController.doTest)
  //检查用户是否存在
  .post('/check-user', userController.checkUser)
  //检查邮箱和用户
  .post('/do-register', userController.doRegister)
  //用户登录
  .post('/do-login', userController.doLogin)
  //添加音乐
  .post('/add-music', musicController.addMusic)
  //编辑
  .put('/update-music', musicController.update)
  //删除音乐
  .delete('/del-music', musicController.del)
  //退出登录
  .get('/logout', userController.logout)


//配置路由规则 结束

module.exports = router;