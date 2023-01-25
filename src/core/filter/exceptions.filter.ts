import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export type Exceptions = HttpException;

@Catch(HttpException)
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: Exceptions, host: ArgumentsHost) {
    const statusCode = this.isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = {
      success: false,
      status: statusCode,
      error: 'Error',
      message: exception.message,
      data: {},
    };

    const error = exception.getResponse();

    if (typeof error === 'string') {
      response.message = error;
    } else {
      Object.assign(response, error);
    }
    host.switchToHttp().getResponse().status(statusCode).json(response);
    return response;
  }

  isHttpException(err: Exceptions): err is HttpException {
    return err instanceof HttpException;
  }
}
