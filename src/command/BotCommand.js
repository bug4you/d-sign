const {
    homeButtons,
    mainServicesButtons,
    profileButtons,
    profileDataForDesigner,
    profileDataForUser, profileDataForAdmin, getCategoryButtons, getCategoryMenu, getShopMenuButtons, cartViewButtons
} = require("./BotKeyboards");
const {
    getUserById,
    getAllDesigners,
    getCategories,
    deleteCategory, getAdmins, confirmCategory, getAllActiveDesigns, getDesigns, getCategoryById, getCartView,
    getDesignById
} = require("../db/db");
const {consola} = require("consola");
const {Keyboard} = require("telegram-keyboard");
const Constant = require("./BotConstant");


/**
 * Bot buyruqlari
 * @author Dilshod Fayzullayev
 * @license MIT
 */
class BotCommand {

    /**
     * Botni ishga tushirish
     * @param ctx
     * @param fromUser
     * @returns {Promise<void>}
     */
    async start(ctx, fromUser = null) {
        let from = getUserById(Number(ctx.from.id));
        try {
            await ctx.replyWithHTML(`<b>Assalomu alaykum, <a href="tg://user?id=${from?.id}">${from?.first_name}</a></b>\n\n<i>Bizning botimizga xush kelibsiz! Ushbu bot orqali bizning mavjud xizmatlarimiz orqali buyurtmangizni berishingiz mumkin.\n\nBotdan foydalanish uchun quyidagi buyruqlardan birini tanlang:</i>`, {
                parse_mode: "HTML",
                ...homeButtons.inline()
            });
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Asosiy xizmatlar
     * @param ctx
     * @returns {Promise<void>}
     */
    async mainServices(ctx) {
        await deleteMsg(ctx);
        try {
            await ctx.reply(`<i>Bizning xizmatlarimizdan birini tanlang:
<b>1. Brending va identifikatsiya</b>
   - Logo dizayni
   - Brending
<b>2. Grafik dizayn</b>
   - Kitob dizaynlari
   - Ijtimoiy tarmoqlar uchun post dizaynlari
   - Bolalar uchun illyustratsiyali kitoblar dizaynlari
   - Plakat dizaynlari
   - Flayerlar
   - Menyular
   - Taklifnomalar
   - Bannerlar
      - Talab bo'yicha chop etish uchun dizaynlar (futbolkalar, kepkalar, telefon qoplamalari, sumkalar)
<b>3. Interyer va eksteryer dizayn</b>
   - Interyer dizayn
   - Eksteryer dizayn
<b>4. Raqamli media</b>
   - Videolar
   - Animatsiyalar
   - prezentatsiyalar
<b>5. Vebsayt va ilova ishlab chiqish</b>
   - Veb-sayt yaratish
   - Ilova yaratish</i>`, {
                parse_mode: "HTML",
                ...mainServicesButtons.inline()
            });
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Profil
     * @param ctx
     * @returns {Promise<void>}
     */
    async profile(ctx) {
        await deleteMsg(ctx);
        let optionalUser = getUserById(Number(ctx.from.id));
        let buttons = profileButtons;
        if (optionalUser?.is_designer) {
            buttons = profileDataForDesigner;
        }
        if (optionalUser?.is_admin) {
            buttons = profileDataForAdmin;
        }
        try {
            await ctx.replyWithHTML(`<b>Shaxsiy kabinetingizga xush kelibsiz 😇</b>\n\n<i>Hop endi nima qilamiz pastki menyudan tanlang 🤗</i>`, {
                parse_mode: "HTML",
                ...buttons.inline()
            });
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Profil ma'lumotlari
     * @param ctx
     * @returns {Promise<void>}
     */
    async getProfileData(ctx) {
        let isDesigner = false;
        const profileDataButtons = isDesigner ? profileDataForDesigner : profileDataForUser;
        let user = await getUserById(Number(ctx.from.id));
        await ctx.replyWithHTML(`<b>📝 Sizning ma'lumotlaringiz:</b>\n\n<b>ID: </b><code>${user?.telegram_id}</code>\n<b>Ismi: </b><code>${user?.first_name}</code>\n<b>Familya: </b><code>${user?.last_name}</code>\n<b>Username: </b><code>${user?.username}</code>\n<b>Telegram raqami: </b><code>${user?.phone_number || ""}</code>`, {
            parse_mode: "HTML",
            ...profileDataButtons.inline()
        });
        await deleteMsg(ctx);
    }

    /**
     * Dizayner bo'lish
     * @param ctx
     * @returns {Promise<void>}
     */
    async beingDesigner(ctx) {
        try {
            await ctx.answerCbQuery("Siz dizayner bo'lishni xohlaysizmi?");
            await deleteMsg(ctx);
            await ctx.scene.enter("first_name");
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * Barcha dizaynerlar
     * @param ctx
     * @returns {Promise<void>}
     */
    async getAllDesigners(ctx) {
        let designers = getAllDesigners();
        await deleteMsg(ctx);
        let list = "";
        let index = 1;
        designers.forEach((designer) => {
            list += `<code>${index}</code>: <b>${designer.first_name} ${designer.last_name}</b>\n /designer_${designer.telegram_id}\n\n`;
        });

        await ctx.replyWithHTML(`<b>Barcha dizaynerlar:</b>\n\n${list}`, {
            ...mainServicesButtons.inline()
        });
    }

    /**
     * Yangi dizayn qo'shish
     * @param ctx
     * @returns {Promise<void>}
     */
    async addNewDesign(ctx) {
        await deleteMsg(ctx);
        await ctx.scene.enter("design_title");
    }

    /**
     * Dizaynni tasdiqlash
     * @param ctx
     * @param design_id
     * @returns {Promise<void>}
     */
    async approveDesign(ctx, design_id) {
        try {
            deleteMsg(ctx);
            await ctx.answerCbQuery("Dizayn tasdiqlandi!");
        } catch (e) {
        }
    }

    /**
     * Kategoriya menyusi
     * @param ctx
     * @returns {Promise<void>}
     */
    async getCategoryMenu(ctx) {
        await deleteMsg(ctx);
        try {
            await ctx.reply(`<b>Kategoryalar menyusiga xush kelibsiz endi nima qilamiz</b>`, {
                parse_mode: "HTML",
                ...getCategoryButtons.inline()
            });
        } catch (e) {
        }
    }

    /**
     * Kategoriya qo'shish
     * @param ctx
     * @returns {Promise<void>}
     */
    async addCategory(ctx) {
        await deleteMsg(ctx);
        try {
            await ctx.scene.enter("add_category");
        } catch (e) {
        }
    }

    /**
     * Kategoriya ro'yxati
     * @param ctx
     * @returns {Promise<void>}
     */
    async getCategoryList(ctx) {
        await deleteMsg(ctx);
        try {
            if (getCategories().length === 0) {
                await ctx.replyWithHTML("<b>Kategoryalar ro'yxati bo'sh</b>", {
                    ...getCategoryMenu.inline()
                });
                return;
            }
            let text = "<b>Kategoryalar ro'yxati:</b>\n\n";
            getCategories().forEach((category) => {
                text += `<code>${category.id}</code>: <b>${category.name}</b> <i>${category.is_approved ? "✔" : "🔍"}</i>\n`;
            });
            await ctx.replyWithHTML(text, {
                ...getCategoryMenu.inline()
            });
        } catch (e) {
        }
    }

    /**
     * Kategoriya tasdiqlash
     * @param ctx
     * @returns {Promise<void>}
     */
    async confirmCategoryTitle(ctx) {
        try {
            const id = ctx.update.callback_query.data.split("_")[2];
            consola.warn("ID: ", id);
            confirmCategory(id);
            await ctx.answerCbQuery("Kategoriya tasdiqlandi!");
        } catch (e) {
        }
        await deleteMsg(ctx);
    }

    /**
     * Kategoriya bekor qilish
     * @param ctx
     * @returns {Promise<void>}
     */
    async removeCategory(ctx) {
        await deleteMsg(ctx);
        try {
            let uid = ctx.update.callback_query.data.split("_")[2];
            await deleteCategory(uid);
            await ctx.answerCbQuery("Kategoriya bekor qilindi!");
        } catch (e) {
            console.log("error:", e.message)
        }
    }

    /**
     * Kategoriya tahrirlash
     * @param ctx
     * @returns {Promise<void>}
     */
    async editCategory(ctx) {
        await deleteMsg(ctx);
        try {
            await ctx.scene.enter("edit_category");
        } catch (e) {
        }
    }

    /**
     * Statistika adminlar uchun
     * @param ctx
     * @returns {Promise<void>}
     */
    async getStatistics(ctx) {
        try {
            getAdmins();
            await ctx.replyWithHTML(`<b>Statistika:</b>\n\n<b>👮‍♀️ Adminlar soni: </b><code>${getAdmins().length}</code>\n<b>👥 Foydalanuvchilar soni: </b><code>${getAllDesigners().length}</code>\n<b>👨‍🎨 Dizaynerlar soni: </b><code>${getAllDesigners().length}</code>\n<b>📝 Kategoriyalar soni: </b><code>${getCategories().length}</code>`, {
                ...mainServicesButtons.inline()
            });
            await deleteMsg(ctx);
        } catch (e) {
        }
    }

    /**
     * Do'kon menyusini ochish
     * @param ctx
     * @returns {Promise<void>}
     */
    async shopMenu(ctx) {
        try {
            await ctx.replyWithHTML("<b>🛒 Do'kon menyusiga xush kelibsiz</b>", {
                ...getShopMenuButtons().inline()
            });
            await deleteMsg(ctx);
        } catch (e) {
        }
    }

    /**
     * Mahsulotlarni ko'rish
     * @param {Context} ctx
     * @return {Promise<void>}
     * */
    async viewProducts(ctx) {
        try {
            const activeDesigns = getAllActiveDesigns(0, 1);

            if (activeDesigns.length === 0) {
                await ctx.answerCbQuery("Sizda hozircha dizaynlar yo'q!");
                return;
            }

            activeDesigns.forEach(design => {
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
                                callback_data: `back_to_${0}`
                            },
                            {
                                text: Constant.NEXT,
                                callback_data: `next_${1}`
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
    }

    /**
     * Dizayner menyusini ochish
     * @param {Context} ctx
     * @return {Promise<void>}
     * */
    async designerMenu(ctx) {
        consola.log("Designer menu called");
        consola.info(ctx.message.text);
        try {
            const id = ctx.message.text.split("_")[1];
            let optionalUser = getUserById(Number(id));
            if (optionalUser) {
                await ctx.replyWithPhoto(optionalUser?.passport_image, {
                    caption: `<b>👨‍🎨 Dizayner menyusiga xush kelibsiz</b>\n\n<b>Telegram ID:</b> <code>${optionalUser?.telegram_id}</code>\n<b>Ismi: </b><code>${optionalUser?.first_name}</code>\n<b>Familyasi: </b><code>${optionalUser?.last_name}</code>\n<b>Username: </b><code>${optionalUser?.username || ""}>Mavjud emas</a>}</code>\n<b>Telefon: </b><code>${optionalUser?.phone_number}</code>`,
                    parse_mode: "HTML",
                    ...mainServicesButtons.inline()
                });
            }
        } catch (e) {
            consola.error(e.message);
        }
    }

    /**
     * Savatcha
     * @param ctx
     * @returns {Promise<void>}
     */
    async cartView(ctx) {
        try {
            let carts = await getCartView(Number(ctx.from.id));
            if (carts.length === 0) {
                await ctx.replyWithHTML("<i>Savatchangiz bo'sh. Siz hali hech qanday maxsulotni tanlamagansiz?!</i>", {
                    ...mainServicesButtons.inline()
                });
                await deleteMsg(ctx);
                return;
            }
            let response = "<b>Savatcha:</b>\n\n";
            carts.forEach(cart => {
                let optionalDesign = getDesignById(cart.design_id);
                if (optionalDesign) {
                    response += `<b>ID: <code>${optionalDesign.id}</code>\nNomi: <code>${optionalDesign.title}</code>\nNarxi: <code>${optionalDesign.seller_price}</code>\nSoni: <code>${cart.quantity}</code></b>\n\n`;
                }
            });
            await ctx.replyWithHTML(response, {
                ...cartViewButtons.inline()
            });

            await deleteMsg(ctx);
        } catch (e) {
            consola.error(e.message);
        }
    }

    async orderRegister(ctx) {
        try {
            await ctx.scene.enter("order_register");
        } catch (e) {
            consola.error(e.message);
        }
    }

    async clearCart(ctx) {
        try {
            await ctx.scene.enter("clear_cart");
        } catch (e) {
            consola.error(e.message);
        }
    }
}

/**
 * Xabarni o'chirish
 * @param ctx
 * @returns {Promise<void>}
 */
const deleteMsg = async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
    }
}

const designCard = async (ctx) => {
    try {
        const designs = getDesigns();
        designs.forEach(design => {
            ctx.replyWithPhoto(design.photo, {
                caption: `<b>📝 Dizayn:</b>\n\n<b>Sarlavha: </b><code>${design.title}</code>\n<b>Tavsif: </b><code>${design.description}</code>\n<b>Narx: </b><code>${design.seller_price}</code>\n\n<b>Ma'lumotlaringiz muvaffaqiyatli saqlandi va tasdiqlash uchun administratorga jo'natildi!</b>`,
                parse_mode: "HTML",
                ...Keyboard.make([
                    [Constant.ADD_TO_CART],
                ])
            });
        });
    } catch (e) {
        consola.error(e.message);
    }
}

module.exports = BotCommand;