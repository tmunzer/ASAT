function getHttpCode(res, process) {
    var error, warning, success;
    if (res.statusCode >= 400 && res.statusCode < 500) {
        error = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
        asatConsole.error("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
    } else if (res.statusCode < 200 || res.statusCode >= 300) {
        warning = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
        asatConsole.warning("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
    } else {
        success = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
        asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
    }
    return {error: error, warning: warning, success: success};
}


var httpCode = {
    100: "Continue",
    101: "Switching Protocol",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "unused",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Variant Also Negotiates",
    511: "Network Authentication Required"
};