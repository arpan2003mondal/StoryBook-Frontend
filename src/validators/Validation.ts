import { UserRegisterRequestState } from "../model/UserRegisterRequest";

export class Validator{
    static validateUsername = (username: string) => {
        const usernameRegex = /^[A-Z][a-z]{2,}( [A-Z][a-z]+)$/;
        return usernameRegex.test(username) ;
    }

    static validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    static validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
    static validateConfirmPassword = (confirmPassword: string, password: string) => {
        return confirmPassword === password;
    }
    
    static validateUserRegisterRequest = (state: UserRegisterRequestState ) => {
        if(state.name === '' || state.email === '' || state.password === '' || state.confirmPassword === ''){
            return false;
        }
        return true;
    }
}