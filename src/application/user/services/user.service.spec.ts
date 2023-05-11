import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../persistence/repositories/user.repository';
import { buildUserRepositoryMock } from '../../../shared/test-utils/repositories.mock';
import { UserService } from './user.service';

describe('UserSearchService', () => {
  let service: UserService;
  let module: TestingModule;
  const userRepositoryMock = buildUserRepositoryMock();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
