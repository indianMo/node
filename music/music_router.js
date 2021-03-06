'use strict';
const express = require('express');
const musicController = require('./controllers/musicController');
//配置路由规则 开始
let router = express.Router();
router.get('/add-music', musicController.showAddMusic)//添加音乐
  .get('/index-music', musicController.showListMusic) //显示音乐列表
//配置路由规则 结束

module.exports = router;