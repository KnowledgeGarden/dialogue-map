import {GraphQLScalarType, GraphQLEnumType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';
import {
  GUEST_USER, READ_ONLY, READ_WRITE, OWNER, ADMINISTRATOR, MODERATOR, GUEST,
  USER, MEMBER_ADMIN, MEMBER_USER, MEMBER_GUEST
} from './permissions';

// The Handle type preserves case, so care must be taken when querying
// to perform a case insensitive match.
export const GraphQLHandleType = new GraphQLScalarType({
  name: 'Handle',
  serialize: value => String(value).trim(),
  parseValue: value => String(value).trim(),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Handle is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 4) {
      throw new GraphQLError(`Query error: Handles have a minimum length of 4 characters.`, [ast]);
    }
    if (ast.value.length > 15) {
      throw new GraphQLError(`Query error: Handles have a maximum length of 15 characters.`, [ast]);
    }
    return String(ast.value).trim();
  }
});

// The Email type preserves case, so care must be taken when querying
// to perform a case insensitive match.
export const GraphQLEmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: value => String(value).trim(),
  parseValue: value => String(value).trim(),
  parseLiteral: ast => {
    const re = /.+@.+/;
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Email is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (!re.test(ast.value)) {
      throw new GraphQLError('Query error: Not a valid Email', [ast]);
    }
    if (ast.value.length < 4) {
      throw new GraphQLError(`Query error: Email must have a minimum length of 4.`, [ast]);
    }
    if (ast.value.length > 300) {
      throw new GraphQLError(`Query error: Email is too long.`, [ast]);
    }
    return String(ast.value).trim();
  }
});

export const GraphQLPasswordType = new GraphQLScalarType({
  name: 'Password',
  serialize: value => String(value),
  parseValue: value => String(value),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Password is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 4) {
      throw new GraphQLError(`Query error: Password must have a minimum length of 4.`, [ast]);
    }
    if (ast.value.length > 60) {
      throw new GraphQLError(`Query error: Password is too long.`, [ast]);
    }
    return String(ast.value);
  }
});

export const GraphQLTitleType = new GraphQLScalarType({
  name: 'Title',
  serialize: value => String(value).trim(),
  parseValue: value => String(value).trim(),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Title is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 1) {
      throw new GraphQLError(`Query error: Title must have a minimum length of 1.`, [ast]);
    }
    if (ast.value.length > 140) {
      throw new GraphQLError(`Query error: Title is too long.`, [ast]);
    }
    return String(ast.value).trim();
  }
});

export const GraphQLSummaryType = new GraphQLScalarType({
  name: 'Summary',
  serialize: value => String(value).trim(),
  parseValue: value => String(value).trim(),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Summary is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 1) {
      throw new GraphQLError(`Query error: Summary must have a minimum length of 1.`, [ast]);
    }
    if (ast.value.length > 255) {
      throw new GraphQLError(`Query error: Summary is too long.`, [ast]);
    }
    return String(ast.value).trim();
  }
});

function coerceDate(value) {
  if (value instanceof Date) return value.toISOString();
  // see https://www.debuggex.com/r/kyZgRXV4uQuen6Kv
  const fmt = /^(\+|\-)?(\d)+\-(\d){2}\-(\d){2}T(\d){2}:(\d){2}:(\d){2}(?:\.(\d+))?Z$/;
  if (fmt.test(value) || !isNaN(value)) {
    const date = new Date(value);
    if (isNaN(date)) return null;
    return date.toISOString();
  }
  return null;
}

export const GraphQLDateType = new GraphQLScalarType({
  name: 'Date',
  serialize: value => coerceDate(value),
  parseValue: value => coerceDate(value),
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT && ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Date is not a string or integer, it is a: ${ast.kind}`, [ast]);
    }
    const date = coerceDate(ast.value);
    if (!date) {
      throw new GraphQLError('Query error: Not a valid javascript range for ISO 8601 UTC timestamp', [ast]);
    }
    return coerceDate(ast.value);
  }
});

// TODO enable markup on this type
export const GraphQLDetailsType = new GraphQLScalarType({
  name: 'Details',
  serialize: value => String(value).trim(),
  parseValue: value => String(value).trim(),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Details is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 1) {
      throw new GraphQLError(`Query error: Details must have a minimum length of 1.`, [ast]);
    }
    return String(ast.value).trim();
  }
});

// TODO serialization
export const GraphQLResponseType = new GraphQLEnumType({
  name: 'Response',
  values: {
    QUESTION: {value: 0},
    ANSWER: {value: 1},
    PRO: {value: 2},
    CON: {value: 3}
  }
});

export const GraphQLPermissionType = new GraphQLEnumType({
  name: 'Permission',
  description: 'Available permissions for system users',
  values: {
    GUEST_USER: {
      value: GUEST_USER
    },
    READ_ONLY: {
      value: READ_ONLY,
      description: 'Read-Only Permission'
    },
    READ_WRITE: {
      value: READ_WRITE,
      description: 'Read-Write Permission'
    },
    OWNER: {
      value: OWNER,
      description: 'This is the GOD-like role: can do anything anywhere'
    },
    ADMINISTRATOR: {
      value: ADMINISTRATOR,
      description: 'Portal administrator role: has Read-Write and Administrative rights outside Groups'
    },
    MODERATOR: {
      value: MODERATOR,
      description: 'Portal moderator role: has Read-Write abilities above users, but below administrators, outside Groups'
    },
    GUEST: {
      value: GUEST,
      description: 'General public browsing. Read-Only; cannot enter Groups'
    },
    USER: {
      value: USER,
      description: 'General public Read-Write; outside Groups'
    },
    MEMBER_ADMIN: {
      value: MEMBER_ADMIN,
      description: 'Administrative and Read-Write inside particular Group'
    },
    MEMBER_USER: {
      value: MEMBER_USER,
      description: 'Non-administrative Read-Write inside particular Group'
    },
    MEMBER_GUEST: {
      value: MEMBER_GUEST,
      description: 'Read-Only inside particular Group'
    }
  }
});

export const GraphQLURLType = new GraphQLScalarType({
  name: 'URL',
  serialize: value => String(value),
  parseValue: value => String(value),
  parseLiteral: ast => {
    // see https://www.debuggex.com/r/gD0PK4Q9ICDVZD_J
    const re = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    if (!re.test(ast.value)) {
      throw new GraphQLError('Query error: Not a valid URL', [ast]);
    }
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: URL is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 1) {
      throw new GraphQLError(`Query error: URL must have a minimum length of 1.`, [ast]);
    }
    if (ast.value.length > 2083) {
      throw new GraphQLError(`Query error: URL is too long.`, [ast]);
    }
    return String(ast.value);
  }
});
