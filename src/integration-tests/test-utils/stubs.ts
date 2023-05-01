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

export const buildGetVehiclesByAdvancedSearchQuery = ({
  take,
  after,
  city,
  searchName,
}: {
  take?: number;
  after?: string;
  searchName?: string;
  city?: string;
}) => ({
  query: `query {
    getVehiclesByAdvancedSearch(
      ${take ? 'take: ' + take + ',' : ''}
      ${after ? 'after: "' + after + '",' : ''}
      ${searchName ? 'searchName: "' + searchName + '",' : ''}
      ${city ? 'city: "' + city + '",' : ''}
    ){
      nodes{
        uuid
        externalId
        description
        price
        currency
        url
        year
        location
      }
      endCursor
      totalCount
    }
  }`,
});
