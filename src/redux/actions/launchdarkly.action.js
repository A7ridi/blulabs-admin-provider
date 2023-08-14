export const LD_FEATURE_FLAGS = "LD_FEATURE_FLAGS";

export const setLdFeatureFlags = (object) => {
   return {
      type: LD_FEATURE_FLAGS,
      payload: { ...object },
   };
};
