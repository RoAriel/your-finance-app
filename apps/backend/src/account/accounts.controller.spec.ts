import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller'; // 👈 Renombrado
import { AccountsService } from './accounts.service'; // 👈 Renombrado

describe('AccountsController', () => {
  let controller: AccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService], // Mockear esto sería ideal, pero para el boilerplate sirve
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
