import { UserRepository } from '../../persistence/repositories/user.repository';

export const buildUserRepositoryMock = () => {
  const userRepository = jest.mocked<UserRepository>(UserRepository as any, true);
  userRepository.createAccount = jest.fn();
  userRepository.createValidationCode = jest.fn();
  userRepository.findUserByEmail = jest.fn();
  userRepository.findUserByEmailCode = jest.fn();
  userRepository.findUserById = jest.fn();
  userRepository.findUserByToken = jest.fn();
  userRepository.registerSession = jest.fn();
  userRepository.validateAccount = jest.fn();

  return userRepository;
};
