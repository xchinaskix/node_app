const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return
    }
    req.flash('error', 'You should be logged in to do it');
    res.redirect('/login');
}

exports.forgot = async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        req.flash('error', 'No account with that email exist');
        return res.redirect('/login');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpired = Date.now() + 3600000 // 1 hour from now

    await user.save();
    const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `You have been emailed a password reset link ${resetUrl}`);
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordToken: {$gt: Date.now() }
    })

    if (!user) {
        req.flash('error', 'Reset token is invalid or has expired');
        return res.redirect('/login');
    }

    res.render('reset', {title: 'Reset your password'});
}

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['confirm-password']) {
        next();
        return;
    }

    req.flash('error', 'passwords do now match');
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordToken: {$gt: Date.now() }
    })

    if (!user) {
        req.flash('error', 'Reset token is invalid or has expired');
        return res.redirect('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpired = undefined;
    user.resetPasswordToken = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'your password was successfully changed');
    res.redirect('/');
}