import BacksideDriver, {parseRangeQuery} from './BacksideDriver';
import config from './backside.config';
import {
  StatusCodeError,
  ResponseMessageError
} from './BacksideErrors';

export default class InvitationDriver extends BacksideDriver {
  // methods below correspond with verbs in src/main/java/org/topicquests/backside/servlet/apps/admin/api/IAdminMicroformat.java

  // TODO(wenzowski): fix BacksideServlet so inviting a user twice does not result in a 500 response
  // TODO(wenzowski): maybe verify email belongs to a deliverable domain using MX records
  async invite(uEmail, query = {}) {
    const endpoint = this.endpoint('/admin/', {verb: 'NewInvite', uEmail, ...query});
    const body = await this.get(endpoint).catch(error => {
      if (!error instanceof StatusCodeError) throw error;
    });
    if (body && body.rMsg === 'ok') return true;
    return false;
  }

  async list(query = {from: 0, count: 50}) {
    const [from, count] = parseRangeQuery(query);
    return this.getCargo('/admin/', {verb: 'ListInvites', ...query, from, count});
  }

  async isInvited(uEmail, query = {}) {
    const endpoint = this.endpoint('/admin/', {verb: 'ExistsInvite', uEmail, ...query});
    const body = await this.get(endpoint);
    if (body.rMsg === 'not found') return false;
    if (body.rMsg === 'ok') return true;
    throw new ResponseMessageError(body.rMsg);
  }

  async uninvite(uEmail, query = {}) {
    const endpoint = this.endpoint('/admin/', {verb: 'RemoveInvite', uEmail, ...query});
    const body = await this.post(endpoint);
    if (body && body.rMsg === 'ok') return true;
    return false;
  }
}

export const invitations = new InvitationDriver(config);
