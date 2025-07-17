import { Test, TestingModule } from '@nestjs/testing';
import { PayMethodController } from './pay-method.controller';
import { PayMethodService } from './pay-method.service';

describe('PayMethodController', () => {
  let controller: PayMethodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayMethodController],
      providers: [PayMethodService],
    }).compile();

    controller = module.get<PayMethodController>(PayMethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
