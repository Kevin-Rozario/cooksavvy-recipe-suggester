class ApiError extends Error {
  constructor(statusCode, message, stack) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.stack = "";

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
