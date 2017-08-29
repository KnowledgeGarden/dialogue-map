import BacksideDriver from './BacksideDriver';
import config from './backside.config';
import {
  StatusCodeError,
  ResponseMessageError
} from './BacksideErrors';

export default class AuthDriver extends BacksideDriver {
  // Methods correspond with verbs in src/main/java/org/topicquests/backside/servlet/apps/auth/api/IAuthMicroformat.java

  // TODO(wenzowski): is this the right way to use the 'Auth' verb?
  async login(email, password, query = {}) {
    const endpoint = this.basicAuthEndpoint(email, password, query);
    const body = await this.get(endpoint);
    if (typeof body.rMsg !== 'string') throw new ResponseMessageError(body.rMsg);
    if (!body.cargo) return [body.rToken, {}];
    const {uEmail, uName, uFullName, uRole} = body.cargo;
    console.log("AAA "+JSON.stringify(body.cargo));
    return [
      body.rToken,
      {
        email: uEmail,
        handle: uName,
        name: uFullName,
        role: (uRole[0] || '').split(',').map(str => str.trim()).filter(str => str)
      }
    ];
  }

  // TODO(wenzowski): fix BacksideServlet so logging out a user twice does not result in a 500 response
  async logout(sToken, query = {}) {
    const endpoint = this.endpoint('/auth/', {verb: 'LogOut', sToken, ...query});
    const body = await this.get(endpoint).catch(error => {
      if (!error instanceof StatusCodeError) throw error;
    });
    if (body && body.rMsg === 'ok') return true;
    return false;
  }

  async isHandleAvailable(uName) {
    if (!uName) throw new ReferenceError('Missing required argument uName');
    const endpoint = this.endpoint('/auth/', {verb: 'Validate', uName});
    const body = await this.get(endpoint);
    if (body.rMsg === 'not found') return false;
    if (body.rMsg === 'ok') return true;
    throw new ResponseMessageError(body.rMsg);
  }

  async isEmailAvailable(uEmail) {
    if (!uEmail) throw new ReferenceError('Missing required argument uEmail');
    const endpoint = this.endpoint('/auth/', {verb: 'ExstEmail', uEmail});
    const body = await this.get(endpoint);
    if (body.rMsg === 'not found') return true;
    if (body.rMsg === 'ok') return false;
    throw new ResponseMessageError(body.rMsg);
  }
}

export const auths = new AuthDriver(config);
