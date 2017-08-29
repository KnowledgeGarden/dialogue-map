// inherit ErrorClass instead of native Error
// see https://phabricator.babeljs.io/T3083
// this can be removed when code runs without babel es2015 preset exclusively within node >= 5
class BacksideError {
  constructor(message) {
    const native = (new Error(message));
    [this.message, this.stack] = [native.message, native.stack];
  }
}

// TODO: fix this nastyness: html is not regular
// should probably use something like cheerio instead
const re = /<pre>\s*javax\.servlet\.ServletException:\s*(.+)\s*<\/pre>/i;
function parse(body) {
  return re.test(body) ? re.exec(body)[1] : body;
}

function format(errorMessage, body) {
  const backsideError = body ? ` Got: ${parse(body)}` : '';
  return `${errorMessage}${backsideError}`;
}

export class StatusCodeError extends BacksideError {
  constructor(statusCode, body) {
    super(format(`Backside responded with '${statusCode}'.`, body));
  }
}

export class ParseError extends BacksideError {
  constructor(body, message = 'Backside did not respond with json body.') {
    // super(message);
    super(format(message, body));
  }
}

export class ResponseMessageError extends BacksideError {
  constructor(rMsg) {
    super(`Backside responded with unacceptable rMsg attribute: '${rMsg}'`);
  }
}
