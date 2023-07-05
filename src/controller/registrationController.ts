import { regResponseData } from 'types/registration/regRequestData';
import { UserRepository } from '../repository/userRepository';
import { regRequestData } from '../types/registration/regResponseData';
import { Message } from 'types/message';
import { createResponseMessage } from 'service/messageService';
import { resCommandTypes } from 'types/commands/resCommandTypes';

export class RegistrationController {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = UserRepository.getInstance();
  }
  public userRegistration(data: string): string {
    const registrationRequestData: regRequestData = JSON.parse(data);
    let registrationResponseData: regResponseData;
    try {
      const newUser = this.userRepository.createUser(registrationRequestData.name, registrationRequestData.password);
      registrationResponseData = { name: newUser.name, index: newUser.index, error: false, errorText: '' };
    } catch (err) {
      registrationResponseData = { name: '', index: 0, error: true, errorText: (err as Error).message };
    }
    const message: string = createResponseMessage(resCommandTypes.REGISTRATION, registrationRequestData);
    return message;
  }
}
