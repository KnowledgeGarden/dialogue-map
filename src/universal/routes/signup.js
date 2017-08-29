import {requireNoAuth} from './requireNoAuth';

export default () => {
  return {
    onEnter: requireNoAuth,
    path: 'signup',
    getComponent: async (location, cb) => {
      const component = await System.import('universal/modules/auth/containers/Register/RegistrationContainer');
      cb(null, component);
    }
  };
};
