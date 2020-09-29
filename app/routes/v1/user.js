'use strict';

const router = require('express').Router();
const api = require('../../apis').v1.user;
const { asyncWrapper } = require('../../../libs/wrapper');
const { auth } = require('../../../middleware');

router.patch('/', auth, asyncWrapper(api.change));
router.get('/detail', auth, asyncWrapper(api.getDetail));

module.exports = router;
