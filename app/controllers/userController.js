const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = (req, res) => {
  res.render('login', {title: 'Login'});
}

exports.register = (req, res) => {
  res.render('register', {title: 'Register'});
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'You email is not valid').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extensions: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'You must supply password').notEmpty();
  req.checkBody('confirm-password', 'You must supply confirmed password').notEmpty();
  req.checkBody('confirm-password', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the func from running
  }
  next();
}

exports.registration = async (req, res, next) => {
  const user = new User({email: req.body.email, name: req.body.name});
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
}

exports.account = (req, res) => {
  res.render('account', {title: 'Edit your account'});
}

exports.updateAccount = async (req, res) => {
  const updates = {name: req.body.name, email: req.body.email};
  const user = await User.findOneAndUpdate(
    { _id: req.user._id},
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Account was successfully updated');
  res.redirect('back');
}

exports.addLikeStore = async (req, res) => {
  console.log(req.params.id);
  const storeId = req.params.id;
  const user = await User.findOneAndUpdate(
    { _id: req.user._id},
    { $push: {liked: storeId} },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Store was liked');
  res.redirect(`/hearts`);
}

exports.getHearts = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id}).populate('liked');

  res.render('store', {title: 'Store', stores: user.liked});
}