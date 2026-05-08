// default role would be user.
// this middleware is to check whether the role is admin or not.
export const roleMiddleware = (role) => {
  return (req, res, next) => {
    const authReq = req;
    const authUser = authReq.user;

    if (!authUser) {
      return res
        .status(401)
        .json({ message: "You are not authorized user. Access denied!!" });
    }

    // If the given role is not matching then throw an error
    // 403 is forbidden status which also means that you dont have permission actually.
    if (authUser.role !== role) {
      return res
        .status(403)
        .json({ message: "You dont have permission for this action" });
    }

    next();
  };
};
