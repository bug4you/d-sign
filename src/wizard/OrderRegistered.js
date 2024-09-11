const {Scenes} = require('telegraf');
const {getCartView} = require("../db/db");
const {mainServicesButtons} = require("../command/BotKeyboards");
const consola = require("consola");

const orderRegistered = new Scenes.BaseScene('order_registered');
orderRegistered.enter(async ctx => {
    await ctx.replyWithHTML(`<b>Buyurtmani tasdiqlaysizmi?</b>`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: `✅ Ha`, callback_data: "yes_order"},
                    {text: `❌ Yo'q`, callback_data: "no_order"}
                ]
            ]
        }
    });
    try {
        await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    } catch (e) {
        consola.error(e.message);
    }
});

orderRegistered.action("yes_order", async ctx => {
    await ctx.replyWithHTML("<i>Judayam ajoyib buyurtmani qabul qilishmiz mumkin. Lekin avval biz siz bilan to'g'ri aloqaga chiqa olishimiz uchun bir nechta vazifa bajarishingiz kerak bo'ladi?!</i>\n\n<i>Iltimos, ismingizni kiriting:</i>");
    await deleteMsg(ctx);
    await ctx.scene.enter("order_registered_user_fullname");
});

orderRegistered.action("no_order", async ctx => {
    await ctx.reply("<i>Buyurtmani bekor qildingiz!</i>");
    await ctx.scene.leave();
});

const orderRegisteredUserFullname = new Scenes.BaseScene('order_registered_user_fullname');
orderRegisteredUserFullname.enter(async ctx => {
});

orderRegisteredUserFullname.on("text", async ctx => {
    ctx.session.fullname = ctx.message.text;
    await ctx.replyWithHTML("<i><b>Telefon raqamingizni kiriting</b>(Bir nechta aloqa raqamlarini kiritishingiz mumkin. Faqat bitta xabarda):</i>", {
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [
                    {
                        text: "Telefon raqamini yuborish",
                        request_contact: true
                    }
                ]
            ],
            resize_keyboard: true,
            selective: true,
            force_reply: true
        }
    });
    await deleteMsg(ctx);
    await ctx.scene.enter("order_registered_user_phone");
});

const orderRegisteredUserPhone = new Scenes.BaseScene('order_registered_user_phone');
orderRegisteredUserPhone.enter(async ctx => {
});

orderRegisteredUserPhone.on("contact", async ctx => {
    consola.log(ctx.message.contact);
});

orderRegisteredUserPhone.on("text", async ctx => {
    let phone = ctx.message.text;
    ctx.session.phone = phone;
    let cartView = await getCartView(ctx.message.from.id);
    if (cartView.length === 0) {
        await ctx.reply("Savatchangiz bo'sh!", {
            ...mainServicesButtons.inline()
        });
        await ctx.scene.leave();
        return;
    }
    let responseText = ``;
    cartView.forEach((cartItem, index) => {
        consola.warn(cartItem);
    });
    await ctx.telegram.sendMessage(process.env.BOT_ADMIN, `📦 <b>Yangi buyurtma</b>\n\n<b>Ism:</b> ${ctx.session.fullname}\n<b>Aloqa uchun:</b> ${ctx.session.phone}\n\n${responseText}`, {
        parse_mode: "HTML"
    });

    // await addOrder(ctx.message.from.id, ctx.session.phone);
});

const deleteMsg = async (ctx) => {
    try {
        ctx.deleteMessage();
    } catch (e) {
        consola.error(e.message);
    }
};

module.exports = {
    orderRegistered,
    orderRegisteredUserFullname,
    orderRegisteredUserPhone
};