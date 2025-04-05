import { ApiError } from "../utils/apiError.util.js";
const validate = (schema) => async (req, res, next) => {
  console.log(req.body);
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    console.log(req.body);
    next();
  } catch (err) {
    res.status(400).json(new ApiError(400, { message: err }));
  }
};

export { validate };
