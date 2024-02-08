"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePositionKanbanServices = void 0;
const Tag_1 = __importDefault(require("../../models/Tag"));
const UpdatePositionKanbanServices = async (data) => {
    data.map(async (item, index) => {
        if (item.id === 'lane0')
            return;
        const tag = await Tag_1.default.findByPk(item.id);
        if (!tag)
            return;
        await tag.update({ position: index });
    });
};
exports.UpdatePositionKanbanServices = UpdatePositionKanbanServices;
