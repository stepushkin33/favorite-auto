export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const invalidResponse = () => {
  throw new ApiError('Сервис вернул некорректные данные. Попробуйте позже.');
};
