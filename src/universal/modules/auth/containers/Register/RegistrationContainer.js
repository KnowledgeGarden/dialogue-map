import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import Joi from 'joi';
import {parsedJoiErrors} from 'universal/utils/schema';
import {getFormState} from 'universal/redux/helpers';
import {ensureState} from 'redux-optimistic-ui';

import Register from '../../components/Register/Register';
import {authSchemaInsert} from '../../schemas/register';

// use the same form to retain form values (there's really no difference between login and signup, it's just for show)
@connect(mapStateToProps)
// must come after connect to get the path field
@reduxForm({form: 'registrationForm', fields: ['name', 'handle', 'email', 'password'], validate, getFormState})
export default class RegistrationContainer extends Component {
  static propTypes = {
    location: PropTypes.object,
    isAuthenticating: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    authError: PropTypes.shape({
      _error: PropTypes.string,
      name: PropTypes.string,
      handle: PropTypes.string,
      email: PropTypes.string,
      password: PropTypes.string
    })
  };

  render() {
    return <Register {...this.props}/>;
  }
}

function mapStateToProps(state) {
  state = ensureState(state);
  const auth = state.get('auth');
  return {
    isAuthenticated: auth.get('isAuthenticated'),
    isAuthenticating: auth.get('isAuthenticating'),
    authError: auth.get('error').toJS()
  };
}

function validate(values) {
  const results = Joi.validate(values, authSchemaInsert, {abortEarly: false});
  return parsedJoiErrors(results.error);
}

