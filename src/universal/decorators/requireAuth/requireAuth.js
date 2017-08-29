import React, {Component, PropTypes} from 'react';
import {routeActions} from 'redux-simple-router';
import socketOptions from 'universal/utils/socketOptions';

const {push} = routeActions;

// workaround for https://github.com/rackt/redux-simple-router/issues/212
let key;
export default ComposedComponent => {
  return class RequiredAuth extends Component {
    static propTypes = {
      isAuthenticated: PropTypes.bool.isRequired,
      dispatch: PropTypes.func.isRequired,
      hasAuthError: PropTypes.bool,
      location: PropTypes.shape({
        key: PropTypes.string
      })
    };

    componentWillMount() {
      this.checkForAuth(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.checkForAuth(nextProps);
    }

    render() {
      return <ComposedComponent {...this.props}/>;
      // const {isAuthenticated} = this.props;
      // if (isAuthenticated) {
        // return <ComposedComponent {...this.props}/>;
      // }
      // return <div>Logging in...</div>;
    }

    checkForAuth(props) {
      if (__CLIENT__) {
        const {dispatch, hasAuthError, location} = props;
        const newKey = location && location.key || 'none';
        if (newKey === key) {
          return;
        }
        key = newKey;
        const authToken = localStorage.getItem(socketOptions.authTokenName);
        if (hasAuthError || !authToken) {
          dispatch(push('/login?next=%2Fmaps'));
        }
      }
    }
  };
};
