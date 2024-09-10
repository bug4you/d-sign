const {Scenes} = require('telegraf');
const {getCategoryMenu} = require("../command/BotKeyboards");
const {getCategories, updateCategoryName} = require("../db/db");

// 1. Dizayn sarlavhasini qabul qilish uchun sahna
const editCategoryNameScene = new Scenes.BaseScene('edit_category');
editCategoryNameScene.enter(async ctx => {
    let text = "<i>Mavjud kategoriyalardan birining raqamini tanlash orqali uni tahrirlashingiz mumkin</i>\n\n";
    getCategories().forEach((category) => {
        text += `<i>/${category.id}</i>: <b>${category.name}</b>\n`;
    });
    text += `\n<i>/stop</i>: <b>Barchasini to'xtatish uchun</b>\n`;
    await ctx.replyWithHTML(text);
});

editCategoryNameScene.on("text", async ctx => {
    try {
        let id = ctx.message.text;
        if (id.startsWith("/")) {
            id = id.slice(1);
        }
        if (ctx.message.text === "/stop") {
            await ctx.scene.leave();
            await ctx.reply("Tahrirni bekor qildingiz!", {
                ...getCategoryMenu.inline()
            });
            return;
        }
        let category = getCategories().find(category => category.id === Number(id));
        if (!category) {
            await ctx.reply("Bunday kategoriya mavjud emas!");
            await ctx.scene.reenter();
            return;
        }
        ctx.session.categoryId = category.id;
        ctx.replyWithHTML(`Tanlangan kategoriya: <b>${category.name}</b>\n\nYangi kategoriya nomini kiriting: `);
        await ctx.scene.enter("edit_category_name");
    } catch (e) {
    }
});

const editCategoryName = new Scenes.BaseScene('edit_category_name');
editCategoryName.enter(async ctx => {
    await ctx.answerCbQuery("Kategoriya nomini kiriting", {
        show_alert: true
    });
});


editCategoryName.on("text", async ctx => {
    try {
        let name = ctx.message.text;
        updateCategoryName(ctx.session.categoryId, name);
        await ctx.replyWithHTML("<b>Kategoriya nomi muvaffaqiyatli o'zgartirildi!</b>", {
            ...getCategoryMenu.inline()
        });
        await ctx.scene.leave();
    } catch (e) {
    }
});

module.exports = {
    editCategoryNameScene,
    editCategoryName
};
