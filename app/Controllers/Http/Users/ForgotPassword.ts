import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { StoreValidator, UpdateValidator } from "App/Validators/User/ForgotPassword";
import Mail from "@ioc:Adonis/Addons/Mail";
import { User, UserKey } from "App/Models";
import faker from "faker";
import Database from "@ioc:Adonis/Lucid/Database";

export default class UserForgotPasswordController {
  public async store({ request }: HttpContextContract) {
    await Database.transaction(async (trx) => {
      const { email, redirectUrl } = await request.validate(StoreValidator);

      const user = await User.findByOrFail("email", email);
      user.useTransaction(trx);

      const key = faker.datatype.uuid() + user.id;
      await user.related("keys").create({ key });

      const link = `${redirectUrl.replace(/\/$/, "")}/${key}`;

      await Mail.send((message) => {
        message.to(email);
        message.from("contato@facebook.com", "Facebook");
        message.subject("Recuperação de senha");
        message.htmlView("emails/forgot-password", { link });
      });
    });
  }

  public async show({ params }: HttpContextContract) {
    await UserKey.findByOrFail("key", params.key);
  }

  public async update({ request }: HttpContextContract) {
    const { key, password } = await request.validate(UpdateValidator);

    const userKey = await UserKey.findByOrFail("key", key);
    const user = await userKey.related("user").query().firstOrFail();

    user.merge({ password });

    await user.save();
    await userKey.delete();

    return { message: "password changed successfully" };
  }
}
