'use client'

import FooterLink from "@/components/forms/FooterLink"
import InputField from "@/components/forms/InputField"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"

const SignIn = () => {
  const {
    register, 
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur'
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log(data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <h1 className="form-title">Welcome Back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="tsunami@gmail.com"
          register={register}
          error={errors.email}
          validation={{ 
            required: 'Email is required', 
            pattern: {
              value: /^\w+@\w+\.\w+$/,
              message: 'Please enter a valid email address'
            }
          }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ 
            required: 'Password is required', 
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          }}
        />
        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        <FooterLink text="Don't have an account?" linkText="Sign up" href="/sign-up" />
      </form>
    </>
  )
}

export default SignIn
