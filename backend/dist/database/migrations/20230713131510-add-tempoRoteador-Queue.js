"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Queues", "tempoRoteador", {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Queues", "tempoRoteador");
    }
};
