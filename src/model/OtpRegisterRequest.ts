import { UserRegisterRequestState } from './UserRegisterRequest';

export interface OtpRegisterRequest {
    email: string;
    otp: string;
    registerRequest: UserRegisterRequestState;
}
