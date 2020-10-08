'use strict';

const router = require('express').Router();
const api = require('../../apis').v1.company;
const { asyncWrapper } = require('../../../libs/wrapper');
const { auth } = require('../../../middleware');

router.get('/:id', auth, asyncWrapper(api.get));
router.get('/:id/detail', auth, asyncWrapper(api.getDetail));
router.post('/', auth, asyncWrapper(api.create));
router.patch('/:id', auth, asyncWrapper(api.change));
router.patch('/:id/document', auth, asyncWrapper(api.changeDocument));
router.patch('/:id/certification', auth, asyncWrapper(api.changeCertification));

module.exports = router;
