const Database = require('better-sqlite3');
const {consola} = require("consola/basic");
const db = new Database('shopbot.db');

// SQL kodlarini ishga tushirish
db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT,
        full_name TEXT,
        first_name TEXT,
        last_name TEXT,
        personal_info TEXT,
        passport_image TEXT,
        user_bio TEXT,
        is_designer INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0,
        is_registered INTEGER DEFAULT 0,
        phone_number TEXT DEFAULT '',
        is_blocked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Designs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        designer_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        seller_price TEXT,
        photo TEXT,
        is_approved INTEGER DEFAULT 0,
        designer_price TEXT,
        approval_date DATETIME,
        category_id INTEGER,
        design_hash_id TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        design_id INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expected_completion_date DATETIME
    );

    CREATE TABLE IF NOT EXISTS Cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        design_id INTEGER,
        quantity INTEGER DEFAULT 1,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        order_received INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS CartItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER,
        design_id INTEGER,
        quantity INTEGER DEFAULT 1,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT
    );

    CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmation_id TEXT DEFAULT 0,
        is_approved INTEGER DEFAULT 0
    );
`);

const addNewUser = (telegram_id, username, first_name, last_name, personal_info, is_designer = 0, is_approved = 0) => {
    const stmt = db.prepare(`
    INSERT INTO Users (telegram_id, username, full_name, first_name, last_name, personal_info, is_designer, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
    stmt.run(telegram_id, username, first_name || "" + last_name || "", first_name || "", last_name || "", personal_info, is_designer, is_approved);
}

const updateUserById = (
    telegram_id,
    username,
    first_name,
    last_name,
    personal_info,
    passport_image,
    user_bio,
    is_designer = 0,
    is_approved = 0,
    phone_number = ""
) => {
    const stmt = db.prepare(`
    UPDATE Users SET username = ?, full_name = ?, first_name = ?, last_name = ?, personal_info = ?, is_designer = ?, is_approved = ?, user_bio = ?, passport_image = ?, phone_number = ?
    WHERE telegram_id = ?
`);
    stmt.run(username, (first_name || "" + last_name || ""), first_name || "", last_name || "", personal_info, is_designer, is_approved, user_bio, passport_image, phone_number, telegram_id);
}

const updatePhone = (telegram_id, phone_number) => {
    const stmt = db.prepare(`
    UPDATE Users SET phone_number = ? WHERE telegram_id = ?
`);
    stmt.run(phone_number, telegram_id);
}

const getDesigners = () => {
    const stmt = db.prepare(`
    SELECT * FROM Users WHERE is_designer = 1 AND is_approved = 1
`);
    return stmt.all();
}

const getDesigns = () => {
    const stmt = db.prepare(`
    SELECT * FROM Designs WHERE is_approved = 1
`);
    return stmt.all();
}

const approveDesigner = (telegram_id) => {
    const stmt = db.prepare(`
    UPDATE Users SET is_approved = 1, is_designer = 1 WHERE telegram_id = ?
`);
    stmt.run(telegram_id);
}

const registeredUser = (telegram_id) => {
    const stmt = db.prepare(`
    UPDATE Users SET is_registered = 1 WHERE telegram_id = ?
`);
    console.log(telegram_id);
    console.log("registered");
    stmt.run(telegram_id);
}

