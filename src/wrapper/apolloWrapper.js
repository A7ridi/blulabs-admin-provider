import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getToken } from "../Apimanager/Networking";

const httpLink = createHttpLink({
   uri: process.env.REACT_APP_URL + "/graphql",
});

const authLink = setContext(async (_, { headers }) => {
   const token = await getToken();
   return {
      headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
      },
   };
});

export const client = new ApolloClient({
   link: authLink.concat(httpLink),
   cache: new InMemoryCache(),
});

export default function WithApolloClient(WrappedComponent) {
   return class extends React.Component {
      render() {
         return (
            <ApolloProvider client={client}>
               <WrappedComponent {...this.props} />
            </ApolloProvider>
         );
      }
   };
}
