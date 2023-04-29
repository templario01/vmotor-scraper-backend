export const buildSignUpMutation = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => ({
  query: `mutation {
      signUp(signUpInput:{
        email: "${email}",
        password: "${password}",
      }){
        message
        expirationTime
      }
    }`,
});

export const buildSignInMutation = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => ({
  query: `mutation {
      signIn(signInInput:{
        email: "${email}",
        password: "${password}",
      }){
        accessToken
      }
    }`,
});
