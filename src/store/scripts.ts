import {
    addScript,
    deleteScriptById,
    deleteScriptsByCategory,
    getScriptById,
    getScriptsByPage,
    getTotalScriptCount,
    updateScript
} from '@/service/scripts';
import { create } from 'zustand';
import { useCategoryStore } from './categories';
import { DEFAULT_ALL, pageSize } from '@/utils/constants';


export const useScriptStore = create<ScriptState>((set, get) => ({
    scripts: [],
    total: 0,
    exportScripts: [],
    currentFilter: DEFAULT_ALL, // 默认值
    setCurrentFilter: (filter) => set({ currentFilter: filter }),
    // 分页加载脚本
    loadScripts: async (page, size, category) => {
        const [list, count] = await Promise.all([
            getScriptsByPage(category, page, size),
            getTotalScriptCount(category)
        ]);
        console.log('loadScripts', list);
        set({ scripts: list, total: count });
    },

    // 查询所有
    getExportScripts: async (category) => {
        const list = await getScriptsByPage(category, 1, 9999999);
        console.log('getScripts', list);
        set({ exportScripts: list });
    },

    // 添加脚本（并重新加载分页数据）
    addScript: async (script) => {
        await addScript(script);
        return true;
    },

    // 删除后刷新当前页数据
    deleteScript: async (id, page, size, category) => {
        await deleteScriptById(id);
        await get().loadScripts(page, size, category);
        return true;
    },

    // 更新脚本并刷新当前页
    updateScript: async (script) => {
        await updateScript(script);
        return true;
    },

    getScriptById: async (id) => {
        return await getScriptById(id); // ✅ 加入调用
    },

    deleteCategory: async (category) => {
        await deleteScriptsByCategory(category);
        await get().loadScripts(1, pageSize, DEFAULT_ALL);
        return await useCategoryStore.getState().deleteCategory(category);
    }
}));