import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UseZodGuard, ZodSerializerDto, zodToOpenAPI } from 'nestjs-zod';
import { AppService } from './app.service';
import {
  TranslationDeniedResponseSchema,
  TranslationRequest,
  TranslationRequestSchema,
  TranslationResponseSchema,
} from './app.types';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Post('translation')
  @HttpCode(200)
  @ApiBody({ schema: zodToOpenAPI(TranslationRequestSchema) })
  @ApiOkResponse({ schema: zodToOpenAPI(TranslationResponseSchema) })
  @ApiBadRequestResponse({
    schema: zodToOpenAPI(TranslationDeniedResponseSchema),
  })
  @UseZodGuard('body', TranslationRequestSchema)
  @ZodSerializerDto(TranslationResponseSchema)
  async getTranslation(@Body() request: TranslationRequest) {
    this.logger.debug('API request:', request);
    const response = await this.appService.getTranslation(request);
    this.logger.debug('API response:', response);

    return response;
  }
}
