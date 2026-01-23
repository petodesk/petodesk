import { parsePhoneNumberFromString } from 'libphonenumber-js'

type ValidatePhoneParams = {
  phone: string       
}

export function validatePhone({
  phone,
}: ValidatePhoneParams): {
  valid: boolean
  error?: string
} {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone)

    if (!phoneNumber) {
      return { valid: false, error: 'Invalid phone number' }
    }

    if (!phoneNumber.isValid()) {
      return { valid: false, error: 'Phone number is not valid for this country' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid phone number format' }
  }
}
