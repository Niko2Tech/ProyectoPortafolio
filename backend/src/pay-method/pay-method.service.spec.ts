import { Test, TestingModule } from '@nestjs/testing';
import { PayMethodService } from './pay-method.service';

describe('PayMethodService', () => {
  let service: PayMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayMethodService],
    }).compile();

    service = module.get<PayMethodService>(PayMethodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
