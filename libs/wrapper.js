'use strict';

exports.asyncWrapper = func => async (req, res, next) => {
  try {
    await func(req, res);
    next();
  } catch (e) {
    if (next) next(e);
  }
};

exports.wrapper = func => (req, res, next) => {
  try {
    func(req, res);
    next();
  } catch (e) {
    if (next) next(e);
  }
};
