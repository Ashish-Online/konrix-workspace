// Admin/src/pages/auth/Register.tsx

import { useEffect } from 'react';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

// components
import { FormInput, AuthLayout, PageBreadcrumb } from '../../components'

// redux
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { resetAuth, signupUser } from '../../redux/actions';

interface UserData {
  fullname: string;
  email: string;
  password: string;
  isOrg: boolean;
}

/* bottom links */
const BottomLink = () => {
  return (
    <p className="text-gray-500 dark:text-gray-400 text-center">
      Already have account?
      <Link to="/auth/login" className="text-primary ms-1">
        <b>Log In</b>
      </Link>
    </p>
  );
};

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => ({
    loading: state.Auth.loading,
  }));

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  /*
   * 1) Build a Yup schema that includes `isOrganization`
   */
  const schemaResolver = yupResolver(
    yup.object().shape({
      fullname: yup.string().required("Please enter Fullname"),
      email: yup
        .string()
        .required("Please enter Email")
        .email("Please enter valid Email"),
      password: yup.string().required("Please enter Password"),
      isOrg: yup
        .boolean()
        .required("Please select Yes or No")
        .oneOf([true, false], "Please select Yes or No"),
    })
  );

  /*
   * 2) Call `useForm()` exactly once, with our schema resolver.
   */
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserData>({ resolver: schemaResolver });

  /*
   * 3) handle form submission: now `formData` will include `isOrganization`
   */
  const onSubmit = (formData: UserData) => {
    dispatch(
      signupUser(
        formData.fullname,
        formData.email,
        formData.password,
        formData.isOrg
      )
    );
  };

  return (
    <>
      <PageBreadcrumb title="Register" />
      <AuthLayout
        authTitle="Sign Up"
        helpText="Don't have an account? Create your account, it takes less than a minute"
        bottomLinks={<BottomLink />}
        hasThirdPartyLogin
      >
        {/**
         * 4) Use a plain <form> with handleSubmit(handleOnSubmit)
         */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Full Name"
            type="text"
            name="fullname"
            placeholder="Enter Full Name"
            containerClass="mb-4"
            className="form-input"
            labelClassName="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2"
            register={register}
            errors={errors}
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your Email"
            containerClass="mb-4"
            className="form-input"
            labelClassName="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2"
            register={register}
            errors={errors}
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            containerClass="mb-4"
            className="form-input"
            labelClassName="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2"
            register={register}
            errors={errors}
            required
          />

          {/** NEW: “Is organization?” radio buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
              Is organization?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="true"
                  {...register("isOrg")}
                  className="form-radio"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="false"
                  defaultChecked
                  {...register("isOrg")}
                  className="form-radio"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
            {errors.isOrg && (
              <p className="text-xs text-red-600 mt-2">
                {errors.isOrg.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <FormInput
              label="I accept"
              type="checkbox"
              name="checkbox"
              containerClass="flex items-center"
              labelClassName="ms-2 text-slate-900 dark:text-slate-200"
              className="form-checkbox rounded"
              otherComp={
                <a
                  href=""
                  target="_blank"
                  className="text-gray-400 underline"
                  rel="noreferrer"
                >
                  Terms and Conditions
                </a>
              }
              register={register}
            />
          </div>

          <div className="flex justify-center mb-6">
            <button
              type="submit"
              className="btn w-full text-white bg-primary"
              disabled={loading}
            >
              Register
            </button>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};

export default Register;
