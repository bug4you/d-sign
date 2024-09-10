const {Scenes} = require('telegraf');
const {addOrder} = require("../db/db");

// 1. Dizayn sarlavhasini qabul qilish uchun sahna
const orderUserName = new Scenes.BaseScene('order_registered');
orderUserName.enter(async ctx => {
    await ctx.reply("Biz siz bilan tez orada bog'lanamiz. Iltimos, ismingizni kiriting:");
});

orderUserName.on("text", async ctx => {
    try {
        let name = ctx.message.text;
        ctx.session.name = name;
        await ctx.scene.enter("order_user_phone");
    } catch (e) {
    }
});

const orderUserPhone = new Scenes.BaseScene('order_user_phone');
orderUserPhone.enter(async ctx => {
    await ctx.reply("Biz siz bilan bog'lana olishimiz uchun telefon raqamingizni kiriting: ");
});

orderUserPhone.on("text", async ctx => {
    try {
        let phone = ctx.message.text;
        ctx.session.phone = phone;
        let isAddOrder = addOrder(Number(ctx.from.id), ctx.session.name, ctx.session.phone);
        if (isAddOrder) {
            await ctx.reply("Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz!");
        } else {
            await ctx.reply("Xatolik yuz berdi! Iltimos, qayta urinib ko'ring!");

        }
    } catch (e) {
    }
});

// editCategoryNameScene.enter(async ctx => {
//     let text = "<i>Mavjud kategoriyalardan birining raqamini tanlash orqali uni tahrirlashingiz mumkin</i>\n\n";
//     getCategories().forEach((category) => {
//         text += `<i>/${category.id}</i>: <b>${category.name}</b>\n`;
//     });
//     text += `\n<i>/stop</i>: <b>Barchasini to'xtatish uchun</b>\n`;
//     await ctx.replyWithHTML(text);
// });
//
// editCategoryNameScene.on("text", async ctx => {
//     try {
//         let id = ctx.message.text;
//         if (id.startsWith("/")) {
//             id = id.slice(1);
//         }
//         if (ctx.message.text === "/stop") {
//             await ctx.scene.leave();
//             await ctx.reply("Tahrirni bekor qildingiz!", {
//                 ...getCategoryMenu.inline()
//             });
//             return;
//         }
//         let category = getCategories().find(category => category.id === Number(id));
//         if (!category) {
//             await ctx.reply("Bunday kategoriya mavjud emas!");
//             await ctx.scene.reenter();
//             return;
//         }
//         ctx.session.categoryId = category.id;
//         ctx.replyWithHTML(`Tanlangan kategoriya: <b>${category.name}</b>\n\nYangi kategoriya nomini kiriting: `);
//         await ctx.scene.enter("edit_category_name");
//     } catch (e) {
//     }
// });
//
// const editCategoryName = new Scenes.BaseScene('edit_category_name');
// editCategoryName.enter(async ctx => {
//     await ctx.answerCbQuery("Kategoriya nomini kiriting", {
//         show_alert: true
//     });
// });
//
//
// editCategoryName.on("text", async ctx => {
//     try {
//         let name = ctx.message.text;
//         updateCategoryName(ctx.session.categoryId, name);
//         await ctx.replyWithHTML("<b>Kategoriya nomi muvaffaqiyatli o'zgartirildi!</b>", {
//             ...getCategoryMenu.inline()
//         });
//         await ctx.scene.leave();
//     } catch (e) {
//     }
// });

// module.exports = {
//     editCategoryNameScene,
//     editCategoryName
// };
