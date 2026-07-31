export const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data || {},
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || {},
  });
};

export const sendPaginatedResponse = (
  res,
  statusCode,
  message,
  pagination,
  data
) => {
  res.status(statusCode).json({
    success: true,
    message,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasNext: pagination.hasNext,
      hasPrevious: pagination.hasPrevious,
    },
    data,
  });
};