const addNewDesign = (designer_id, title, description, seller_price, designer_price, photo, category_id, design_hash_id) => {
    const stmt = db.prepare(`INSERT INTO Designs (designer_id, title, description, seller_price, designer_price, approval_date, photo, category_id, design_hash_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const approvalDate = new Date().toISOString();
    stmt.run(designer_id, title, description, seller_price, designer_price, approvalDate, photo, category_id, design_hash_id);
};

const approveDesign = (design_id) => {
    const stmt = db.prepare(`
    UPDATE Designs SET is_approved = 1 WHERE id = ?
`);
    stmt.run(design_id);
}

const updateDesignPrice = (design_id, price) => {
    const stmt = db.prepare(`
    UPDATE Designs SET seller_price = ? WHERE id = ?
`);
    stmt.run(price, design_id);
}

const getDesignById = (design_id) => {
    const stmt = db.prepare(`
    SELECT * FROM Designs WHERE id = ?
`);
    return stmt.get(design_id);
}

const updateDesignByHashId = (design_hash_id) => {
    const stmt = db.prepare(`
    UPDATE Designs SET is_approved = 1 WHERE design_hash_id = ?
`);
    stmt.run(design_hash_id);
};

const getAllActiveDesigns = (page, pageSize = 1) => {
    const offset = (page - 1) * pageSize;
    const stmt = db.prepare(`
        SELECT * FROM Designs WHERE is_approved = 1
        LIMIT ? OFFSET ?
    `);
    return stmt.all(pageSize, offset);
}

const getDesignsByCategory = (category_id) => {
    const stmt = db.prepare(`
    SELECT * FROM Designs WHERE category_id = ? AND is_approved = 1
`);
    return stmt.all(category_id);
}

const getDesignsByDesigner = (designer_id) => {
    const stmt = db.prepare(`
    SELECT * FROM Designs WHERE designer_id = ? AND is_approved = 1
`);
    return stmt.all(designer_id);
}

const getUserById = (telegram_id) => {
    const stmt = db.prepare(`
    SELECT * FROM Users WHERE telegram_id = ?
`);
    return stmt.get(telegram_id);
}

const editAdminStatus = async (telegram_id, is_admin) => {
    const stmt = db.prepare(`
    UPDATE Users SET is_admin = ? WHERE telegram_id = ?
`);
    stmt.run(is_admin, telegram_id);
}

const getAdmins = () => {
    const stmt = db.prepare(`
    SELECT * FROM Users WHERE is_admin = 1
`);
    return stmt.all();
}

const getAllDesigners = () => {
    const stmt = db.prepare(`
    SELECT * FROM Users WHERE is_designer = 1
`);
    return stmt.all();
}

const addNewCategory = (name, confirmation_id) => {
    const stmt = db.prepare(`INSERT INTO Categories (name, confirmation_id) VALUES (?, ?)`);
    stmt.run(name, confirmation_id);
}

const getCategoryByConfirmationId = (confirmation_id) => {
    const stmt = db.prepare(`SELECT * FROM Categories WHERE confirmation_id = ?`);
    return stmt.get(confirmation_id);
}

const approveCategory = (confirmation_id) => {
    const stmt = db.prepare(`UPDATE Categories SET is_approved = 1, confirmation_id = "" WHERE confirmation_id = ?`);
    consola.warn("[233]", confirmation_id);
    stmt.run(confirmation_id);
}

const confirmCategory = (confirmation_id) => {
    consola.warn("[238]", confirmation_id);

    const category = getCategoryByConfirmationId(confirmation_id);
    consola.warn("[239]", category);  // Debug maqsadida chiqarish

    if (!category) {
        consola.warn("Category not found");
        return;
    }

    try {
        const stmt = db.prepare(`UPDATE Categories SET is_approved = 1, confirmation_id = '' WHERE id = ?`);
        const info = stmt.run(category.id);
        consola.success("Category updated successfully", info);  // UPDATE muvaffaqiyatli bajarganini chiqarish

        // Yangilangan kategoriya haqida ma'lumotni chiqarish
        const updatedCategory = getCategoryById(category.id);
        consola.warn("[Updated Category]", updatedCategory);
    } catch (error) {
        consola.error("Failed to update category:", error.message);
    }
}

const deleteCategory = async (confirmation_id) => {
    const stmt = db.prepare(`DELETE FROM Categories WHERE confirmation_id = ?`);
    stmt.run(confirmation_id);
}

const getCategories = () => {
    const stmt = db.prepare(`SELECT * FROM Categories`);
    return stmt.all();
}

const getCategoryById = (category_id) => {
    if (typeof category_id === "string") {
        category_id = Number(category_id);
    }
    const stmt = db.prepare("SELECT * FROM Categories WHERE id = ?");
    return stmt.get(category_id);
};

const updateCategoryName = (category_id, name) => {
    const stmt = db.prepare(`UPDATE Categories SET name = ? WHERE id = ?`);
    stmt.run(name, category_id);
}

const addToCart = (user_id, design_id, quantity = 1) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO Cart (user_id, design_id, quantity) 
            VALUES (?, ?, ?)
        `);
        stmt.run(user_id, design_id, quantity);
        consola.success("Mahsulot cartga qo'shildi.");
        return {success: true, message: "Mahsulot cartga muvaffaqiyatli qo'shildi."};
    } catch (error) {
        consola.error("Mahsulotni cartga qo'shishda xatolik:", error.message);
        return {success: false, message: "Mahsulotni cartga qo'shishda xatolik yuz berdi."};
    }
};

