import { ApiError } from "../utils/apiError.util.js";
const validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    res.status(400).json(new ApiError(400, { message: err.issues[0].message }));
  }
};

export { validate };
