import { applyMiddleware, createStore, compose } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import rootReducer from "./reducers/rootReducer";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";

// disabling redux dev tools on production
const composeEnhancers =
   // window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
   (process.env.NODE_ENV !== "production" &&
      typeof window !== "undefined" &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
   compose;
// const logger = createLogger();
// const persistConfig = { key: "root", storage }; //old
const persistConfig = {
   transforms: [
      encryptTransform({
         secretKey: "pbh-secret-key",
         onError: function (error) {
            // Handle the error.
         },
      }),
   ],
   key: "root",
   storage,
   timeout: null,
   whitelist: ["auth", "launchdarkly"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));
// export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));
export const persistor = persistStore(store);
// export default store;
