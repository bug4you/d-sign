const { Scenes } = require('telegraf');
const {confirmDesignTitleButtons} = require("../command/BotKeyboards");
const {addNewCategory} = require("../db/db");
const ShortUniqueId = require("short-unique-id");

// 1. Dizayn sarlavhasini qabul qilish uchun sahna
const categoryTitleScene = new Scenes.BaseScene('add_category');
categoryTitleScene.enter(async ctx => {
    await ctx.reply("Yangi dizayn kategoriyasini kiriting:");
});

categoryTitleScene.on("text", async ctx => {
    ctx.session.categoryTitle = ctx.message.text;
    const shortUniqueId = new ShortUniqueId({
        length: 12
    });
    const code = shortUniqueId.stamp(12);
    addNewCategory(ctx.message.text, code);
    await ctx.replyWithHTML(`Kategoriya nomi: <b>${ctx.message.text}</b>\n\nTasdiqlaysizmi?`, {
        ...confirmDesignTitleButtons(code).inline()
    });
    await ctx.scene.leave();
});

module.exports = {
    categoryTitleScene,
};
