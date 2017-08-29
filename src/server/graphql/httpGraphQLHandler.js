import {graphql} from 'graphql';
import Schema from './rootSchema';

export default async (req, res) => {
  // Check for admin privileges
  const {query, variables, ...rootVals} = req.body;
  const authToken = req.user || {};
  const result = await graphql(Schema, query, rootVals, authToken, variables);
  result.errors = ((result.errors || []).map(error => {
    try {
      return JSON.parse(error.message);
    } catch (e) {
      console.error('DEBUG GraphQL ', error.stack || error);
      return {_error: error.message || error};
    }
  }));
  res.send(result);
};
