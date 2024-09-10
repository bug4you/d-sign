require("dotenv").config();
const {Telegraf, Scenes, session} = require("telegraf");
const BotCommand = require("./src/command/BotCommand");
const Constant = require("./src/command/BotConstant");
const {
    getUserById,
    addNewUser,
    approveDesigner,
    registeredUser,
    editAdminStatus,
    updateDesignByHashId, getAllActiveDesigns, getCategoryById, getDesignById, addToCart, removeCartItem, clearCart
} = require("./src/db/db");
const {
    firstNameScene,
    lastNameScene,
    phoneNumberScene,
    passportImageScene,
    userBioScene
} = require("./src/wizard/RegisterDesignerInfo");
const {
    designTitleScene,
    designDescriptionScene,
    designPriceScene,
    designPhotoScene,
    designCategoryScene
} = require("./src/wizard/AddNewDesign");
const {categoryTitleScene} = require("./src/wizard/AddNewCategory");
const {getCategoryMenu, mainServicesButtons} = require("./src/command/BotKeyboards");
const {editCategoryNameScene, editCategoryName} = require("./src/wizard/EditCategory");
const {consola} = require("consola");
const {Keyboard} = require("telegram-keyboard");
const {clearCartConfirm} = require("./src/wizard/ClearCart");

const bot = new Telegraf(process.env.BOT_TOKEN);

const Stage = Scenes.Stage;
const stage = new Stage([
    firstNameScene,
    lastNameScene,
    phoneNumberScene,
    passportImageScene,
    userBioScene,
    designTitleScene,
    designDescriptionScene,
    designPriceScene,
    designPhotoScene,
    categoryTitleScene,
    editCategoryNameScene,
    editCategoryName,
    designCategoryScene,
    clearCartConfirm
]);

bot.use(session());
bot.use(stage.middleware());

