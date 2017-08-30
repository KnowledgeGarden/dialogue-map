import BacksideDriver, {parseRangeQuery} from './BacksideDriver';
import config from './backside.config';

export default class UserDriver extends BacksideDriver {
  // methods below correspond with verbs in
  //src/main/java/org/topicquests/backside/servlet/apps/usr/api/IUserMicroformat.java

  // TODO(wenzowski): try logging in before registering
  // TODO(wenzowski): ensure RemoveInvite is called
  async register(user, query = {}) {
    if (!user) throw new ReferenceError('missing user object');
    if (typeof user !== 'object') throw new TypeError('user is not an object');
    if (!user.fullName || !user.handle || !user.email || !user.password) {
      throw new ReferenceError('missing required user attribute');
    }
    const endpoint = this.endpoint('/user/', {
      verb: 'NewUser',
      uFullName: user.fullName,
      uName: user.handle,
      uEmail: user.email,
      uPwd: new Buffer(user.password).toString('base64'),
      uAvatar: user.avatar,
      uGeoloc: user.geoLocation && [user.geoLocation.latitude, user.geoLocation.longitude].join('|'),
      uHomepage: user.homepage,
      ...query
    });
    const body = await this.post(endpoint);
    if (body && body.rMsg === 'ok' && body.rToken) return body.rToken;
    return '';
  }

  async list(query = {from: 0, count: 50}) {
    const [from, count] = parseRangeQuery(query);
    return this.getCargo('/user/', {verb: 'ListUsers', ...query, from, count});
  }

  async fetchByEmail(uEmail, query = {}) {
    return this.getCargo('/user/', {verb: 'GetUser', uEmail, ...query});
  }

  // methods below correspond with verbs in src/main/java/org/topicquests/backside/servlet/apps/admin/api/IAdminMicroformat.java

  async remove(uName, query = {}) {
    const endpoint = this.endpoint('/user/', {verb: 'RemUser', uName, ...query});
    await this.post(endpoint);
    return true;
  }

  async updateRole(query = {}) {
    const endpoint = this.endpoint('/user/', {verb: 'UpdUsRol', ...query});
    await this.post(endpoint);
    return true;
  }

  async updateEmail(query = {}) {
    const endpoint = this.endpoint('/user/', {verb: 'UpdUsEma', ...query});
    await this.post(endpoint);
    return true;
  }

  async updatePassword(query = {}) {
    const endpoint = this.endpoint('/user/', {verb: 'UpdUsPwd', ...query});
    await this.post(endpoint);
    return true;
  }

  async updateData(query = {}) {
    const endpoint = this.endpoint('/user/', {verb: 'UpdUsDat', ...query});
    await this.post(endpoint);
    return true;
  }
}

export const users = new UserDriver(config);
