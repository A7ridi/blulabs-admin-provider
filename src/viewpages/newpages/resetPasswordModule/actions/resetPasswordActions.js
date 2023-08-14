import { gql } from "@apollo/client";

export const UPDATE_USER_PASSWORD = gql`
   mutation ResetProviderPassword($newProviderPassword: UpdateProviderPasswordInput) {
      resetProviderPassword(newProviderPassword: $newProviderPassword) {
         status {
            code
            success
            message
         }
      }
   }
`;
