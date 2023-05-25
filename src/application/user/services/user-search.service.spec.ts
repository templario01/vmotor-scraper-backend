import { Test, TestingModule } from '@nestjs/testing';
import { buildSearchRepository } from '../../../shared/test-utils/repositories.mock';
import { UserSearchService } from './user-search.service';
import { SearchRepository } from '../../../persistence/repositories/search.repository';

describe('UserSearchService', () => {
  let service: UserSearchService;
  let module: TestingModule;
  const searchRepositoryMock = buildSearchRepository();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserSearchService,
        {
          provide: SearchRepository,
          useValue: searchRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserSearchService>(UserSearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
