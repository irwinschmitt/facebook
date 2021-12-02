import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UserRegisterUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    key: schema.string({ trim: true }, [rules.exists({ table: "user_keys", column: "key" })]),
    name: schema.string({ trim: true }),
    password: schema.string({}, [rules.confirmed("passwordConfirmation")]),
  });

  public messages = {};
}
