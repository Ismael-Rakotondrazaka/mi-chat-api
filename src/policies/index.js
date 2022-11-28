import userPolicy from "./userPolicy.js";

const SOURCE_POLICY = {
  User: userPolicy,
};

const isAuthorizedTo = (
  params = {
    user: null,
    action: null,
    source: null,
    target: null,
    through: null,
  }
) => {
  const sourceHandler = SOURCE_POLICY[params.source];

  if (!sourceHandler)
    throw new ServerError(`'${params.source}' source policy not found.`, {
      private: true,
      code: "E1_2",
    });

  const actionHandler = sourceHandler[params.action];

  if (!actionHandler)
    throw new ServerError(`'${params.action}' action policy not found.`, {
      private: true,
      code: "E1_3",
    });

  return actionHandler(params);
};

export { isAuthorizedTo };
