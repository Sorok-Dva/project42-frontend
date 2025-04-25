import React from 'react'
import { FaCheck, FaXmark } from 'react-icons/fa6'

interface PasswordStrengthCheckerProps {
  password : string;
}

const PasswordStrengthChecker : React.FC<PasswordStrengthCheckerProps> = ({ password }) => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /(?=.*[\W_])/.test(password)
  const isValidLength = password.length >= 8

  return (
    <>
      <div className={'card mb-3 bg-dark text-white'} style={ { padding: '10px' } }>
        <div className="card-body">
          <h5 className="card-title">Force du mot de passe</h5>
          <p className="card-text">
            <small className={ isValidLength ? 'text-success': 'text-danger' }>
              { isValidLength ? <FaCheck /> : <FaXmark /> } Minimum 8 caractères
            </small><br/>
            <small className={ hasUpperCase ? 'text-success': 'text-danger' }>
              { hasUpperCase ? <FaCheck /> : <FaXmark /> } Au moins une majuscule
            </small><br/>
            <small className={ hasLowerCase ? 'text-success': 'text-danger' }>
              { hasLowerCase ? <FaCheck /> : <FaXmark /> } Au moins une minuscule
            </small><br/>
            <small className={ hasNumber ? 'text-success': 'text-danger' }>
              { hasNumber ? <FaCheck /> : <FaXmark /> } Au moins un chiffre
            </small><br/>
            <small className={ hasSpecialChar ? 'text-success': 'text-danger' }>
              { hasSpecialChar ? <FaCheck /> : <FaXmark /> } Au moins un caractère spécial (@$!%*?&)
            </small>
          </p>
        </div>
      </div>
    </>

  )
}

export default PasswordStrengthChecker
