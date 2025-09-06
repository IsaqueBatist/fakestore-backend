import {generate} from "otp-generator"

const generateOtp = (): string => {
    const otp =  generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    })
    return otp.toString();
}
