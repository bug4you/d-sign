const {Keyboard} = require('telegram-keyboard');
const constant = require("./BotConstant");

const homeButtons = Keyboard.make([
    [constant.MAIN_SERVICES, constant.SHOP],
    [constant.PROFILE, constant.CART],
]);

const mainServicesButtons = Keyboard.make([
    [constant.MAIN]
]);

const cartViewButtons = Keyboard.make([
    [constant.ORDER],
    [constant.CLEAR_CART],
    [constant.MAIN]
]);

const profileButtons = Keyboard.make([
    [constant.MY_DATA],
    [constant.CART],
    [constant.BEING_DESIGNER],
    [constant.MAIN]
]);

const profileDataForDesigner = Keyboard.make([
    [constant.MY_DATA],
    [constant.REGISTER_NEW_DESIGN, constant.MY_INCOME],
    [constant.MAIN]
]);

const profileDataForUser = Keyboard.make([
    [constant.EDIT_PROFILE_DATA],
    [constant.BACK_TO_PROFILE],
    [constant.MAIN]
]);

const profileDataForAdmin = Keyboard.make([
    [constant.GET_ALL_DESIGNERS],
    [constant.STATISTICS],
    [constant.CATEGORY],
    [constant.MAIN]
]);

const getCategoryButtons = Keyboard.make([
    [constant.ADD_CATEGORY, constant.EDIT_CATEGORY],
    [constant.CATEGORY_LIST],
    [constant.BACK_TO_HOME]
]);

const approveDesignButtons = (design_id) => {
    return Keyboard.make([
        [{text: constant.CONFIRM, callback_data: `confirm_design_${design_id}`}],
        [{text: constant.CANCEL, callback_data: `cancel_design_${design_id}`}]
    ]);
}

const getCategoryMenu = Keyboard.make([
    [constant.BACK_TO_CATEGORY],
    [constant.BACK_TO_HOME]
]);

const confirmCategoryNameButtons = (code) => {
    return Keyboard.make([
        [{text: constant.CONFIRM, callback_data: `confirm_category_${code}`}],
        [{text: constant.CANCEL, callback_data: `cancel_category_${code}`}]
    ]);
};

/**
 * VIEW_PRODUCTS - Mahsulotlarni ko'rish
 * ACTIVE_ORDERS - Faol buyurtmalar
 * MY_ORDER - Buyurtmalarim
 * BACK - Orqaga
 * */
const getShopMenuButtons = () => {
    return Keyboard.make([
        [constant.VIEW_PRODUCTS],
        [constant.ACTIVE_ORDERS],
        [constant.MY_ORDER],
        [constant.MAIN]
    ]);
};


module.exports = {
    homeButtons,
    mainServicesButtons,
    profileButtons,
    profileDataForDesigner,
    profileDataForUser,
    profileDataForAdmin,
    approveDesignButtons,
    getCategoryButtons,
    confirmDesignTitleButtons: confirmCategoryNameButtons,
    getCategoryMenu,
    getShopMenuButtons,
    cartViewButtons
};
