import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {loginUser} from '../../ducks/auth';
import styles from './Auth.css';

export default class Auth extends Component {
  static propTypes = {
    location: PropTypes.object,
    isAuthenticating: PropTypes.bool.isRequired,
    error: PropTypes.string,
    authError: PropTypes.shape({
      _error: PropTypes.string,
      email: PropTypes.string,
      password: PropTypes.string
    }),
    fields: PropTypes.shape({
      email: PropTypes.object,
      password: PropTypes.object
    }),
    handleSubmit: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  render() {
    const {fields: {email, password}, handleSubmit, error, isAuthenticating, authError} = this.props;
    const localError = error || authError._error;
    return (
      <div className={styles.loginForm}>
        <h3>Login</h3>
        {localError && <span>{localError}</span>}
        <form className={styles.loginForm} onSubmit={handleSubmit(this.onSubmit)}>
          <input style={{display: 'none'}} type="text" name="chromeisabitch"/>

          <TextField
            {...email}
            type="text"
            hintText="name@email.com"
            errorText={email.touched && email.error || ''}
            floatingLabelText="Email"
            />
          <input style={{display: 'none'}} type="text" name="chromeisabitch"/>

          <TextField
            {...password}
            type="password"
            floatingLabelText="Password"
            hintText="hunter2"
            errorText={password.touched && password.error || ''}
            />

          <Link to={{pathname: '/login/lost-password', query: {e: email.value}}} className={styles.lostPassword}>
            Forgot your password?
          </Link>

          <div className={styles.loginButton}>
            <RaisedButton
              label="Login"
              secondary
              type="submit"
              disabled={isAuthenticating}
              onClick={handleSubmit(this.onSubmit)}
              />

          </div>
        </form>
      </div>
    );
  }

  onSubmit = (data, dispatch) => {
    // gotta get that redirect from props
    const redirectRoute = this.props.location.query.next || '/maps';
    return loginUser(dispatch, data, redirectRoute);
  };
}
