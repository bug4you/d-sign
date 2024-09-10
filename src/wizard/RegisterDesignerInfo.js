const {Scenes} = require('telegraf');
const {updateUserById, getUserById} = require("../db/db");
const {mainServicesButtons} = require("../command/BotKeyboards");
const {WizardScene} = Scenes;
const constants = require("../command/BotConstant");

// 1. Ismni qabul qilish uchun sahna
const firstNameScene = new Scenes.BaseScene('first_name');
firstNameScene.enter((ctx) => ctx.reply('Iltimos, ismingizni kiriting:'));
firstNameScene.on('text', (ctx) => {
    ctx.session.first_name = ctx.message.text;
    ctx.scene.enter('last_name'); // Keyingi sahnaga o'tish
});

// 2. Familiyani qabul qilish uchun sahna
const lastNameScene = new Scenes.BaseScene('last_name');
lastNameScene.enter((ctx) => ctx.reply('Endi, familiyangizni kiriting:'));
lastNameScene.on('text', (ctx) => {
    ctx.session.last_name = ctx.message.text;
    ctx.scene.enter('phone_number'); // Keyingi sahnaga o'tish
});

// 3. Telefon raqamini qabul qilish uchun sahna
const phoneNumberScene = new Scenes.BaseScene('phone_number');
phoneNumberScene.enter((ctx) => ctx.reply('Telefon raqamingizni kiriting:'));
phoneNumberScene.on('text', (ctx) => {
    ctx.session.phone_number = ctx.message.text;
    ctx.scene.enter('passport_image'); // Keyingi sahnaga o'tish
});

// 4. Passport rasmini qabul qilish uchun sahna
const passportImageScene = new Scenes.BaseScene('passport_image');
passportImageScene.enter((ctx) => ctx.reply('Passportingiz rasmini yuboring:'));
passportImageScene.on('photo', (ctx) => {
    const passportImage = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    ctx.session.passport_image = passportImage;
    ctx.scene.enter('user_bio'); // Keyingi sahnaga o'tish
});
passportImageScene.on('message', (ctx) => ctx.reply('Iltimos, passport rasmini yuboring.'));

// 5. User biografiyasini qabul qilish uchun sahna
const userBioScene = new Scenes.BaseScene('user_bio');
userBioScene.enter((ctx) => ctx.reply('O\'zingiz haqingizda qisqacha ma\'lumot kiriting:'));
userBioScene.on('text', (ctx) => {
    updateUserById(
        ctx.from.id,
        ctx.from.username,
        ctx.session.first_name,
        ctx.session.last_name,
        ctx.message.text,
        ctx.session.passport_image,
        ctx.message.text,
        0,
        0,
        ctx.session.phone_number
    );
    ctx.replyWithHTML(`<b>📝 Sizning ma'lumotlaringiz:</b>\n\n<b>ID: </b><code>${ctx.from.id}</code>\n<b>Ismi: </b><code>${ctx.session.first_name}</code>\n<b>Familya: </b><code>${ctx.session.last_name}</code>\n<b>Username: </b><code>${ctx.from.username}</code>\n<b>Telegram raqami: </b><code>${ctx.session.phone_number || ""}</code>\n\n<b>Ma'lumotlar muvaffaqiyatli saqlandi va tasdiqlash uchun administratorga jo'natildi!</b>`, {
        ...mainServicesButtons.inline()
    });
    console.log(getUserById(Number(ctx.from.id)));
    ctx.telegram.sendPhoto(process.env.BOT_ADMIN, ctx.session.passport_image, {
        caption: `<b>🆕 Yangi dizaynerlik so'rovi:</b>\n\n<b>Ismi: </b><code>${ctx.session.first_name}</code>\n<b>Familyasi: </b><code>${ctx.session.last_name}</code>\n<b>Telegram raqami: </b><code>${ctx.session.phone_number || ""}</code>\n<b>Ma'lumoti: </b><code>${ctx.message.text}</code>`,
        parse_mode: "HTML",
        has_spoiler: true,
        protect_content: true,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Foydalanuvchi hisobi",
                        url: `tg://user?id=${ctx.from.id}`
                    }
                ],
                [
                    {
                        text: constants.APPROVE_DESIGNER,
                        callback_data: `approve_designer_${ctx.from.id}`
                    }
                ],
                [
                    {
                        text: constants.REJECT_DESIGNER,
                        callback_data: `reject_designer_${ctx.from.id}`
                    }
                ]
            ]
        }
    });
    ctx.scene.leave(); // Sahnadan chiqish
});

const deleteMsg = async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
    }
}

module.exports = {
    firstNameScene,
    lastNameScene,
    phoneNumberScene,
    passportImageScene,
    userBioScene
};