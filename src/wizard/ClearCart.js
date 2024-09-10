const {Scenes} = require('telegraf');

let clearCartConfirm = new Scenes.BaseScene('clear_cart');

clearCartConfirm.enter(async ctx => {
    await ctx.reply("Savatchani tozalashni tasdiqlaysizmi?", {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: `✔ Ha`, callback_data: "yes_clear_cart"},
                    {text: `✖ Yo'q`, callback_data: "no_clear_cart"}
                ]
            ]
        }
    });
});


module.exports = {
    clearCartConfirm
};