const getCartView = async (user_id) => {
    const stmt = db.prepare(`
        SELECT * FROM Cart WHERE user_id = ?
    `);
    return stmt.all(user_id);
}

const getUserCartById = (user_id) => {
    const stmt = db.prepare(`
        SELECT * FROM Cart WHERE user_id = ?
    `);
    return stmt.all(user_id);
}

const removeCartItem = (cart_id) => {
    try {
        const stmt = db.prepare(`
        DELETE FROM Cart WHERE id = ?
    `);
        stmt.run(cart_id);
        consola.success("Mahsulot cartdan o'chirildi.");
        return {success: true, message: "Mahsulot cartdan muvaffaqiyatli o'chirildi."};
    } catch (e) {
        consola.error("Mahsulotni cartdan o'chirishda xatolik:", e.message);
        return {success: false, message: "Mahsulotni cartdan o'chirishda xatolik yuz berdi."};
    }
}

/**
 * Buyurtma qo'shish
 * @param customer_id
 * @param design_id
 * @param phone
 * @returns {{success: boolean, message: string}}
 */
const addOrder = (customer_id, design_id, phone) => {
    try {
        updatePhone(customer_id, phone);
        const stmt = db.prepare(`
        INSERT INTO Orders (customer_id, design_id, status) 
        VALUES (?, ?, ?)
    `);
        stmt.run(customer_id, design_id, "pending", phone);
        return {success: true, message: "Buyurtma muvaffaqiyatli qo'shildi."};
    } catch (e) {
        return {success: false, message: "Buyurtma qo'shishda xatolik yuz berdi."};
    }
};

/**
 * Savatchani tozalash
 * @param user_id
 * @returns {{success: boolean, message: string}}
 */
const clearCart = (user_id) => {
    try {
        const stmt = db.prepare(`
        DELETE FROM Cart WHERE user_id = ?
    `);
        stmt.run(user_id);
        return {success: true, message: "Savatcha muvaffaqiyatli tozalandi."};
    } catch (e) {
        return {success: false, message: "Savatchani tozalashda xatolik yuz berdi."};
    }
};



module.exports = {
    addNewUser,
    updateUserById,
    getDesigners,
    getDesigns,
    addNewDesign,
    approveDesigner,
    approveDesign,
    getDesignById,
    getDesignsByCategory,
    getDesignsByDesigner,
    getUserById,
    registeredUser,
    editAdminStatus,
    getAllDesigners,
    updateDesignPrice,
    addNewCategory,
    getCategories,
    approveCategory,
    deleteCategory,
    updateCategoryName,
    getAdmins,
    getCategoryById,
    confirmCategory,
    updateDesignByHashId,
    getAllActiveDesigns,
    addToCart,
    getUserCartById,
    getCartView,
    removeCartItem,
    addOrder,
    updatePhone,
    clearCart
};