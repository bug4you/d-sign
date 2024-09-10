const {Scenes} = require('telegraf');
const {addNewDesign, getCategories, getCategoryById} = require("../db/db");
const {mainServicesButtons, approveDesignButtons} = require("../command/BotKeyboards");
const {consola} = require("consola");
const ShortUniqueId = require("short-unique-id");

// 1. Dizayn sarlavhasini qabul qilish uchun sahna
const designTitleScene = new Scenes.BaseScene('design_title');
designTitleScene.enter((ctx) => {
    if (getCategories().length === 0) {
        ctx.replyWithHTML(`<i>Afsuski hozirda dizaynni qo'shish uchun maxsus kategoriyalar mavjud emas.\n<b>Kerakli kategoriyalar admin tomonidan qo'shilishini kuting...</b></i>`, {
            ...mainServicesButtons.inline()
        });
        return ctx.scene.leave();
    }
    ctx.replyWithHTML(`<i>Ushbu bo\'lim orqali siz yangi dizayningizni qo\'shishingiz mumkin. Buning uchun so'ralgan barcha ma'lumotlarni to'g'ri va to'liq kiritganingizga ishonch hosil qiling</i>\n\n<b>Yangi dizayn sarlavhasini kiriting:</b>`)
});
designTitleScene.on('text', async (ctx) => {
    ctx.session.design_title = ctx.message.text;
    consola.warn("Title: ", ctx.session.design_title);
    await ctx.scene.enter('design_description'); // Keyingi sahnaga o'tish
});

// 2. Dizayn tavsifini qabul qilish uchun sahna
const designDescriptionScene = new Scenes.BaseScene('design_description');
designDescriptionScene.enter(async (ctx) => ctx.replyWithHTML('<b>Dizaynningizni tavsifini shu yerga kiriting:</b>'));
designDescriptionScene.on('text', async (ctx) => {
    consola.info("Description: ", ctx.message.text);
    ctx.session.design_description = ctx.message.text;
    await ctx.scene.enter('design_photo'); // Keyingi sahnaga o'tish
});

// 3. Dizayn rasmini kiritish
const designPhotoScene = new Scenes.BaseScene('design_photo');
designPhotoScene.enter((ctx) => ctx.replyWithHTML('Dizaynning rasmini yuklang(<code>png</code>, <code>jpg</code>, <code>heic</code>, <code>jpeg</code>):'));
designPhotoScene.on('photo', async (ctx) => {
    ctx.session.design_photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    await ctx.scene.enter('design_category'); // Keyingi sahnaga o'tish
});

const designCategoryScene = new Scenes.BaseScene("design_category");
designCategoryScene.enter(ctx => {
    consola.info("Category Scene");
    let message = "<B>Maxsulotingiz uchun eng mos keladigan kategoriyani tanlang: Buning uchun siz kategoriya raqami ustiga bosishingiz kerak</B>\n\n";
    getCategories().forEach(category => {
        consola.box(category);
        if (category.is_approved) {
            message += `<i>/${category.id}.</i> <b>${category.name}</b>\n`;
        }
    });
    ctx.replyWithHTML(message);
});

designCategoryScene.on("text", async ctx => {
    const msg = ctx.message.text;
    if (msg.startsWith("/")) {
        const id = msg.slice(1);
        consola.info("Category ID: ", id);
        let categoryById = getCategoryById(id);
        consola.info("Category by ID: ", categoryById);
        if (!categoryById) {
            ctx.replyWithHTML("<i>Kategoriya topilmadi. Iltimos, qaytadan urinib ko'ring</i>");
            await ctx.scene.reenter();
        }
        ctx.session.design_category_id = categoryById.id;
    }
    await ctx.scene.enter("design_price");
});

// 4. Dizayn narxini qabul qilish uchun sahna
const designPriceScene = new Scenes.BaseScene('design_price');
designPriceScene.enter((ctx) => ctx.reply('Dizayn uchun taxminiy narxni kiriting:'));
designPriceScene.on('text', (ctx) => {
    const price = ctx.message.text;
    if (isNaN(price)) {
        return ctx.reply('Iltimos, narxni to\'g\'ri formatda kiriting (misol: 5600 so\'m)');
    }
    ctx.session.design_price = price;

    const uid = new ShortUniqueId();
    const uidWithTimestamp = uid.stamp(32);
    try {
        consola.success(uidWithTimestamp);
        addNewDesign(
            ctx.from.id,
            ctx.session.design_title,
            ctx.session.design_description,
            ctx.session.design_price,
            ctx.session.design_price,
            ctx.session.design_photo,
            ctx.session.design_category_id,
            uidWithTimestamp
        );
    } catch (error) {
        consola.error("Error: ", error.message);
    }

    ctx.replyWithPhoto(ctx.session.design_photo, {
        caption: `<b>📝 Yangi dizayn:</b>\n\n<b>Sarlavha: </b><code>${ctx.session.design_title}</code>\n<b>Tavsif: </b><code>${ctx.session.design_description}</code>\n<b>Narx: </b><code>${ctx.session.design_price}</code>\n\n<b>Ma'lumotlaringiz muvaffaqiyatli saqlandi va tasdiqlash uchun administratorga jo'natildi!</b>`,
        parse_mode: "HTML",
        ...mainServicesButtons.inline()
    });

    ctx.telegram.sendPhoto(Number(process.env.BOT_ADMIN), ctx.session.design_photo, {
        caption: `<b>📝 Yangi dizayn:</b>\n\n<b>Sarlavha: </b><code>${ctx.session.design_title}</code>\n<b>Tavsif: </b><code>${ctx.session.design_description}</code>\n<b>Narx: </b><code>${ctx.session.design_price}</code>\n\n<b>Ma'lumotlaringizni tasdiqlash uchun:</b>\n/designer_${ctx.from.id}`,
        parse_mode: "HTML",
        ...approveDesignButtons(uidWithTimestamp).inline()
    });
});


module.exports = {
    designTitleScene,
    designDescriptionScene,
    designPriceScene,
    designPhotoScene,
    designCategoryScene
};