bot.use(async (ctx, next) => {
    try {
        let data = await getUserById(Number(ctx.from.id));
        // console.log(data);
        if (!data) {
            addNewUser(
                Number(ctx.from.id),
                ctx.from.username,
                ctx.from.first_name,
                ctx.from.last_name,
                "",
                0,
                0
            );
            consola.success("Adding new user");
        }
        if (Number(process.env.BOT_ADMIN) === Number(ctx.from.id)) {
            await editAdminStatus(Number(ctx.from.id), 1);
        } else {
            await editAdminStatus(Number(ctx.from.id), 0);
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
    await next();
});

const botCommands = new BotCommand();

bot.start(botCommands.start);

bot.action(Constant.MAIN_SERVICES, botCommands.mainServices);

bot.action(Constant.MAIN, async ctx => {
    try {
        await botCommands.start(ctx, ctx.update.callback_query.from);
        await ctx.deleteMessage();
    } catch (e) {
        console.log(e);
    }
});

bot.action(Constant.PROFILE, botCommands.profile);

bot.action(Constant.MY_DATA, botCommands.getProfileData);

bot.action(Constant.BEING_DESIGNER, botCommands.beingDesigner);

bot.action(Constant.BACK_TO_PROFILE, botCommands.profile);

bot.action(Constant.GET_ALL_DESIGNERS, botCommands.getAllDesigners);

// Yangi dizayn qo'shish wizardi
bot.action(Constant.REGISTER_NEW_DESIGN, botCommands.addNewDesign);

// Yangi dizaynni tasdiqlash
bot.action(Constant.BEING_DESIGNER_CONFIRMED, botCommands.approveDesign);

bot.action(/approve_designer_/, async ctx => {
    try {
        let id = ctx.update.callback_query.data.split("_")[2];
        approveDesigner(Number(id));
        registeredUser(Number(id));
        console.log(id);
        await ctx.answerCbQuery(`Dizaynerlik so'rovi tasdiqlandi!`);
        await ctx.telegram.sendMessage(id, `Sizning dizaynerlik so'rovingiz tasdiqlandi!`);
        await deleteMsg(ctx);
        await botCommands.profile(ctx);
    } catch (e) {
    }
});

bot.action(/reject_designer_/, async ctx => {
    try {
        let id = ctx.update.callback_query.data.split("_")[2];
        await ctx.answerCbQuery(`Dizaynerlik so'rovi rad etildi!`);
        await ctx.telegram.sendMessage(id, `Sizning dizaynerlik so'rovingiz rad etildi!`);
        await deleteMsg(ctx);
        await botCommands.profile(ctx);
    } catch (e) {
    }
});

bot.action(/approved_user_/, async ctx => {
    try {
        let id = ctx.update.callback_query.data.split("_")[2];
        registeredUser(Number(id));
        await ctx.answerCbQuery(`Foydalanuvchi tasdiqlandi!`);
        await ctx.telegram.sendMessage(id, `Sizning foydalanuvchi so'rovingiz tasdiqlandi!`);
        await deleteMsg(ctx);
        await botCommands.profile(ctx);
    } catch (e) {
    }
});

bot.action(Constant.CATEGORY, botCommands.getCategoryMenu);

bot.action(Constant.CATEGORY_LIST, botCommands.getCategoryList);

bot.action(Constant.BACK_TO_CATEGORY, botCommands.getCategoryMenu);

bot.action(Constant.ADD_CATEGORY, botCommands.addCategory);

bot.action(/confirm_category_/, async ctx => {
    console.log(ctx.update.callback_query.data);
    await ctx.replyWithHTML(`<b>Siz kategoriyani muvaffaqiyatli tasdiqladingiz. </b>`, {
        ...getCategoryMenu.inline()
    });
    await botCommands.confirmCategoryTitle(ctx);
});

bot.action(/cancel_category_/, async ctx => {
    console.log(ctx.update.callback_query.data);
    await ctx.replyWithHTML(`<b>Siz kategoriyani bekor qildingiz. </b>`, {
        ...getCategoryMenu.inline()
    });
    await botCommands.removeCategory(ctx);
});

bot.action(Constant.EDIT_CATEGORY, botCommands.editCategory);

bot.action(Constant.STATISTICS, botCommands.getStatistics);

bot.action(Constant.SHOP, botCommands.shopMenu);

bot.action(Constant.BACK_TO_SHOP, botCommands.shopMenu);

bot.action(Constant.VIEW_PRODUCTS, botCommands.viewProducts);

bot.action(/back_to_/i, async ctx => {
    try {
        let page = ctx.update.callback_query.data.split("_")[2];
        let designs = getAllActiveDesigns(page, 1);
        if (designs.length === 0) {
            await ctx.answerCbQuery("Sizda hozircha dizaynlar yo'q!");
            return;
        }
        designs.forEach(design => {
            let pageNumber = Number(page);
            let category = getCategoryById(design.category_id);
            ctx.replyWithPhoto(design.photo, {
                caption: `<b>📝 Dizayn:</b>\n\n<b>Sarlavha: </b><code>${design.title}</code>\n<b>Tavsif: </b><code>${design.description}</code>\n<b>Narx: </b><code>${design.seller_price}</code>\n<b>Kategoriya: </b><i>${category.name || ""}</i>`,
                parse_mode: "HTML",
                ...Keyboard.make([
                    [
                        {
                            text: Constant.ADD_TO_CART,
                            callback_data: `add_to_cart_${design.id}`
                        }
                    ],
                    [
                        {
                            text: Constant.PREVIOUS,
                            callback_data: `back_to_${pageNumber > 0 && pageNumber ? pageNumber - 1 : 0}`
                        },
                        {
                            text: Constant.NEXT,
                            callback_data: `next_to_${pageNumber ? pageNumber + 1 : 0}`
                        }
                    ],
                    [Constant.BACK_TO_SHOP]
                ]).inline()
            });
        });
        await deleteMsg(ctx);
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(/next_to_/i, async ctx => {
    try {
        let page = ctx.update.callback_query.data.split("_")[2];
        let designs = getAllActiveDesigns(page, 1);
        if (designs.length === 0) {
            await ctx.answerCbQuery("Sizda hozircha dizaynlar yo'q!");
            return;
        }
        designs.forEach(design => {
            let pageNumber = Number(page);
            let category = getCategoryById(design.category_id);
            consola.box('Category:', category);
            ctx.replyWithPhoto(design.photo, {
                caption: `<b>📝 Dizayn:</b>\n\n<b>Sarlavha: </b><code>${design.title}</code>\n<b>Tavsif: </b><code>${design.description}</code>\n<b>Narx: </b><code>${design.seller_price}</code>\n<b>Kategoriya: </b><i>${category.name || ""}</i>`,
                parse_mode: "HTML",
                ...Keyboard.make([
                    [
                        {
                            text: Constant.ADD_TO_CART,
                            callback_data: `add_to_cart_${design.id}`
                        }
                    ],
                    [
                        {
                            text: Constant.PREVIOUS,
                            callback_data: `back_to_${pageNumber > 0 && pageNumber ? pageNumber - 1 : 0}`
                        },
                        {
                            text: Constant.NEXT,
                            callback_data: `next_to_${pageNumber ? pageNumber + 1 : 0}`
                        }
                    ],
                    [Constant.BACK_TO_SHOP]
                ]).inline()
            });
        });
        await deleteMsg(ctx);
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(/add_to_cart_/, async ctx => {
    // todo
    try {
        let designId = ctx.update.callback_query.data.split("_")[3];
        let optionalDesign = getDesignById(designId);
        let isAddToCart = addToCart(Number(ctx.from.id), Number(designId), 1);
        await ctx.answerCbQuery(isAddToCart.message);
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(/remove_from_cart_/, async ctx => {
    // todo
});

bot.action(/confirm_order_/, async ctx => {
    // todo
});

bot.hears(/designer_/, botCommands.designerMenu);

bot.action(/confirm_design_/, async (ctx) => {
    try {
        consola.warn(ctx.update.callback_query.data);
        let designHashId = ctx.update.callback_query.data.split("_")[2];
        updateDesignByHashId(designHashId);
        await ctx.answerCbQuery("Dizayn tasdiqlandi!");
        await deleteMsg(ctx);
        await botCommands.start(ctx, ctx.update.callback_query.from);

    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(/cancel_design_/, async (ctx) => {
    try {
        consola.warn(ctx.update.callback_query.data);
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(Constant.CART, botCommands.cartView);

bot.hears(/cci_/, async ctx => {
    try {
        consola.box(ctx.message);
        let splitElement = ctx.message.text.split("_")[1];
        let cartId = Number(splitElement);
        let isDeleted = removeCartItem(cartId);
        if (isDeleted.success) {
            let message = await ctx.telegram.editMessageText(ctx.chat.id, ctx.message.message_id, null, "Mahsulot savatchadan o'chirildi!");
            let oldMessage = await ctx.editMessageText("Mahsulot savatchadan o'chirildi! ");
            consola.warn(oldMessage);
            consola.success(message);
            setTimeout(() => {
                deleteMsg(ctx);
            }, 3000);
        }
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action(Constant.ORDER, botCommands.orderRegister);

bot.action(Constant.CLEAR_CART, botCommands.clearCart);

bot.action('yes_clear_cart', async ctx => {
    try {
        let isCleared = clearCart(Number(ctx.from.id));
        if (isCleared) {
            await ctx.reply("Savatcha muvaffaqiyatli tozalandi!", {
                ...mainServicesButtons.inline()
            });
        } else {
            await ctx.answerCbQuery("Savatcha tozalashda xatolik yuz berdi!");
            return;
        }
        await deleteMsg(ctx);
    } catch (e) {
        consola.error(e.message);
    }
});

bot.action('no_clear_cart', async ctx => {
    try {
        await ctx.answerCbQuery("Savatcha tozalashni bekor qildingiz!");
        await deleteMsg(ctx);
        await botCommands.cartView(ctx);
    } catch (e) {
        consola.error(e.message);
    }
});

const deleteMsg = async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
    }
}

bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch({
    allowedUpdates: ["message", "callback_query"],
    dropPendingUpdates: true
}, () => {
    console.log("Bot is running...");
});


