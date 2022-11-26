function createErrorResponse(error) {
  return {
    error: {
      message: error.getMessage(),
      statusCode: error.getStatusCode(),
      statusText: error.getStatusText(),
      code: error.getCode(),
      dateTime: error.getDateTime(),
    },
  };
}

export { createErrorResponse };
